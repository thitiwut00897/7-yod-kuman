#!/usr/bin/env node
/**
 * --create จาก setup-cursor.sh:
 *   1. สแกนโปรเจกต์ → .scan/PROJECT-CONTEXT.md
 *   2. สร้าง HOW-TO-GENERATE-DOCS.md + prompts/phase1-copy.txt, phase2-copy.txt
 *   3. styles.css + placeholder index.html
 *
 * ไม่รัน Cursor / AI อัตโนมัติ — user copy prompt ไปวางเอง
 *
 * Options:
 *   node generate-codebase-docs.mjs <project> [--force]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanProject, formatScanAsMarkdown } from './lib/scan-project.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsRoot = path.join(__dirname, '..');

const projectPath = path.resolve(process.argv[2] || process.cwd());
const force = process.argv.includes('--force');

const docsRoot = path.join(projectPath, 'docs', 'codebase-docs');
const templatesDir = path.join(scriptsRoot, 'docs-templates');
const codebaseDocsTemplates = path.join(templatesDir, 'codebase-docs');
const promptsDir = path.join(codebaseDocsTemplates, 'prompts');

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

function readPrompt(name) {
  return fs.readFileSync(path.join(promptsDir, name), 'utf8');
}

function copyFileEnsureDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDirRecursive(srcDir, destDir) {
  if (!exists(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, name);
    const dest = path.join(destDir, name);
    if (fs.statSync(src).isDirectory()) {
      copyDirRecursive(src, dest);
    } else {
      copyFileEnsureDir(src, dest);
    }
  }
}

function placeholderIndex(scan) {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${scan.projectName} — Documentation</title>
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <div class="page-wrapper" style="display:block;max-width:800px;margin:2rem auto;padding:2rem">
    <h1>${scan.projectName} — Codebase Docs</h1>
    <p class="last-updated"><span class="dot"></span>สแกน: <strong>${TODAY}</strong></p>
    <section class="card" style="padding:1.5rem;margin:1.5rem 0">
      <h2>ยังไม่มี HTML ครบ</h2>
      <p>เปิด <code>HOW-TO-GENERATE-DOCS.md</code> แล้ว copy prompt ไปวางใน Cursor Agent เอง (Phase 1 → Phase 2)</p>
      <p><a href="HOW-TO-GENERATE-DOCS.md">HOW-TO-GENERATE-DOCS.md</a></p>
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

function buildHowTo(scan) {
  const p1 = readPrompt('phase1-copy.txt');
  const p2 = readPrompt('phase2-copy.txt');

  return `# วิธีสร้าง HTML Documentation (ทำมือใน Cursor)

> โปรเจกต์: **${scan.projectName}**  
> สแกนเมื่อ: ${TODAY}  
> สถิติ: ${scan.stats.containers} containers, ${scan.stats.componentGroups} component groups, ${scan.stats.reducers} reducers

สคริปต์ \`setup-cursor.sh --create\` **ไม่รัน AI ให้** — แค่สแกนโค้ดและเตรียมไฟล์ด้านล่าง  
คุณต้อง **copy prompt ไปวางใน Cursor Agent เอง** (แนะนำโมเดล Opus)

---

## ไฟล์ที่เตรียมไว้แล้ว

| ไฟล์ | ใช้ทำอะไร |
|------|-----------|
| \`.scan/PROJECT-CONTEXT.md\` | ข้อมูลสแกนจากโค้ดจริง (Agent อ่านผ่าน @) |
| \`prompts/phase1-copy.txt\` | **Copy ทั้งไฟล์** → วางในแชท Phase 1 |
| \`prompts/phase2-copy.txt\` | **Copy ทั้งไฟล์** → วางในแชท Phase 2 |
| \`_template/HTML-TEMPLATE-GUIDE.md\` | กฎโครงสร้าง HTML (อ่านก่อน Phase 2) |
| \`_template/page-root.html\` | แม่แบบหน้า root |
| \`_template/page-feature.html\` | แม่แบบหน้า features/ |
| \`styles.css\` | CSS กลาง — ห้ามเปลี่ยน class หลัก |
| \`index.html\` | placeholder จนกว่า Phase 2 จะสร้างหน้าเต็ม |

---

## ขั้นตอน

### Phase 1 — ขอสารบัญ (ยังไม่สร้าง HTML)

Agent จะอ่าน \`_template/\` และไฟล์ \`.html\` ที่มีอยู่แล้วในโปรเจกต์ (ถ้ามี) เพื่อเข้าใจรูปแบบ

1. เปิด **Cursor** → แชท **Agent**
2. เปิดไฟล์ \`docs/codebase-docs/prompts/phase1-copy.txt\`
3. **Select All** (Cmd+A) → **Copy** → วางในแชท Agent → ส่ง
4. ตรวจคำตอบจาก Agent
5. บันทึกผลเป็น \`docs/codebase-docs/OUTLINE-PHASE1.md\` (สร้างไฟล์ใหม่ วาง markdown ที่ Agent ตอบ)

### Phase 2 — สร้าง HTML ทุกหน้า

Agent ต้องทำตาม \`_template/HTML-TEMPLATE-GUIDE.md\` และคัดลอกโครงจาก \`page-root.html\` / \`page-feature.html\` — หน้าใหม่ต้องเหมือนแปะ template

1. ตรวจว่ามี \`OUTLINE-PHASE1.md\` แล้ว
2. เปิด \`docs/codebase-docs/prompts/phase2-copy.txt\`
3. **Copy ทั้งไฟล์** → วางในแชท Agent → ส่ง
4. รอ Agent สร้าง/อัปเดตไฟล์ใน \`docs/codebase-docs/\`
5. เปิด \`index.html\` ในเบราว์เซอร์ตรวจ sidebar และลิงก์

---

## Prompt Phase 1 (สำรอง — ถ้าไม่เปิดไฟล์ .txt)

คัดลอกเฉพาะข้อความในกล่องด้านล่าง (ไม่รวมบรรทัด \`\`\`):

\`\`\`text
${p1.trim()}
\`\`\`

---

## Prompt Phase 2 (สำรอง)

หลังมี \`OUTLINE-PHASE1.md\` แล้ว คัดลอก:

\`\`\`text
${p2.trim()}
\`\`\`

---

## หมายเหตุ

- รูปแบบ HTML อ่านจาก \`docs/codebase-docs/_template/\` และไฟล์ \`.html\` ในโปรเจกต์นี้เท่านั้น — ไม่อ้างอิง repo อื่น
- รัน \`--create\` ซ้ำด้วย \`--force\` จะอัปเดต template + prompt (ไม่ทับ \`index.html\` ที่มี sidebar ครบแล้ว)
`;
}

function runDocsSetup(scan, scanMd) {
  console.log('สร้างไฟล์คู่มือ + prompt สำหรับ copy เอง...');

  write('.scan/PROJECT-CONTEXT.md', scanMd);
  write('.scan/scan.json', JSON.stringify(scan, null, 2));

  write('HOW-TO-GENERATE-DOCS.md', buildHowTo(scan));

  const templateSubdir = path.join(codebaseDocsTemplates, '_template');
  if (exists(templateSubdir)) {
    copyDirRecursive(templateSubdir, path.join(docsRoot, '_template'));
    console.log('  copy _template/');
  }

  if (exists(promptsDir)) {
    copyDirRecursive(promptsDir, path.join(docsRoot, 'prompts'));
    console.log('  copy prompts/');
  }

  const stylesSrc = path.join(codebaseDocsTemplates, 'styles.css');
  if (exists(stylesSrc)) {
    copyFileEnsureDir(stylesSrc, path.join(docsRoot, 'styles.css'));
  } else {
    console.warn('  WARN: ไม่พบ docs-templates/codebase-docs/styles.css');
  }

  const blueprintSrc = path.join(templatesDir, 'project-blueprint.md');
  if (exists(blueprintSrc) && !exists(path.join(docsRoot, 'project-blueprint.md'))) {
    fs.copyFileSync(blueprintSrc, path.join(docsRoot, 'project-blueprint.md'));
  }

  const indexPath = path.join(docsRoot, 'index.html');
  const existingIndex = exists(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
  const looksComplete =
    existingIndex.includes('sidebar') && existingIndex.includes('overview.html');
  if (!looksComplete) {
    write('index.html', placeholderIndex(scan));
  } else {
    console.log('  ข้าม index.html (มี docs HTML อยู่แล้ว)');
  }

  const aiGuideDest = path.join(docsRoot, 'AI-GUIDE.md');
  const aiGuideSrc = path.join(templatesDir, 'AI-GUIDE.md');
  if (!exists(aiGuideDest) && exists(aiGuideSrc)) {
    copyFileEnsureDir(aiGuideSrc, aiGuideDest);
  }

  console.log('');
  console.log('เสร็จ — ขั้นตอนถัดไป (ทำมือ):');
  console.log(`  1. เปิด ${path.join(docsRoot, 'HOW-TO-GENERATE-DOCS.md')}`);
  console.log('  2. Copy prompts/phase1-copy.txt → วางใน Cursor Agent');
  console.log('  3. บันทึก OUTLINE-PHASE1.md → แล้ว copy phase2-copy.txt');
}

async function main() {
  if (!force && exists(path.join(docsRoot, 'HOW-TO-GENERATE-DOCS.md'))) {
    console.log('docs/codebase-docs มี HOW-TO แล้ว — ข้าม (ใช้ --force เพื่อสร้างใหม่)');
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

  runDocsSetup(scan, scanMd);
  console.log(
    `\nสแกนแล้ว: ${scan.stats.containers} containers, ${scan.suggestedFeatureGroups.length} feature groups (แนะนำ)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
