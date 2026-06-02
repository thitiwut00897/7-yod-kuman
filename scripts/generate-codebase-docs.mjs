#!/usr/bin/env node
/**
 * Generate docs/codebase-docs for a target project.
 *
 * Default (--create from setup-cursor):
 *   1. Deep scan → .scan/PROJECT-CONTEXT.md
 *   2. AI prompts for Cursor Opus (Phase 1 outline, Phase 2 HTML)
 *   3. styles.css + placeholder index.html
 *
 * Options:
 *   node generate-codebase-docs.mjs <project> [--force]
 *   node generate-codebase-docs.mjs <project> --scaffold   # old: 1 container = 1 html
 *   node generate-codebase-docs.mjs <project> --ai-outline # needs ANTHROPIC_API_KEY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanProject, formatScanAsMarkdown } from './lib/scan-project.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsRoot = path.join(__dirname, '..');

const projectPath = path.resolve(process.argv[2] || process.cwd());
const force = process.argv.includes('--force');
const scaffold = process.argv.includes('--scaffold');
const aiOutline = process.argv.includes('--ai-outline');

const docsRoot = path.join(projectPath, 'docs', 'codebase-docs');
const scanDir = path.join(docsRoot, '.scan');
const templatesDir = path.join(scriptsRoot, 'docs-templates');
const promptsDir = path.join(scriptsRoot, 'scripts', 'prompts');

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

function write(rel, content) {
  const dest = path.join(docsRoot, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, 'utf8');
}

function loadPrompt(name) {
  return fs.readFileSync(path.join(promptsDir, name), 'utf8');
}

function placeholderIndex(scan) {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${scan.projectName} — Documentation (pending AI)</title>
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <div class="page-wrapper" style="display:block;max-width:800px;margin:2rem auto;padding:2rem">
    <h1>${scan.projectName} — Codebase Docs</h1>
    <p class="last-updated"><span class="dot"></span>สแกนโปรเจกต์: <strong>${TODAY}</strong></p>
    <section class="card" style="padding:1.5rem;margin:1.5rem 0">
      <h2>ขั้นตอนถัดไป (ใช้ Cursor Agent + Opus)</h2>
      <ol>
        <li>เปิด <code>docs/codebase-docs/GENERATE-DOCS-PROMPT-PHASE1.md</code></li>
        <li>ส่งให้ Agent วิเคราะห์ → ได้สารบัญ (บันทึกเป็น <code>OUTLINE-PHASE1.md</code>)</li>
        <li>ตรวจสอบ outline แล้วเปิด <code>GENERATE-DOCS-PROMPT-PHASE2.md</code></li>
        <li>Agent สร้าง HTML ทุกหน้าใน <code>docs/codebase-docs/</code></li>
      </ol>
      <p>ข้อมูลสแกน: <a href=".scan/PROJECT-CONTEXT.md">.scan/PROJECT-CONTEXT.md</a></p>
    </section>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-number">${scan.stats.containers}</div><div class="stat-label">Containers</div></div>
      <div class="stat-card"><div class="stat-number">${scan.stats.componentGroups}</div><div class="stat-label">Components</div></div>
      <div class="stat-card"><div class="stat-number">${scan.stats.reducers}</div><div class="stat-label">Reducers</div></div>
    </div>
  </div>
</body>
</html>`;
}

async function callAnthropicOutline(scan, scanMd) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error('WARN: ไม่มี ANTHROPIC_API_KEY — ข้าม --ai-outline');
    return null;
  }
  const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-20250514';
  const prompt = `${loadPrompt('docs-phase1-outline.md').replace('{{PROJECT_SCAN}}', scanMd)}

ตอบเป็นภาษาไทย โครงสร้างชัดเจน ใช้ markdown headings`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Anthropic API error:', res.status, err);
    return null;
  }
  const data = await res.json();
  return data.content?.map((c) => c.text).join('') || null;
}

async function runAiDocsFlow(scan, scanMd) {
  console.log('สร้าง AI prompts สำหรับ Cursor Opus...');

  const phase1 = loadPrompt('docs-phase1-outline.md').replace('{{PROJECT_SCAN}}', scanMd);
  const phase2 = loadPrompt('docs-phase2-html.md').replace('{{PROJECT_SCAN}}', scanMd);

  write('GENERATE-DOCS-PROMPT-PHASE1.md', phase1);
  write('GENERATE-DOCS-PROMPT-PHASE2.md', phase2);
  write('.scan/PROJECT-CONTEXT.md', scanMd);
  write('.scan/scan.json', JSON.stringify(scan, null, 2));

  if (aiOutline) {
    console.log('เรียก Anthropic API สำหรับ Phase 1 outline...');
    const outline = await callAnthropicOutline(scan, scanMd);
    if (outline) {
      write('OUTLINE-PHASE1.md', `# Outline (AI Phase 1)\n\n> ${TODAY}\n\n${outline}`);
      console.log('บันทึก OUTLINE-PHASE1.md แล้ว');
    }
  }

  const stylesSrc = path.join(templatesDir, 'styles.css');
  if (exists(stylesSrc)) {
    fs.copyFileSync(stylesSrc, path.join(docsRoot, 'styles.css'));
  }

  write('index.html', placeholderIndex(scan));
  write(
    'AI-GUIDE.md',
    `# AI Guide — ${scan.projectName}

1. อ่าน \`.scan/PROJECT-CONTEXT.md\`
2. รัน Phase 1: \`GENERATE-DOCS-PROMPT-PHASE1.md\` ใน Cursor Agent (Opus)
3. บันทึกผลเป็น \`OUTLINE-PHASE1.md\`
4. รัน Phase 2: \`GENERATE-DOCS-PROMPT-PHASE2.md\` → สร้าง HTML ทุกหน้า
`,
  );

  console.log('');
  console.log('เสร็จ — ขั้นตอนถัดไป:');
  console.log('  1. เปิด Cursor → Agent (Opus)');
  console.log(`  2. อ่าน ${path.join(docsRoot, 'GENERATE-DOCS-PROMPT-PHASE1.md')}`);
  console.log('  3. หลังอนุมัติ outline → รัน GENERATE-DOCS-PROMPT-PHASE2.md');
}

/** Legacy scaffold: import old generator logic inline - delegate to subprocess */
async function runScaffold() {
  const legacy = path.join(__dirname, 'generate-codebase-docs-scaffold.mjs');
  if (exists(legacy)) {
    const { spawnSync } = await import('child_process');
    const r = spawnSync(process.execPath, [legacy, projectPath, ...(force ? ['--force'] : [])], {
      stdio: 'inherit',
    });
    process.exit(r.status ?? 1);
  }
  console.error('Scaffold module not found');
  process.exit(1);
}

async function main() {
  if (!force && exists(path.join(docsRoot, 'GENERATE-DOCS-PROMPT-PHASE1.md'))) {
    console.log('docs/codebase-docs prompts exist — skip (use --force)');
    return;
  }

  if (!exists(projectPath)) {
    console.error('Project not found:', projectPath);
    process.exit(2);
  }

  console.log('สแกนโปรเจกต์:', projectPath);
  const scan = scanProject(projectPath);
  const scanMd = formatScanAsMarkdown(scan);

  fs.mkdirSync(path.join(projectPath, 'docs', 'work-summary'), { recursive: true });

  if (scaffold) {
    await runScaffold();
    return;
  }

  await runAiDocsFlow(scan, scanMd);
  console.log(`\nสแกนแล้ว: ${scan.stats.containers} containers, ${scan.suggestedFeatureGroups.length} feature groups (แนะนำ)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
