#!/usr/bin/env node
/**
 * Scan target project and scaffold docs/codebase-docs/ (HTML + Markdown).
 * Run from setup-cursor.sh or standalone:
 *   node scripts/generate-codebase-docs.mjs /path/to/project [--force]
 */

import fs from 'fs';
import path from 'path';

const projectPath = path.resolve(process.argv[2] || process.cwd());
const force = process.argv.includes('--force');
const docsRoot = path.join(projectPath, 'docs', 'codebase-docs');
const featuresDir = path.join(docsRoot, 'features');
const templatesDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'docs-templates');

const TODAY = new Date().toLocaleDateString('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function findDir(candidates) {
  for (const rel of candidates) {
    const p = path.join(projectPath, rel);
    if (exists(p) && fs.statSync(p).isDirectory()) return { rel, abs: p };
  }
  return null;
}

function listDirs(dir) {
  if (!dir || !exists(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();
}

function countFiles(dir, ext = '.js') {
  if (!exists(dir)) return 0;
  let n = 0;
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory() && ent.name !== 'node_modules') walk(p);
      else if (ent.isFile() && ent.name.endsWith(ext)) n += 1;
    }
  };
  walk(dir);
  return n;
}

function toSlug(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function toTitle(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/Container$/i, '')
    .trim();
}

function readPackageJson() {
  const p = path.join(projectPath, 'package.json');
  if (!exists(p)) return { name: path.basename(projectPath), version: '', deps: {} };
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function detectStack(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const parts = [];
  if (deps['react-native']) parts.push(`React Native ${deps['react-native']}`);
  else if (deps.react) parts.push(`React ${deps.react}`);
  if (deps.next) parts.push(`Next.js ${deps.next}`);
  if (deps.express) parts.push('Express');
  if (deps.vue) parts.push('Vue');
  return parts.length ? parts.join(', ') : '_(ระบุ stack ใน package.json)_';
}

function listFilesInDir(dir, ext) {
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .sort();
}

function scanContainers(containersAbs) {
  return listDirs(containersAbs).map((name) => {
    const abs = path.join(containersAbs, name);
    const files = [];
    const walk = (d, prefix = '') => {
      for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
        const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
        const p = path.join(d, ent.name);
        if (ent.isDirectory()) walk(p, rel);
        else if (/\.(js|jsx|ts|tsx)$/.test(ent.name)) files.push(rel);
      }
    };
    walk(abs);
    return {
      name,
      slug: toSlug(name),
      title: toTitle(name),
      relPath: path.relative(projectPath, abs),
      files,
    };
  });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildNav(features, active, depth = 0) {
  const prefix = depth === 0 ? '' : '../';
  const core = [
    ['index.html', 'Home', '&#127968;', active === 'index'],
    ['overview.html', 'Overview', '&#128196;', active === 'overview'],
    ['architecture.html', 'Architecture', '&#128193;', active === 'architecture'],
    ['navigation.html', 'Navigation', '&#128268;', active === 'navigation'],
    ['state-management.html', 'State Management', '&#128202;', active === 'state-management'],
    ['api-layer.html', 'API Layer', '&#128274;', active === 'api-layer'],
    ['components.html', 'Components', '&#129513;', active === 'components'],
    ['theme-styling.html', 'Theme & Styling', '&#127912;', active === 'theme-styling'],
    ['utilities.html', 'Utilities', '&#128295;', active === 'utilities'],
  ];

  let html = core
    .map(([href, label, icon, isActive]) => {
      const cls = isActive ? ' class="active"' : '';
      return `<a href="${prefix}${href}"${cls}><span class="nav-icon">${icon}</span> ${label}</a>`;
    })
    .join('\n        ');

  html += '\n        <div class="nav-section">Features</div>\n        ';
  html += features
    .map((f) => {
      const cls = active === `feature:${f.slug}` ? ' class="active"' : '';
      const href = depth === 0 ? `features/${f.slug}.html` : `${f.slug}.html`;
      return `<a href="${href}"${cls}><span class="nav-icon">&#128196;</span> ${escHtml(f.title)}</a>`;
    })
    .join('\n        ');

  return html;
}

function pageShell({ projectName, title, active, depth, body, features }) {
  const css = depth === 0 ? 'styles.css' : '../styles.css';
  const nav = buildNav(features, active, depth);
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)} — ${escHtml(projectName)} Documentation</title>
  <link rel="stylesheet" href="${css}">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <button class="menu-toggle" onclick="document.querySelector('.sidebar').classList.toggle('open')">&#9776;</button>
  <div class="page-wrapper">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>${escHtml(projectName)}</h1>
        <span class="subtitle">Codebase Documentation</span>
      </div>
      <nav>
        ${nav}
      </nav>
    </aside>
    <main class="main-content">
      ${body}
    </main>
  </div>
