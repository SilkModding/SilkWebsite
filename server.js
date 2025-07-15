import express from "express";
import fs from "fs";
import path from "path";
import { marked } from "marked";
import multer from "multer";
import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure file upload storage
const uploadsDir = path.join(__dirname, "uploads");
const modsDir = path.join(__dirname, "uploads", "mods");
const modIconsDir = path.join(__dirname, "uploads", "mod-icons");

// Create upload directories if they don't exist
[uploadsDir, modsDir, modIconsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "modFile") {
      cb(null, modsDir);
    } else if (file.fieldname === "icon") {
      cb(null, modIconsDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = {
    modFile: [".zip", ".silkmod", ".dll"],
    icon: [".jpg", ".jpeg", ".png", ".gif"],
  };

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedFileTypes[file.fieldname]?.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 2, // Max 2 files (mod + icon)
  },
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files
app.use(express.static(path.join(__dirname, "src", "public")));

// Markdown directory
const markdownDir = path.join(__dirname, "markdown");

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

// Function to get documentation structure
const getDocsStructure = () => {
  const structure = [];
  const categories = fs.readdirSync(markdownDir, { withFileTypes: true });

  for (const category of categories) {
    if (category.isDirectory()) {
      const categoryName = category.name;
      const categoryPath = path.join(markdownDir, categoryName);
      const pages = fs
        .readdirSync(categoryPath)
        .filter((file) => file.endsWith(".md"))
        .map((file) => ({
          name: file.replace(".md", ""),
          path: path.join(categoryName, file.replace(".md", "")),
        }));

      if (pages.length > 0) {
        structure.push({
          name: categoryName
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          id: categoryName,
          pages,
        });
      }
    } else if (category.name.endsWith(".md")) {
      structure.push({
        name: category.name
          .replace(".md", "")
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        path: category.name.replace(".md", ""),
      });
    }
  }

  return structure;
};

// Function to get all pages as a flat list
const getAllPages = () => {
  const structure = getDocsStructure();
  const pages = [];

  for (const item of structure) {
    if (item.pages) {
      for (const page of item.pages) {
        pages.push({
          name: page.name,
          path: page.path,
          category: item.name,
        });
      }
    } else {
      pages.push({
        name: item.name,
        path: item.path,
        category: "General",
      });
    }
  }

  return pages;
};

// Marked.js configuration
marked.setOptions({
  highlight: function (code, lang) {
    if (prism.languages[lang]) {
      return prism.highlight(code, prism.languages[lang], lang);
    } else {
      return code;
    }
  },
  // Support for custom containers like :::note, :::warning, etc.
  extensions: [
    {
      name: "customContainers",
      level: "block",
      start: (src) =>
        src.match(/^:::(note|warning|tip|info|danger)\s*\n/)?.index,
      tokenizer(src, tokens) {
        const rule =
          /^:::(note|warning|tip|info|danger)\s*\n([\s\S]*?)\n(?:\n|$)/;
        const match = rule.exec(src);
        if (match) {
          return {
            type: "customContainers",
            raw: match[0],
            containerType: match[1],
            text: match[2],
            tokens: this.lexer.blockTokens(match[2], []),
          };
        }
      },
      renderer(token) {
        return `<div class="alert alert-${
          token.containerType
        }">${this.parser.parse(token.tokens)}</div>`;
      },
    },
  ],
});

// Update the docs routes
const docsTemplate = fs.readFileSync(
  path.join(__dirname, "src", "docs.html"),
  "utf8"
);

const renderSidebar = (activePage = "") => {
  const structure = getDocsStructure();
  let sidebarHtml = '<div class="sidebar-inner">\n';

  for (const category of structure) {
    if (category.pages) {
      // Category with pages
      const isActive = category.pages.some(
        (page) => page.path === activePage || `/${page.path}` === activePage
      );

      sidebarHtml += `
        <div class="sidebar-category ${isActive ? "expanded" : ""}">
          <div class="category-header">
            <span>${category.name}</span>
            <span class="toggle-icon">${isActive ? "−" : "+"}</span>
          </div>
          <ul class="category-pages" ${
            isActive ? "" : 'style="display: none;"'
          }>
            ${category.pages
              .map((page) => {
                const isActivePage =
                  page.path === activePage || `/${page.path}` === activePage;
                return `
                <li class="${isActivePage ? "active" : ""}">
                  <a href="/docs/${page.path}">${page.name}</a>
                </li>`;
              })
              .join("\n")}
          </ul>
        </div>`;
    } else {
      // Single page
      const isActive =
        category.path === activePage || `/${category.path}` === activePage;
      sidebarHtml += `
        <div class="sidebar-page">
          <a href="/docs/${category.path}" class="${isActive ? "active" : ""}">
            ${category.name}
          </a>
        </div>`;
    }
  }

  sidebarHtml += "\n</div>";
  return sidebarHtml;
};

// Home documentation page
app.get("/docs", (req, res) => {
  const sidebar = renderSidebar("");

  const fullPage = docsTemplate
    .replace(
      "<!--SIDEBAR-->",
      `
    <div class="sidebar" id="sidebar">
      <div class="search-box">
        <input type="text" id="doc-search" placeholder="Search documentation">
        <button id="search-btn">Search</button>
      </div>
      ${sidebar}
    </div>
  `
    )
    .replace(
      "<!--CONTENT-->",
      `
    <div class="docs-content">
      <h1>Silk Documentation</h1>
      <div class="welcome-message">
        <p>Welcome to the Silk documentation! Here you'll find everything you need to know about creating, installing, and working with mods for SpiderHeck.</p>
        <div class="quick-links">
          <a href="/docs/getting-started/installation" class="quick-link">
            <h3>Getting Started</h3>
            <p>New to Silk? Start here to get up and running.</p>
          </a>
          <a href="/docs/guides/making-mods" class="quick-link">
            <h3>Making Mods</h3>
            <p>Learn how to create your own mods for SpiderHeck.</p>
          </a>
          <a href="/docs/guides/installing-mods" class="quick-link">
            <h3>Installing Mods</h3>
            <p>How to install and manage mods with Silk.</p>
          </a>
        </div>
      </div>
    </div>
  `
    );

  res.send(fullPage);
});

// Documentation page
app.get("/docs/:category/:page", (req, res) => {
  const { category, page } = req.params;
  const pagePath = path.join(category, page);
  const mdPath = path.join(markdownDir, category, `${page}.md`);

  if (!fs.existsSync(mdPath)) {
    res.status(404).send("Documentation page not found");
    return;
  }

  const markdownContent = fs.readFileSync(mdPath, "utf8");
  const htmlContent = marked(markdownContent);

  // Add edit on GitHub link
  const editLink = `https://github.com/SilkModding/SilkWebsite/edit/main/markdown/${category}/${page}.md`;
  const contentWithEditLink = `
    <div class="content-header">
      <a href="${editLink}" class="edit-link" target="_blank">
        <i class="fas fa-edit"></i> Edit this page on GitHub
      </a>
    </div>
    ${htmlContent}
  `;

  const sidebar = renderSidebar(`/${category}/${page}`);

  const fullPage = docsTemplate
    .replace(
      "<!--SIDEBAR-->",
      `
    <div class="sidebar" id="sidebar">
      <div class="search-box">
        <input type="text" id="doc-search" placeholder="Search documentation">
        <button id="search-btn">Search</button>
      </div>
      ${sidebar}
    </div>
  `
    )
    .replace(
      "<!--CONTENT-->",
      `
    <div class="docs-content">
      ${contentWithEditLink}
    </div>
  `
    );

  res.send(fullPage);
});

// Support for old direct page links
app.get("/docs/:page", (req, res) => {
  const page = req.params.page;
  const mdPath = path.join(markdownDir, `${page}.md`);

  if (fs.existsSync(mdPath)) {
    // If it's a direct page, redirect to the new URL structure
    res.redirect(301, `/docs/general/${page}`);
  } else {
    // Try to find the page in subdirectories
    const allPages = getAllPages();
    const foundPage = allPages.find(
      (p) => p.name.toLowerCase() === page.toLowerCase()
    );

    if (foundPage) {
      res.redirect(301, `/docs/${foundPage.path}`);
    } else {
      res.status(404).send("Documentation page not found");
    }
  }
});

// Handle other routes
app.get("/download", (req, res) => {
  const htmlPath = path.join(__dirname, "src", "download.html");

  fs.readFile(htmlPath, "utf8", (err, data) => {
    if (err) {
      res.status(404).send("Source page not found");
      return;
    }

    res.send(data);
  });
});

// API: Get all mods
app.get("/api/mods", (req, res) => {
  try {
    const modsPath = path.join(__dirname, "data", "mods.json");
    if (fs.existsSync(modsPath)) {
      const mods = JSON.parse(fs.readFileSync(modsPath, "utf8"));
      res.json(mods);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching mods:", error);
    res.status(500).json({ error: "Failed to fetch mods" });
  }
});

// API: Upload new mod
app.post(
  "/api/mods",
  upload.fields([
    { name: "modFile", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files || !req.files.modFile) {
        return res.status(400).json({ error: "Mod file is required" });
      }

      const { name, description, version, author } = req.body;
      if (!name || !description || !version || !author) {
        // Clean up uploaded files if validation fails
        if (req.files.modFile) {
          fs.unlinkSync(req.files.modFile[0].path);
        }
        if (req.files.icon) {
          fs.unlinkSync(req.files.icon[0].path);
        }
        return res.status(400).json({ error: "All fields are required" });
      }

      // Get file stats for size
      const modFileStats = fs.statSync(req.files.modFile[0].path);

      const modData = {
        id: crypto.randomUUID(),
        name,
        description,
        version,
        author,
        fileName: req.files.modFile[0].filename,
        filePath: `/uploads/mods/${req.files.modFile[0].filename}`,
        fileSize: modFileStats.size,
        iconPath: req.files.icon
          ? `/uploads/mod-icons/${req.files.icon[0].filename}`
          : "/assets/mods/default.jpg",
        uploadDate: new Date().toISOString(),
        downloads: 0,
        lastDownloaded: null,
      };

      // Save mod metadata
      const modsPath = path.join(__dirname, "data");
      if (!fs.existsSync(modsPath)) {
        fs.mkdirSync(modsPath, { recursive: true });
      }

      let mods = [];
      const modsFilePath = path.join(modsPath, "mods.json");
      if (fs.existsSync(modsFilePath)) {
        mods = JSON.parse(fs.readFileSync(modsFilePath, "utf8"));
      }

      mods.push(modData);
      fs.writeFileSync(modsFilePath, JSON.stringify(mods, null, 2));

      res.status(201).json(modData);
    } catch (error) {
      console.error("Error uploading mod:", error);
      res.status(500).json({ error: "Failed to upload mod" });
    }
  }
);

// Serve mod files
app.use("/uploads", express.static(uploadsDir));

// Download mod file
app.get("/download/mod/:id", (req, res) => {
  try {
    const modsPath = path.join(__dirname, "data", "mods.json");
    if (!fs.existsSync(modsPath)) {
      return res.status(404).send("Mod not found");
    }

    const mods = JSON.parse(fs.readFileSync(modsPath, "utf8"));
    const mod = mods.find((m) => m.id === req.params.id);

    if (!mod) {
      return res.status(404).send("Mod not found");
    }

    const filePath = path.join(modsDir, mod.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Mod file not found");
    }

    try {
      // Update download count and last downloaded timestamp
      mod.downloads = (mod.downloads || 0) + 1;
      mod.lastDownloaded = new Date().toISOString();

      // Get current file stats to update the size in case it changed
      const stats = fs.statSync(filePath);
      mod.fileSize = stats.size;

      // Save the updated mod data
      fs.writeFileSync(modsPath, JSON.stringify(mods, null, 2));

      // Set headers for better download experience
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${mod.fileName}"`
      );
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Length", stats.size);

      // Stream the file for download
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error preparing download:", error);
      res.status(500).send("Error preparing file for download");
    }
  } catch (error) {
    console.error("Error downloading mod:", error);
    res.status(500).send("Error downloading mod");
  }
});

// Serve mods page
app.get("/mods", (req, res) => {
  const htmlPath = path.join(__dirname, "src", "mods.html");
  res.sendFile(htmlPath);
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
