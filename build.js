const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'index.html');
const outDir = path.join(__dirname, 'public');
const outPath = path.join(outDir, 'index.html');

let html = fs.readFileSync(sourcePath, 'utf8');

html = html
  .replace('<script type="text/babel" data-presets="env,react">', '<script type="text/babel" data-presets="react">')
  .replace('<script type="text/babel">', '<script type="text/babel" data-presets="react">');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, html, 'utf8');

console.log('Built public/index.html with React-only Babel preset.');
