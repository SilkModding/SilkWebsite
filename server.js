const express = require("express");
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const multer = require("multer");
const crypto = require("crypto");
const app = express();

// Configure file upload storage
const uploadsDir = path.join(__dirname, 'uploads');
const modsDir = path.join(__dirname, 'uploads', 'mods');
const modIconsDir = path.join(__dirname, 'uploads', 'mod-icons');

// Create upload directories if they don't exist
[uploadsDir, modsDir, modIconsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'modFile') {
      cb(null, modsDir);
    } else if (file.fieldname === 'icon') {
      cb(null, modIconsDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = {
    'modFile': ['.zip', '.silkmod'],
    'icon': ['.jpg', '.jpeg', '.png', '.gif']
  };
  
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedFileTypes[file.fieldname]?.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 2 // Max 2 files (mod + icon)
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, "src", "public")));

// Markdown directory
const markdownDir = path.join(__dirname, "markdown");

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

// Function to get available markdown files
const getDocsPages = () => {
  return fs
    .readdirSync(markdownDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(".md", ""));
};
// Update the docs routes
const docsTemplate = fs.readFileSync(
  path.join(__dirname, "src", "docs.html"),
  "utf8"
);

app.get("/docs", (req, res) => {
  const pages = getDocsPages();
  const sidebar = pages
    .map((page) => `<li><a href="/docs/${page}">${page}</a></li>`)
    .join("");

  const fullPage = docsTemplate
    .replace(
      '<div class="sidebar" id="sidebar"></div>',
      `<div class="sidebar" id="sidebar">
        <h2>Documentation</h2>
        <ul>${sidebar}</ul>
       </div>`
    )
    .replace(
      '<div class="docs-content" id="content"></div>',
      `<div class="docs-content">
        <h1>Silk Documentation</h1>
        <p>Welcome! You can find a mirror of the documentation on <a href="https://github.com/SilkModding/Silk/wiki">the GitHub wiki</a> if you prefer.</p>
        <p>Select a topic from the sidebar to get started.</p>
       </div>`
    );

  res.send(fullPage);
});

app.get("/docs/:page", (req, res) => {
  const page = req.params.page;
  const mdPath = path.join(markdownDir, `${page}.md`);

  if (!fs.existsSync(mdPath)) {
    res.status(404).send("Documentation page not found");
    return;
  }

  const pages = getDocsPages();
  const sidebar = pages
    .map((p) => `<li><a href="/docs/${p}">${p}</a></li>`)
    .join("");

  const markdownContent = fs.readFileSync(mdPath, "utf8");
  const htmlContent = marked(markdownContent);

  const fullPage = docsTemplate
    .replace(
      '<div class="sidebar" id="sidebar"></div>',
      `<div class="sidebar" id="sidebar">
        <h2>Documentation</h2>
        <ul>${sidebar}</ul>
       </div>`
    )
    .replace(
      '<div class="docs-content" id="content"></div>',
      `<div class="docs-content">${htmlContent}</div>`
    );

  res.send(fullPage);
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
    const modsPath = path.join(__dirname, 'data', 'mods.json');
    if (fs.existsSync(modsPath)) {
      const mods = JSON.parse(fs.readFileSync(modsPath, 'utf8'));
      res.json(mods);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching mods:', error);
    res.status(500).json({ error: 'Failed to fetch mods' });
  }
});

// API: Upload new mod
app.post('/api/mods', upload.fields([
  { name: 'modFile', maxCount: 1 },
  { name: 'icon', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.modFile) {
      return res.status(400).json({ error: 'Mod file is required' });
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
      return res.status(400).json({ error: 'All fields are required' });
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
      iconPath: req.files.icon ? `/uploads/mod-icons/${req.files.icon[0].filename}` : '/assets/mods/default.jpg',
      uploadDate: new Date().toISOString(),
      downloads: 0,
      lastDownloaded: null
    };

    // Save mod metadata
    const modsPath = path.join(__dirname, 'data');
    if (!fs.existsSync(modsPath)) {
      fs.mkdirSync(modsPath, { recursive: true });
    }

    let mods = [];
    const modsFilePath = path.join(modsPath, 'mods.json');
    if (fs.existsSync(modsFilePath)) {
      mods = JSON.parse(fs.readFileSync(modsFilePath, 'utf8'));
    }

    mods.push(modData);
    fs.writeFileSync(modsFilePath, JSON.stringify(mods, null, 2));

    res.status(201).json(modData);
  } catch (error) {
    console.error('Error uploading mod:', error);
    res.status(500).json({ error: 'Failed to upload mod' });
  }
});

// Serve mod files
app.use('/uploads', express.static(uploadsDir));

// Download mod file
app.get('/download/mod/:id', (req, res) => {
  try {
    const modsPath = path.join(__dirname, 'data', 'mods.json');
    if (!fs.existsSync(modsPath)) {
      return res.status(404).send('Mod not found');
    }

    const mods = JSON.parse(fs.readFileSync(modsPath, 'utf8'));
    const mod = mods.find(m => m.id === req.params.id);
    
    if (!mod) {
      return res.status(404).send('Mod not found');
    }

    const filePath = path.join(modsDir, mod.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Mod file not found');
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
      res.setHeader('Content-Disposition', `attachment; filename="${mod.fileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', stats.size);
      
      // Stream the file for download
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error preparing download:', error);
      res.status(500).send('Error preparing file for download');
    }
  } catch (error) {
    console.error('Error downloading mod:', error);
    res.status(500).send('Error downloading mod');
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
