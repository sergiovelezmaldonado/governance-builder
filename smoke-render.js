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
vm.runInContext(code + '\n;globalThis.__App = App; globalThis.__cmp = { DonutScore, RiskMatrix, DocCategoryBars, ActivityFeed, matrixZone, calculateReadinessScore, buildDocument, docTypes, GPT_LIBRARY };', sandbox);
const out = ReactDOMServer.renderToString(React.createElement(sandbox.__App));

// Fix de puntaje: organización en blanco = 0; "No existe política formal" no suma bonus
const { calculateReadinessScore: calc, buildDocument: bd, docTypes: dts, GPT_LIBRARY: lib } = sandbox.__cmp;
const blankOrg = { name: '', type: 'Pyme', sensitiveData: 'Sí, ocasionalmente', maturity: 'Exploración inicial', policy: 'No existe política formal', tools: [] };
const namedOrg = { ...blankOrg, name: 'Prueba SA' };
const formalOrg = { ...namedOrg, policy: 'Existe política formal' };
let failedLogic = 0;
for (const [name, ok] of [
  ['puntaje org en blanco = 0', calc(blankOrg, []) === 0],
  ['sin bonus con "No existe política formal"', calc(namedOrg, []) === 30],
  ['bonus solo con política formal real', calc(formalOrg, []) === 48],
  ['25 tipos de documento', dts.length === 25],
  ['registro de activos renombrado', dts.includes('Registro de activos de IA personalizados') && bd('Registro de activos de IA personalizados', namedOrg, []).includes('REGISTRO DE ACTIVOS DE IA PERSONALIZADOS')],
  ['biblioteca con 120 activos', lib.length === 120],
  ['biblioteca con tipos nuevos', lib.some((g) => g.kind === 'Agente autónomo') && lib.some((g) => g.kind === 'Automatización / Flujo')],
]) {
  console.log((ok ? 'OK   ' : 'FALTA') + ' — lógica: ' + name);
  if (!ok) failedLogic++;
}

// Componentes del dashboard con datos de muestra
const { DonutScore, RiskMatrix, DocCategoryBars, ActivityFeed, matrixZone } = sandbox.__cmp;
const sampleCases = [
  { id: 1, name: 'Caso A', prob: 'Alta', impact: 'Crítico', level: 'Crítico', automation: 'Alta' },
  { id: 2, name: 'Caso legado', level: 'Medio', automation: 'Media' }, // sin prob/impact: usa inferencia
];
const dash = ReactDOMServer.renderToString(React.createElement('div', null,
  React.createElement(DonutScore, { score: 62, label: 'En construcción' }),
  React.createElement(RiskMatrix, { cases: sampleCases }),
  React.createElement(DocCategoryBars, { docStats: { 'Política completa de uso responsable de IA': 3, 'Anexo legal y de compliance': 1 } }),
  React.createElement(ActivityFeed, { activity: [{ ts: 1752500000000, text: 'Caso de uso registrado: "Caso A"' }] })
));
let failedDash = 0;
const dashChecks = [
  ['donut 62', dash.includes('>62<')],
  ['matriz zonas', dash.includes('Probabilidad') && dash.includes('Impacto')],
  ['docs barras', dash.includes('Políticas') && dash.includes('Anexos y mapeo')],
  ['actividad', dash.includes('Caso de uso registrado')],
  ['zona crítica correcta', matrixZone(2, 3).label === 'Crítico' && matrixZone(0, 0).label === 'Bajo'],
];
for (const [name, ok] of dashChecks) {
  console.log((ok ? 'OK   ' : 'FALTA') + ' — dashboard: ' + name);
  if (!ok) failedDash++;
}

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
process.exit(failed + failedDash + failedLogic ? 1 : 0);
