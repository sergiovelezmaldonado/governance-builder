const fs = require('fs');
const vm = require('vm');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const html = fs.readFileSync('public/index.html', 'utf8');
const m = html.match(/<script>\n([\s\S]*?)\n<\/script>/);
if (!m) throw new Error('No se encontró el script compilado');
let code = m[1].split('<\\/script>').join('</scr' + 'ipt>');
code = code.replace(/ReactDOM\.createRoot[\s\S]*$/, '');

const storage = {
  _d: {},
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
  setItem(k, v) { this._d[k] = String(v); },
  removeItem(k) { delete this._d[k]; },
};
const sandbox = {
  React,
  ReactDOM: {},
  localStorage: storage,
  window: {},
  document: {
    createElement: () => ({ style: {}, setAttribute() {}, click() {} }),
    head: { appendChild() {} },
    body: { appendChild() {}, removeChild() {} },
    getElementById: () => null,
  },
  URL: { createObjectURL: () => '', revokeObjectURL() {} },
  Blob: function () {},
  FileReader: function () {},
  console, setTimeout, clearTimeout, Date, Math, JSON, Intl,
  encodeURIComponent, decodeURIComponent, navigator: {},
};
vm.createContext(sandbox);
vm.runInContext(code + '\n;globalThis.__App = App;', sandbox);
const out = ReactDOMServer.renderToString(React.createElement(sandbox.__App));

const checks = [
  'Governance Builder',
  '¿Cómo usar el Governance Builder?',
  'carga un ejemplo completo',
  '¿Necesitas asesoría?',
  'Organización activa',
  'Nueva organización',
  'Módulos activos',
];
let failed = 0;
for (const c of checks) {
  const ok = out.includes(c);
  console.log((ok ? 'OK   ' : 'FALTA') + ' — ' + c);
  if (!ok) failed++;
}
console.log('HTML renderizado: ' + Math.round(out.length / 1024) + ' KB');
process.exit(failed ? 1 : 0);
