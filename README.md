# my-cursor-rules

แพ็ก Cursor (`rules`, `skills`, `agents`) + สคริปต์ติดตั้งในโปรเจกต์อื่น

**Repo:** https://github.com/thitiwut00897/my-cursor-rules (Public)

---

## คำสั่งเดียว (copy ใช้ได้เลย)

```bash
cd /path/to/your-project
```

### `--create` — ติดตั้ง `.cursor` + สร้าง `docs/codebase-docs` ใหม่

```bash
curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --create --project .
```

### `--update` — อัปเดต `.cursor` อย่างเดียว (ไม่แตะ docs)

```bash
curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --update --project .
```

### ทางเลือก (clone ครั้งเดียว)

```bash
git clone https://github.com/thitiwut00897/my-cursor-rules.git ~/Github-Work/my-cursor-rules
cd /path/to/your-project
bash ~/Github-Work/my-cursor-rules/scripts/setup-cursor.sh --local --create --project .
```

---

## ต้องมีบนเครื่อง

| เครื่องมือ | ใช้เมื่อ |
|-----------|----------|
| `git` | ดึง config (แนะนำ) |
| `curl` + `unzip` | สำรองถ้าไม่มี git |
| `node` | `--create` (generate docs) |

---

## สคริปต์ทำอะไร

1. ดึง repo `my-cursor-rules` (git clone หรือ zip)
2. copy `.cursor/` เข้าโปรเจกต์
3. `--create` → **สแกนโปรเจกต์** + สร้าง prompt ให้ **Cursor Agent (Opus)** ทำ HTML docs แบบ Well Life

### หลัง `--create` (ทำใน Cursor)

| ไฟล์ | ทำอะไร |
|------|--------|
| `.scan/PROJECT-CONTEXT.md` | ข้อมูลสแกนจากโค้ดจริง |
| `GENERATE-DOCS-PROMPT-PHASE1.md` | ส่งให้ Opus → ได้สารบัญ (ยังไม่สร้าง HTML) |
| `GENERATE-DOCS-PROMPT-PHASE2.md` | หลังอนุมัติ outline → สร้าง HTML ทุกหน้า |
| `styles.css` | CSS สำหรับ HTML docs |

**ทางเลือก:** `AI_DOCS_OUTLINE=1` + `ANTHROPIC_API_KEY` → เรียก API สร้าง outline อัตโนมัติ

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
AI_DOCS_OUTLINE=1 bash .../setup-cursor.sh --local --create --project .
```

**Scaffold เก่า** (1 container = 1 html): `node scripts/generate-codebase-docs.mjs . --scaffold --force`

---

## แก้ปัญหา

| อาการ | วิธีแก้ |
|-------|---------|
| `Downloaded repo missing .cursor` | ใช้สคริปต์ล่าสุดจาก `main` (เขียนใหม่แล้ว) |
| `curl 404` | ตรวจว่า repo Public |
| ไม่มี docs | ติดตั้ง `node` แล้วรัน `--create` อีกครั้ง |

---

## โครงสร้าง repo

```text
my-cursor-rules/
├── .cursor/           # แพ็กเต็ม
├── rules/ skills/     # สำเนา (สคริปต์ใช้ได้ทั้งคู่)
├── docs-templates/
└── scripts/
    ├── setup-cursor.sh
    └── generate-codebase-docs.mjs
```
