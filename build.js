const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const sourcePath = path.join(__dirname, 'index.html');
const outDir = path.join(__dirname, 'public');
const outPath = path.join(outDir, 'index.html');

const html = fs.readFileSync(sourcePath, 'utf8');

const openTag = '<script type="text/babel" data-presets="react">';
const openIdx = html.indexOf(openTag);
if (openIdx === -1) throw new Error('No se encontró el bloque JSX fuente en index.html');
const start = openIdx + openTag.length;
const end = html.indexOf('</script>', start);
if (end === -1) throw new Error('No se encontró el cierre del bloque JSX');

const jsx = html.slice(start, end);
const { code } = babel.transformSync(jsx, {
  presets: [['@babel/preset-react', { runtime: 'classic' }]],
  compact: true,
  comments: false,
});

// Un "</script>" literal dentro de un string JS rompería el documento HTML
const safeCode = code.replace(/<\/script>/g, '<\\/script>');

let out = html.slice(0, openIdx) + '<script>\n' + safeCode + '\n</script>' + html.slice(end + '</script>'.length);
out = out.replace(/[ \t]*<script src="https:\/\/unpkg\.com\/@babel\/standalone[^"]*"><\/script>\r?\n?/, '');

if (out.includes('text/babel')) throw new Error('El artefacto todavía contiene un bloque text/babel');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, out, 'utf8');

console.log(`Build OK: public/index.html (${Math.round(out.length / 1024)} KB, JSX precompilado, sin Babel en runtime)`);
