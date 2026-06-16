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

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, html, 'utf8');

console.log('Built dist/index.html with Babel presets enabled.');
