# my-cursor-rules

แพ็ก Cursor สำหรับใช้ข้ามหลายโปรเจกต์ — `rules/`, `skills/`, `agents/`, `cursor.md` และสคริปต์ติดตั้งอัตโนมัติ

**Repo:** https://github.com/thitiwut00897/my-cursor-rules

---

## โครงสร้าง repo

```text
my-cursor-rules/
├── rules/              # กฎ .mdc (Cursor Project Rules)
├── skills/             # แนวทาง UI, logic, clean-code ฯลฯ
├── agents/             # คำอธิบาย sub-agent
├── cursor.md
├── .cursor/            # สำเนาเดียวกัน (สคริปต์ใช้ .cursor/ หรือ root ก็ได้)
├── docs-templates/     # ไฟล์เริ่มต้นใน docs/codebase-docs/
└── scripts/
    └── setup-cursor.sh
```

---

## ติดตั้งในโปรเจกต์อื่น (แนะนำ)

### ขั้นที่ 1 — Clone repo กลาง (ครั้งเดียวบนเครื่อง)

```bash
git clone https://github.com/thitiwut00897/my-cursor-rules.git ~/Github-Work/my-cursor-rules
```

### ขั้นที่ 2 — รัน setup ในโปรเจกต์ปลายทาง

```bash
cd /path/to/your-other-project

bash ~/Github-Work/my-cursor-rules/scripts/setup-cursor.sh --local
```

**สคริปต์จะทำให้:**

| การกระทำ | รายละเอียด |
|----------|------------|
| ติดตั้ง `.cursor/` | copy `rules/`, `skills/`, `agents/`, `cursor.md`, `.cursorrules` |
| Backup | ถ้ามี `.cursor` เดิม → เปลี่ยนชื่อเป็น `.cursor.backup.YYYYMMDD_HHMMSS` |
| สร้าง `docs/work-summary/` | สำหรับ rule สรุปงานยาว |
| **สแกนโปรเจกต์ + สร้าง `docs/codebase-docs/`** | HTML + Markdown อัตโนมัติ (ดูด้านล่าง) |

### ส่วน `docs/codebase-docs` ทำอะไร

ถ้าโปรเจกต์**ยังไม่มี** `docs/codebase-docs/index.html` สคริปต์จะ:

1. อ่าน `package.json` (ชื่อแอป, React Native / React version)
2. สแกนโฟลเดอร์หลัก เช่น `src/containers/` → **แต่ละโฟลเดอร์ = 1 feature**
3. นับ components, API, reducers, routes
4. สร้างไฟล์พร้อมใช้:
   - **HTML:** `index.html`, `overview.html`, `architecture.html`, `navigation.html`, `api-layer.html`, `state-management.html`, `components.html`, `features/<feature>.html`, …
   - **Markdown:** `project-blueprint.md`, `AI-GUIDE.md`, `features/<feature>.md`
   - **`styles.css`** จาก template (แบบ Well Life)

ถ้ามี docs อยู่แล้ว → **ไม่ทับ** (ใช้ `--regenerate-docs` เพื่อสร้างใหม่)

> เอกสารที่ได้เป็น ** scaffold จากโครงสร้าง code** — ควรให้ Agent/ทีมเติม business logic, API flow, และรายละเอียดเพิ่มหลัง setup

### ขั้นที่ 3 — ปรับให้ตรงโปรเจกต์

1. แก้ `docs/codebase-docs/project-blueprint.md` ให้ตรง stack / โฟลเดอร์จริง
2. แก้ `.cursor/rules/architecture.mdc` ถ้ายังอ้าง Well Life — หรือสร้างใหม่สำหรับโปรเจกต์นั้น
3. เปิด Cursor → **Settings → Rules, Commands** → ตรวจว่า Project Rules โหลดครบ

### ขั้นที่ 4 (ทางเลือก) — เก็บสคริปต์ไว้ในโปรเจกต์ปลายทาง

```bash
bash ~/Github-Work/my-cursor-rules/scripts/setup-cursor.sh --local --copy-script --project .
```

ครั้งถัดไปในโปรเจกต์นั้นรันได้จาก:

```bash
bash scripts/setup-cursor.sh --local
```

---

## ติดตั้งโดยไม่ clone ล่วงหน้า (ดึงจาก GitHub)

```bash
cd /path/to/your-project

bash <(curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh) \
  --repo https://github.com/thitiwut00897/my-cursor-rules.git \
  --project .
```

---

## ตัวเลือกสคริปต์

| Option | ความหมาย |
|--------|----------|
| `--local` | ใช้ repo บนเครื่อง (โฟลเดอร์ที่อยู่เหนือ `scripts/`) |
| `--repo <url>` | clone จาก Git แล้วติดตั้ง |
| `--project <path>` | โปรเจกต์ปลายทาง (default: โฟลเดอร์ปัจจุบัน) |
| `--overwrite` | ทับ `.cursor` เดิมโดยไม่ backup |
| `--copy-script` | copy `setup-cursor.sh` + `generate-codebase-docs.mjs` ไปที่ `scripts/` ในโปรเจกต์ปลายทาง |
| `--skip-docs` | ติดตั้งเฉพาะ `.cursor` ไม่สร้าง docs |
| `--regenerate-docs` | บังคับสร้าง `docs/codebase-docs` ใหม่ทั้งชุด |
| `-h`, `--help` | แสดงวิธีใช้ |

---

## อัปเดตแพ็กกลางในโปรเจกต์ที่ติดตั้งแล้ว

```bash
cd /path/to/your-project
bash ~/Github-Work/my-cursor-rules/scripts/setup-cursor.sh --local
```

สคริปต์จะ backup `.cursor` เดิมแล้วติดตั้งเวอร์ชันล่าสุดจาก repo กลาง

---

## MCP (ตั้งครั้งเดียวต่อเครื่อง)

กฎ Sonar / Jira ต้องการ MCP — ตั้งใน **Cursor Settings → MCP** (ระดับ user ไม่ต้องอยู่ใน repo นี้)

---

## หมายเหตุ

- **Well Life–specific:** `architecture.mdc` ในแพ็กนี้ยังอิงโปรเจกต์ต้นแบบ — โปรเจกต์ใหม่ควรแก้หรือแทนที่
- **Remote Rule (GitHub):** Cursor import ได้เฉพาะ `.mdc` เป็นหลัก — repo นี้ใช้สคริปต์ติดตั้ง **ทั้ง `.cursor`** แทน
