# my-cursor-rules

แพ็ก Cursor สำหรับใช้ข้ามหลายโปรเจกต์ — `rules/`, `skills/`, `agents/`, `cursor.md`, `.cursorrules` และสคริปต์ติดตั้งอัตโนมัติ

**Repo:** https://github.com/thitiwut00897/my-cursor-rules

---

## คำสั่งเดียว (copy ใช้ได้เลย)

> รันในโฟลเดอร์โปรเจกต์ปลายทาง (`cd` เข้าโปรเจกต์ก่อน)  
> ใช้ `bash -s --` (อย่าใช้ `bash <(curl ...)`)  
> **ไม่ต้อง clone** repo ไว้เครื่อง — สคริปต์ดาวน์โหลดจาก GitHub (zip หรือ shallow git)  
> ต้องมี `git` หรือ `curl`+`unzip` บนเครื่อง

### `--create` — ติดตั้งใหม่ทั้งหมด + สร้าง docs ใหม่ทั้งหมด

```bash
cd /path/to/your-project

curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --create --project .
```

### `--update` — อัปเดต rules / skills / agents อย่างเดียว (ไม่แตะ docs)

```bash
cd /path/to/your-project

curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --update --project .
```

### Repo Private หรือ curl 404

```bash
export GITHUB_TOKEN="ghp_xxxx"   # PAT ที่มี scope repo

cd /path/to/your-project
curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --create --project .
```

### ทางเลือกเสถียร (clone ครั้งเดียว ใช้ซ้ำได้)

```bash
git clone https://github.com/thitiwut00897/my-cursor-rules.git ~/Github-Work/my-cursor-rules

cd /path/to/your-project
bash ~/Github-Work/my-cursor-rules/scripts/setup-cursor.sh --local --create --project .
# อัปเดตเฉพาะ .cursor:
bash ~/Github-Work/my-cursor-rules/scripts/setup-cursor.sh --local --update --project .
```

---

## สคริปต์ทำอะไรบ้าง

| ขั้นตอน | `--create` | `--update` |
|---------|------------|------------|
| ติดตั้ง `.cursor/` (rules, skills, agents, cursor.md, .cursorrules) | ✅ ทับเดิม | ✅ ทับเดิม |
| สร้าง `docs/work-summary/` | ✅ | ❌ |
| สแกนโปรเจกต์ → สร้าง `docs/codebase-docs/` (HTML + MD) | ✅ บังคับสร้างใหม่ | ❌ ข้าม |

### การสแกน `docs/codebase-docs` (`--create` เท่านั้น)

ต้องมี **Node.js** บนเครื่อง

1. อ่าน `package.json` (ชื่อแอป, stack)
2. สแกน `src/containers/` (หรือ `app/`, `src/screens/`) → **1 โฟลเดอร์ = 1 feature**
3. นับ components, API, reducers, routes
4. สร้างไฟล์:
   - **HTML:** `index.html`, `overview.html`, `architecture.html`, `features/<feature>.html`, …
   - **Markdown:** `project-blueprint.md`, `AI-GUIDE.md`, `features/<feature>.md`
   - **`styles.css`**

> เอกสารที่ได้เป็น **scaffold จากโครงสร้าง code** — ควรเติม business logic / API flow หลัง setup

---

## หลังติดตั้ง

1. เปิดโปรเจกต์ใน **Cursor** → **Settings → Rules, Commands** → ตรวจ Project Rules
2. เปิด `docs/codebase-docs/index.html` ใน browser
3. แก้ `docs/codebase-docs/project-blueprint.md` ให้ตรงโปรเจกต์
4. แก้ `.cursor/rules/architecture.mdc` ถ้ายังอ้าง Well Life (โปรเจกต์ใหม่)
5. (ทางเลือก) ตั้ง MCP: SonarQube, Postman, Jira ใน **Cursor Settings → MCP**

---

## ตัวเลือกสคริปต์ทั้งหมด

| Option | ความหมาย |
|--------|----------|
| `--create` | ติดตั้ง `.cursor` + สร้าง docs ใหม่ทั้งชุด (`--overwrite` + `--regenerate-docs`) |
| `--update` | ติดตั้ง `.cursor` อย่างเดียว (`--overwrite` + `--skip-docs`) |
| `--local` | ใช้ repo บนเครื่อง (โฟลเดอร์ที่มี `scripts/setup-cursor.sh`) |
| `--repo <url>` | ดาวน์โหลดจาก GitHub (default: repo นี้) |
| `--branch <name>` | branch สำหรับ zip/clone (default: `main`) |
| `--project <path>` | โปรเจกต์ปลายทาง (default: `.`) |
| `--overwrite` | ทับ `.cursor` เดิม (ไม่ backup) |
| `--skip-docs` | ไม่สร้าง / ไม่แตะ `docs/codebase-docs` |
| `--regenerate-docs` | บังคับสร้าง docs ใหม่ (`--force` ใน generator) |
| `--copy-script` | copy สคริปต์ไปที่ `<project>/scripts/` |
| `-h`, `--help` | แสดงวิธีใช้ |

**ตัวแปร environment**

| ตัวแปร | ใช้เมื่อ |
|--------|---------|
| `GITHUB_TOKEN` | repo Private — ใช้ดาวน์โหลด zip ผ่าน API |

---

## โครงสร้าง repo

```text
my-cursor-rules/
├── .cursor/                 # แพ็กเต็ม (rules, skills, agents, .cursorrules)
├── rules/                   # สำเนา rules (สคริปต์ใช้ .cursor/ หรือ root ก็ได้)
├── skills/
├── agents/
├── cursor.md
├── docs-templates/          # template + styles.css
└── scripts/
    ├── setup-cursor.sh      # ติดตั้งหลัก
    ├── generate-codebase-docs.mjs
    └── README.md
```

---

## แก้ปัญหา

| อาการ | วิธีแก้ |
|-------|---------|
| `curl: 404` | repo Private → ใส่ `GITHUB_TOKEN` หรือตั้ง repo เป็น Public |
| `BASH_SOURCE unbound` | อัปเดตสคริปต์ล่าสุดจาก GitHub (รอ 1–2 นาที หรือ pull repo กลางใหม่) |
| `Downloaded repo missing .cursor` | ใช้สคริปต์ commit ล่าสุด (แก้ log ปน path แล้ว) |
| ได้ `.cursor` แต่ไม่มี docs | ใช้ `bash -s --` ไม่ใช่ `bash <(curl ...)`; ตรวจว่ามี `node` |
| ต้องการ docs ใหม่หลังแก้ code | รัน `--create` อีกครั้ง หรือ `node scripts/generate-codebase-docs.mjs . --force` |
| อัปเดตแพ็กจาก repo กลาง | `bash .../setup-cursor.sh --local --update --project .` |

---

## หมายเหตุ

- **`architecture.mdc`** ในแพ็กนี้อิง Well Life — โปรเจกต์ใหม่ควรแก้หรือแทนที่
- ไม่ใช้ Cursor Remote Rule อย่างเดียว — repo นี้ติดตั้ง **ทั้ง `.cursor/`** ผ่านสคริปต์
- Push ล่าสุดขึ้น `main` ก่อนใช้คำสั่ง `curl` จาก raw.githubusercontent.com
