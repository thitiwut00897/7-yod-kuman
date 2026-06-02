/**
 * Deep scan of a project for AI documentation generation.
 */
import fs from 'fs';
import path from 'path';

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function findDir(projectPath, candidates) {
  for (const rel of candidates) {
    const abs = path.join(projectPath, rel);
    if (exists(abs) && fs.statSync(abs).isDirectory()) return { rel, abs };
  }
  return null;
}

function listDirs(dir) {
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
    .map((d) => d.name)
    .sort();
}

function walkFiles(dir, { ext = /\.(js|jsx|ts|tsx)$/, max = 500 } = {}) {
  const out = [];
  if (!exists(dir)) return out;
  const go = (d, prefix = '') => {
    if (out.length >= max) return;
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
      const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) go(p, rel);
      else if (ext.test(ent.name)) out.push(rel);
    }
  };
  go(dir);
  return out;
}

function readText(filePath, maxLen = 80000) {
  if (!exists(filePath)) return '';
  const t = fs.readFileSync(filePath, 'utf8');
  return t.length > maxLen ? `${t.slice(0, maxLen)}\n... [truncated]` : t;
}

function grepInFile(filePath, pattern) {
  const t = readText(filePath, 200000);
  const re = new RegExp(pattern, 'g');
  const m = t.match(re);
  return m ? [...new Set(m)].slice(0, 80) : [];
}

function detectStack(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const parts = [];
  if (deps['react-native']) parts.push(`React Native ${deps['react-native']}`);
  if (deps.react) parts.push(`React ${deps.react}`);
  if (deps['@react-navigation/native']) parts.push('@react-navigation');
  if (deps.redux || deps['@reduxjs/toolkit']) parts.push('Redux');
  if (deps['styled-components']) parts.push('styled-components');
  if (deps.axios) parts.push('axios');
  return parts;
}

function treeLines(projectPath, relDir, depth = 0, maxDepth = 2) {
  const abs = path.join(projectPath, relDir);
  if (!exists(abs) || depth > maxDepth) return [];
  const lines = [];
  const indent = '  '.repeat(depth);
  for (const name of listDirs(abs).slice(0, 40)) {
    lines.push(`${indent}${relDir}/${name}/`);
    if (depth < maxDepth) {
      lines.push(...treeLines(projectPath, `${relDir}/${name}`, depth + 1, maxDepth));
    }
  }
  return lines;
}

/** Group containers into suggested feature areas by name prefix */
function suggestFeatureGroups(containers) {
  const groups = new Map();
  const rules = [
    [/auth|login|otp|consent|register/i, 'Authentication & Consent'],
    [/health|medical|check|screen|folder|pre/i, 'Health System'],
    [/step|device|connect|wearable/i, 'Step Tracking & Devices'],
    [/mission|challenge|lifestyle|company/i, 'Missions & Challenges'],
    [/community|post|comment|friend|social/i, 'Community & Social'],
    [/reward|point|spin|badge|earn/i, 'Rewards & Points'],
    [/book|class|schedule/i, 'Booking & Classes'],
    [/news|article|banner/i, 'News & Content'],
    [/notif/i, 'Notifications'],
    [/profile|account|setting/i, 'Profile & Settings'],
    [/home|main|tab/i, 'Home & Navigation'],
  ];

  for (const c of containers) {
    let placed = false;
    for (const [re, label] of rules) {
      if (re.test(c.name)) {
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label).push(c.name);
        placed = true;
        break;
      }
    }
    if (!placed) {
      const label = 'Other Features';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(c.name);
    }
  }
  return [...groups.entries()].map(([name, items]) => ({ name, containers: items }));
}

