# scripts

## setup-cursor.sh — ติดตั้ง `.cursor` + สร้าง docs

### ทำอะไรบ้าง

| ขั้นตอน | รายละเอียด |
|--------|------------|
| 1 | ติดตั้ง `.cursor/` (rules, skills, agents, cursor.md, .cursorrules) |
| 2 | Backup `.cursor` เดิม (ถ้ามี) |
| 3 | สร้าง `docs/work-summary/` |
| 4 | **สแกนโปรเจกต์** → สร้าง `docs/codebase-docs/` แบบ HTML + Markdown |

### ส่วน `docs/codebase-docs` (สำคัญ)

ถ้าโปรเจกต์**ยังไม่มี** `docs/codebase-docs/index.html` สคริปต์จะเรียก `generate-codebase-docs.mjs` ซึ่ง:

- อ่าน `package.json` (ชื่อ, stack)
- สแกน `src/containers/` (หรือ `app/`, `src/screens/`) → **1 โฟลเดอร์ = 1 feature**
- นับ `src/components/`, `src/apiController/`, `src/store/reducers/`, `src/routes/`
- สร้างไฟล์:

| ไฟล์ | ประเภท |
|------|--------|
| `index.html`, `overview.html`, `architecture.html`, … | HTML (เปิดใน browser) |
| `features/<feature>.html` | HTML ต่อ feature |
| `features/<feature>.md` | Markdown ต่อ feature |
| `project-blueprint.md`, `AI-GUIDE.md` | Markdown ราก |
| `styles.css` | จาก template |

ถ้ามี `index.html` อยู่แล้ว → **ไม่ทับ** (ใช้ `--regenerate-docs` เพื่อสร้างใหม่)

### คำสั่ง

```bash
cd /path/to/target-project

# ติดตั้งครบ (.cursor + docs)
bash /path/to/my-cursor-rules/scripts/setup-cursor.sh --local

# เฉพาะ .cursor ไม่สร้าง docs
bash .../setup-cursor.sh --local --skip-docs

# บังคับสร้าง docs ใหม่
bash .../setup-cursor.sh --local --regenerate-docs
```

## generate-codebase-docs.mjs — รันแยกได้

```bash
node scripts/generate-codebase-docs.mjs /path/to/project
node scripts/generate-codebase-docs.mjs /path/to/project --force
```

ดู [README.md](../README.md) ใน root
