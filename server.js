const express = require("express");
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const app = express();

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

app.get("/mods", (req, res) => {
  const htmlPath = path.join(__dirname, "src", "mods.html");

  fs.readFile(htmlPath, "utf8", (err, data) => {
    if (err) {
      res.status(404).send("Source page not found");
      return;
    }

    res.send(data);
  });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