export function scanProject(projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  const pkg = exists(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : { name: path.basename(projectPath) };

  const containers = findDir(projectPath, ['src/containers', 'app', 'src/screens', 'src/pages']);
  const components = findDir(projectPath, ['src/components', 'components']);
  const api = findDir(projectPath, ['src/apiController', 'src/api', 'src/services/api']);
  const reducers = findDir(projectPath, ['src/store/reducers', 'src/redux/reducers']);
  const routes = findDir(projectPath, ['src/routes', 'src/navigation', 'app']);
  const store = findDir(projectPath, ['src/store', 'src/redux']);
  const assets = findDir(projectPath, ['src/assets', 'assets']);
  const helpers = findDir(projectPath, ['src/helpers', 'src/utils', 'src/utilities']);

  const containerNames = containers ? listDirs(containers.abs) : [];
  const containerDetails = containerNames.map((name) => ({
    name,
    path: path.join(containers.rel, name),
    files: walkFiles(path.join(containers.abs, name), { max: 30 }),
  }));

  const routeConstants = assets
    ? grepInFile(path.join(assets.abs, 'constants', 'index.js'), 'ROUTE_[A-Z0-9_]+')
    : [];
  if (routeConstants.length === 0 && assets) {
    const assetsFiles = walkFiles(assets.abs, { max: 100 });
    for (const f of assetsFiles) {
      if (/route/i.test(f)) {
        routeConstants.push(...grepInFile(path.join(assets.abs, f), 'ROUTE_[A-Z0-9_]+'));
      }
    }
  }

  const rootEntries = fs.readdirSync(projectPath).filter((n) => !n.startsWith('.') && n !== 'node_modules');

  return {
    projectPath,
    projectName: pkg.name || path.basename(projectPath),
    version: pkg.version || '',
    stack: detectStack(pkg),
    rootEntries: rootEntries.slice(0, 30),
    paths: {
      containers: containers?.rel,
      components: components?.rel,
      api: api?.rel,
      reducers: reducers?.rel,
      routes: routes?.rel,
      store: store?.rel,
      assets: assets?.rel,
      helpers: helpers?.rel,
    },
    stats: {
      containers: containerNames.length,
      componentGroups: components ? listDirs(components.abs).length : 0,
      apiModules: api ? walkFiles(api.abs, { max: 200 }).length : 0,
      reducers: reducers ? listDirs(reducers.abs).length : 0,
      routeFiles: routes ? walkFiles(routes.abs, { max: 50 }).length : 0,
    },
    containers: containerDetails,
    componentDirs: components ? listDirs(components.abs).slice(0, 80) : [],
    apiFiles: api ? walkFiles(api.abs, { max: 80 }).map((f) => path.join(api.rel, f)) : [],
    reducerDirs: reducers ? listDirs(reducers.abs) : [],
    routeFiles: routes ? walkFiles(routes.abs, { max: 30 }).map((f) => path.join(routes.rel, f)) : [],
    routeConstants: [...new Set(routeConstants)].slice(0, 60),
    suggestedFeatureGroups: suggestFeatureGroups(containerDetails),
    srcTree: treeLines(projectPath, 'src', 0, 2),
  };
}

export function formatScanAsMarkdown(scan) {
  const lines = [
    `# Project Scan: ${scan.projectName}`,
    '',
    `> Path: \`${scan.projectPath}\``,
    `> Version: ${scan.version || '—'}`,
    `> Stack: ${scan.stack.join(', ') || '—'}`,
    '',
    '## Stats',
    '',
    '| Metric | Count |',
    '|--------|-------|',
    `| Containers | ${scan.stats.containers} |`,
    `| Component groups | ${scan.stats.componentGroups} |`,
    `| API modules | ${scan.stats.apiModules} |`,
    `| Reducers | ${scan.stats.reducers} |`,
    `| Route files | ${scan.stats.routeFiles} |`,
    '',
    '## Key paths',
    '',
    ...Object.entries(scan.paths)
      .filter(([, v]) => v)
      .map(([k, v]) => `- **${k}**: \`${v}\``),
    '',
    '## Root folders',
    '',
    scan.rootEntries.map((e) => `- \`${e}/\``).join('\n'),
    '',
    '## src/ tree (depth 2)',
    '',
    '```',
    ...scan.srcTree,
    '```',
    '',
    '## Suggested feature groups (for documentation)',
    '',
    ...scan.suggestedFeatureGroups.map(
      (g) => `### ${g.name}\n${g.containers.map((c) => `- \`${c}\``).join('\n')}`,
    ),
    '',
    '## All containers',
    '',
    ...scan.containers.map(
      (c) => `- **${c.name}** (\`${c.path}\`, ${c.files.length} files)`,
    ),
    '',
    '## Route constants (sample)',
    '',
    scan.routeConstants.length
      ? scan.routeConstants.map((r) => `- \`${r}\``).join('\n')
      : '- _(not detected — check src/assets or routes)_',
    '',
    '## Reducers',
    '',
    scan.reducerDirs.map((r) => `- \`${r}\``).join('\n') || '- _(none)_',
    '',
    '## API modules',
    '',
    scan.apiFiles.slice(0, 40).map((f) => `- \`${f}\``).join('\n') || '- _(none)_',
    '',
    '## Route / navigation files',
    '',
    scan.routeFiles.map((f) => `- \`${f}\``).join('\n') || '- _(none)_',
    '',
  ];
  return lines.join('\n');
}