</body>
</html>`;
}

function headerBlock({ title, breadcrumb, depth }) {
  const home = depth === 0 ? 'index.html' : '../index.html';
  return `<div class="page-header">
        <h1>${escHtml(title)}</h1>
        <p class="breadcrumb">${breadcrumb.replace('index.html', `<a href="${home}">Home</a>`)}</p>
        <p class="last-updated"><span class="dot"></span>อัปเดตล่าสุด: <strong>${TODAY}</strong> · สร้างอัตโนมัติจาก setup-cursor</p>
      </div>`;
}

function writeFile(rel, content) {
  const dest = path.join(docsRoot, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, 'utf8');
}

function main() {
  if (!force && exists(path.join(docsRoot, 'index.html'))) {
    console.log('docs/codebase-docs/index.html exists — skip (use --force to regenerate)');
    return;
  }

  const pkg = readPackageJson();
  const projectName = pkg.name || path.basename(projectPath);
  const stack = detectStack(pkg);

  const containers = findDir(['src/containers', 'app', 'src/screens', 'src/pages']);
  const components = findDir(['src/components', 'components']);
  const api = findDir(['src/apiController', 'src/api', 'src/services/api']);
  const reducers = findDir(['src/store/reducers', 'src/redux/reducers', 'store/reducers']);
  const routes = findDir(['src/routes', 'src/navigation', 'app']);

  const containerList = containers ? scanContainers(containers.abs) : [];
  const componentDirs = components ? listDirs(components.abs) : [];
  const apiFiles = api ? listFilesInDir(api.abs, '.js') : [];
  const reducerFiles = reducers ? listFilesInDir(reducers.abs, '.js') : [];
  const routeFiles = routes ? listFilesInDir(routes.abs, '.js') : [];

  const stats = {
    containers: containerList.length,
    components: componentDirs.length,
    api: apiFiles.length,
    reducers: reducerFiles.length,
    routes: routeFiles.length,
  };

  fs.mkdirSync(featuresDir, { recursive: true });

  // styles.css from template
  const stylesSrc = path.join(templatesDir, 'styles.css');
  const stylesDest = path.join(docsRoot, 'styles.css');
  if (exists(stylesSrc)) {
    fs.copyFileSync(stylesSrc, stylesDest);
  } else {
    fs.writeFileSync(
      stylesDest,
      'body{font-family:Inter,sans-serif;margin:0;padding:2rem;background:#f8f9fc}',
      'utf8',
    );
  }

  const features = containerList.map((c) => ({ slug: c.slug, title: c.title }));

  // --- index.html ---
  const featureCards = features
    .slice(0, 12)
    .map(
      (f) =>
        `<a class="card link-card" href="features/${f.slug}.html"><h3>${escHtml(f.title)}</h3><p>ดูรายละเอียด feature</p></a>`,
    )
    .join('\n          ');

  const indexBody = `${headerBlock({ title: `${projectName} Documentation`, breadcrumb: 'Codebase documentation (auto-generated)', depth: 0 })}
      <div class="stats-row">
        <div class="stat-card"><div class="stat-number">${stats.containers}</div><div class="stat-label">Containers / Features</div></div>
        <div class="stat-card"><div class="stat-number">${stats.components}</div><div class="stat-label">Component groups</div></div>
        <div class="stat-card"><div class="stat-number">${stats.api}</div><div class="stat-label">API modules</div></div>
        <div class="stat-card"><div class="stat-number">${stats.reducers}</div><div class="stat-label">Reducers</div></div>
        <div class="stat-card"><div class="stat-number">${stats.routes}</div><div class="stat-label">Route files</div></div>
      </div>
      <section>
        <h2>Quick links</h2>
        <div class="card-grid">
          <a class="card link-card" href="overview.html"><h3>Overview</h3></a>
          <a class="card link-card" href="architecture.html"><h3>Architecture</h3></a>
          <a class="card link-card" href="AI-GUIDE.md"><h3>AI-GUIDE (Markdown)</h3></a>
          <a class="card link-card" href="project-blueprint.md"><h3>Project Blueprint (Markdown)</h3></a>
        </div>
      </section>
      <section>
        <h2>Features (จากการสแกนโปรเจกต์)</h2>
        <div class="card-grid">${featureCards || '<p class="text-muted">ไม่พบ src/containers — เพิ่มโครงสร้างแล้วรัน setup ใหม่</p>'}</div>
        ${features.length > 12 ? `<p><a href="architecture.html">ดู containers ทั้งหมด (${features.length})</a></p>` : ''}
      </section>`;

  writeFile('index.html', pageShell({ projectName, title: 'Home', active: 'index', depth: 0, body: indexBody, features }));

  // --- overview.html ---
  const overviewBody = `${headerBlock({ title: 'Project Overview', breadcrumb: '<a href="index.html">Home</a> / Overview', depth: 0 })}
      <section>
        <h2>Project Identity</h2>
        <div class="card"><table><tbody>
          <tr><td><strong>Package name</strong></td><td><code>${escHtml(projectName)}</code></td></tr>
          <tr><td><strong>Version</strong></td><td>${escHtml(pkg.version || '—')}</td></tr>
          <tr><td><strong>Stack</strong></td><td>${escHtml(stack)}</td></tr>
          <tr><td><strong>Project path</strong></td><td><code>${escHtml(projectPath)}</code></td></tr>
        </tbody></table></div>
      </section>
      <section>
        <h2>Detected paths</h2>
        <div class="card"><table><thead><tr><th>Area</th><th>Path</th></tr></thead><tbody>
          <tr><td>Containers</td><td><code>${containers ? containers.rel : '—'}</code></td></tr>
          <tr><td>Components</td><td><code>${components ? components.rel : '—'}</code></td></tr>
          <tr><td>API</td><td><code>${api ? api.rel : '—'}</code></td></tr>
          <tr><td>Reducers</td><td><code>${reducers ? reducers.rel : '—'}</code></td></tr>
          <tr><td>Routes</td><td><code>${routes ? routes.rel : '—'}</code></td></tr>
        </tbody></table></div>
      </section>`;

  writeFile('overview.html', pageShell({ projectName, title: 'Overview', active: 'overview', depth: 0, body: overviewBody, features }));

  // --- architecture.html ---
  const containerRows = containerList
    .map(
      (c) =>
        `<tr><td>${escHtml(c.title)}</td><td><code>${escHtml(c.relPath)}</code></td><td>${c.files.length}</td></tr>`,
    )
    .join('\n          ');

  const archBody = `${headerBlock({ title: 'Architecture & File Mapping', breadcrumb: '<a href="index.html">Home</a> / Architecture', depth: 0 })}
      <section>
        <h2>Containers / Screens</h2>
        <p>สแกนจาก <code>${containers ? escHtml(containers.rel) : '—'}</code> — แต่ละโฟลเดอร์ = 1 หน้า feature docs</p>
        <div class="card"><table><thead><tr><th>Feature</th><th>Path</th><th>Files</th></tr></thead><tbody>
          ${containerRows || '<tr><td colspan="3">ไม่พบ containers</td></tr>'}
        </tbody></table></div>
      </section>`;

  writeFile('architecture.html', pageShell({ projectName, title: 'Architecture', active: 'architecture', depth: 0, body: archBody, features }));

  // --- navigation, api, state, components stubs ---
  const listPage = (title, active, items, colName) => {
    const rows = items.map((i) => `<tr><td><code>${escHtml(i)}</code></td></tr>`).join('\n          ');
    return `${headerBlock({ title, breadcrumb: `<a href="index.html">Home</a> / ${title}`, depth: 0 })}
      <section><div class="card"><table><thead><tr><th>${colName}</th></tr></thead><tbody>
        ${rows || '<tr><td>—</td></tr>'}
      </tbody></table></div></section>`;
  };

  writeFile('navigation.html', pageShell({ projectName, title: 'Navigation', active: 'navigation', depth: 0, body: listPage('Navigation', 'navigation', routeFiles, 'Route file'), features }));
  writeFile('api-layer.html', pageShell({ projectName, title: 'API Layer', active: 'api-layer', depth: 0, body: listPage('API Layer', 'api-layer', apiFiles, 'API module'), features }));
  writeFile('state-management.html', pageShell({ projectName, title: 'State Management', active: 'state-management', depth: 0, body: listPage('State Management', 'state-management', reducerFiles, 'Reducer'), features }));
  writeFile('components.html', pageShell({ projectName, title: 'Components', active: 'components', depth: 0, body: listPage('Components', 'components', componentDirs, 'Component folder'), features }));
  writeFile('theme-styling.html', pageShell({ projectName, title: 'Theme & Styling', active: 'theme-styling', depth: 0, body: `${headerBlock({ title: 'Theme & Styling', breadcrumb: '<a href="index.html">Home</a> / Theme', depth: 0 })}<section><div class="card"><p>เพิ่มรายละเอียด theme tokens, styled-components, หรือ design system ของโปรเจกต์นี้</p></div></section>`, features }));
  writeFile('utilities.html', pageShell({ projectName, title: 'Utilities', active: 'utilities', depth: 0, body: `${headerBlock({ title: 'Utilities', breadcrumb: '<a href="index.html">Home</a> / Utilities', depth: 0 })}<section><div class="card"><p>เพิ่มรายการ helpers จาก <code>src/helpers</code> หรือ <code>src/utils</code></p></div></section>`, features }));

  // --- per-feature HTML + MD ---
  for (const c of containerList) {
    const fileList = c.files.map((f) => `<li><code>${escHtml(f)}</code></li>`).join('\n            ');
    const featBody = `${headerBlock({ title: c.title, breadcrumb: `<a href="../index.html">Home</a> / Features / ${escHtml(c.title)}`, depth: 1 })}
      <section>
        <h2>Overview</h2>
        <p>Feature สแกนจาก container <code>${escHtml(c.name)}</code></p>
        <h3>Path</h3>
        <p><code>${escHtml(c.relPath)}</code></p>
        <h3>Source files (${c.files.length})</h3>
        <ul>${fileList || '<li>—</li>'}</ul>
      </section>`;

    writeFile(`features/${c.slug}.html`, pageShell({ projectName, title: c.title, active: `feature:${c.slug}`, depth: 1, body: featBody, features }));

    const md = `# ${c.title}

