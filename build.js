const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'index.html');
const outputDirs = [
  path.join(__dirname, 'public'),
  path.join(__dirname, 'dist'),
];

let html = fs.readFileSync(sourcePath, 'utf8');

html = html.replace(
  '<script type="text/babel">',
  '<script type="text/babel" data-presets="env,react">'
);

// Keep the repository root file patched for local/static fallback.
fs.writeFileSync(sourcePath, html, 'utf8');

// Vercel is configured to serve the public directory after build.
// The previous build failed because no public output directory existed.
for (const outputDir of outputDirs) {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8');
}

console.log('Built public/index.html with Babel presets enabled.');
