const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'index.html');
const outputDir = path.join(__dirname, 'dist');
const outputPath = path.join(outputDir, 'index.html');

let html = fs.readFileSync(sourcePath, 'utf8');

html = html.replace(
  '<script type="text/babel">',
  '<script type="text/babel" data-presets="env,react">'
);

// Patch the served root file during Vercel's build step.
fs.writeFileSync(sourcePath, html, 'utf8');

// Also emit a dist copy in case the project later uses an output directory.
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, html, 'utf8');

console.log('Built index.html with Babel presets enabled.');