> สร้างอัตโนมัติ: ${TODAY} · แก้เนื้อหาให้ตรง business logic จริง

## Path

\`${c.relPath}\`

## Source files (${c.files.length})

${c.files.map((f) => `- \`${f}\``).join('\n') || '- _(none)_'}

## TODO

- อธิบาย flow หลักของ feature
- ระบุ API / Redux ที่เกี่ยวข้อง
- ระบุ routes / navigation
`;
    writeFile(`features/${c.slug}.md`, md);
  }

  // --- Markdown root docs ---
  const blueprint = `# Project Blueprint — ${projectName}

> สร้าง/อัปเดตอัตโนมัติ: ${TODAY}

## Overview

| หัวข้อ | รายละเอียด |
|--------|------------|
| **ชื่อโปรเจกต์** | ${projectName} |
| **Stack** | ${stack} |
| **Containers** | ${stats.containers} |
| **Components** | ${stats.components} groups |

## โครงสร้างที่ตรวจพบ

| Area | Path |
|------|------|
| Containers | \`${containers?.rel || '—'}\` |
| Components | \`${components?.rel || '—'}\` |
| API | \`${api?.rel || '—'}\` |
| Reducers | \`${reducers?.rel || '—'}\` |
| Routes | \`${routes?.rel || '—'}\` |

## Features

${containerList.map((c) => `- [${c.title}](features/${c.slug}.md) — \`${c.relPath}\``).join('\n') || '- _(none)_'}

## HTML docs

เปิด \`docs/codebase-docs/index.html\` ในเบราว์เซอร์
`;

  const aiGuide = `# AI Guide — ${projectName}

## อ่านก่อนเริ่มงาน

1. \`docs/codebase-docs/project-blueprint.md\` (ไฟล์นี้คู่กับ blueprint)
2. \`docs/codebase-docs/index.html\` — สารบัญ HTML
3. \`.cursor/rules/\` — กฎ Agent
4. Feature เฉพาะ: \`docs/codebase-docs/features/<feature>.md\`

## Features ที่สแกนได้ (${containerList.length})

${containerList.map((c) => `- **${c.title}**: \`${c.relPath}\``).join('\n') || '- ไม่พบ src/containers'}

## หมายเหตุ

เอกสารชุดนี้เป็น ** scaffold จาก setup-cursor** — ควรเติมรายละเอียด business logic, API keys, และ flow หลังติดตั้ง
`;

  writeFile('project-blueprint.md', blueprint);
  writeFile('AI-GUIDE.md', aiGuide);

  console.log(`Generated docs/codebase-docs/ (${containerList.length} features, ${stats.components} component groups)`);
}

main();
