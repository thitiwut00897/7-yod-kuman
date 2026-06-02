# my-cursor-rules

แพ็ก Cursor (`rules`, `skills`, `agents`) + สคริปต์ติดตั้งในโปรเจกต์ React Native / mobile อื่น

**Repo:** https://github.com/thitiwut00897/my-cursor-rules

---

## วิธีใช้ (3 ขั้นตอน)

### Step 1 — ติดตั้ง `.cursor` + เตรียม docs

เลือกวิธีใดวิธีหนึ่ง:

#### แบบ A: ไม่ต้อง clone (แนะนำ — copy คำสั่งเดียว)

```bash
cd /path/to/your-project
curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --create --project .
```

> **สำคัญ:** ต้องมี `bash -s --` ก่อน `--create`  
> ถ้าสำเร็จจะเห็น `✅ เสร็จแล้ว` และมีโฟลเดอร์ `.cursor/` ในโปรเจกต์

#### แบบ B: clone repo กลางไว้บนเครื่อง

```bash
git clone https://github.com/thitiwut00897/my-cursor-rules.git ~/Github-Work/my-cursor-rules
cd /path/to/your-project
bash ~/Github-Work/my-cursor-rules/scripts/setup-cursor.sh --local --create --project .
```

#### อัปเดต rules อย่างเดียว (ไม่แตะ docs)

```bash
curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --update --project .
```

**ต้องมี:** `git` หรือ `curl`+`unzip`, **Node.js 18+** (สำหรับ `--create`)

---

### Step 2 — สร้าง HTML docs ใน Cursor (copy prompt เอง)

สคริปต์ **ไม่รัน AI ให้** — เปิด Cursor Agent แล้ว copy prompt ตามลำดับ:

| ลำดับ | ไฟล์ที่ copy | ทำอะไร |
|-------|----------------|--------|
| **2.1** | `docs/codebase-docs/prompts/phase1-copy.txt` | วางในแชท Agent → ได้สารบัญ (outline) |
| **2.2** | — | บันทึกคำตอบเป็น `docs/codebase-docs/OUTLINE-PHASE1.md` |
| **2.3** | `docs/codebase-docs/prompts/phase2-copy.txt` | วางในแชท Agent → สร้าง HTML ทุกหน้า |

**วิธี copy**

1. เปิดไฟล์ `.txt` ใน Cursor  
2. `Cmd+A` → `Cmd+C`  
3. วางในแชท **Agent** (แนะนำโมเดล Opus) → ส่ง  

Agent จะอ่านจากโปรเจกต์นี้เท่านั้น:

- `docs/codebase-docs/.scan/PROJECT-CONTEXT.md` — ข้อมูลสแกน  
- `docs/codebase-docs/_template/HTML-TEMPLATE-GUIDE.md` — กฎโครง HTML  
- `docs/codebase-docs/_template/page-root.html` / `page-feature.html` — แม่แบบ  
- ไฟล์ `.html` ที่มีอยู่แล้ว (ถ้ามี) — ให้หน้าใหม่เหมือนกัน  

คู่มือเต็ม: `docs/codebase-docs/HOW-TO-GENERATE-DOCS.md`

---

### Step 3 — เสร็จ พร้อมใช้

เมื่อ Phase 2 เสร็จ โปรเจกต์พร้อมใช้งานดังนี้:

| สิ่งที่ได้ | ใช้เมื่อ |
|-----------|----------|
| `.cursor/rules/`, `skills/`, `agents/` | Cursor อ่าน rules อัตโนมัติ — ตรวจที่ **Settings → Rules** |
| `docs/codebase-docs/*.html` | เปิด `index.html` ใน browser อ่าน docs ทีม |
| `docs/codebase-docs/project-blueprint.md` | AI / dev อ่านภาพรวมโปรเจกต์ |
| `docs/codebase-docs/AI-GUIDE.md` | แนะนำ Agent หาข้อมูลใน repo |

**เช็คว่าพร้อม**

- [ ] Cursor เห็น rules (~12 ไฟล์ใน `.cursor/rules/`)  
- [ ] เปิด `docs/codebase-docs/index.html` แล้ว sidebar + ลิงก์ครบ  
- [ ] มี `features/*.html` ตามฟีเจอร์ของโปรเจกต์  

---

## สรุป flow

```
Step 1: setup-cursor.sh --create
        → .cursor/ + docs/codebase-docs/_template/ + prompts/ + .scan/

Step 2: copy phase1-copy.txt → OUTLINE-PHASE1.md
        → copy phase2-copy.txt → HTML ครบ

Step 3: ใช้ Cursor + เปิด docs ใน browser ✅
```

---

## ไฟล์ที่ `--create` สร้างในโปรเจกต์

```text
your-project/
├── .cursor/                    ← rules, skills, agents
└── docs/
    └── codebase-docs/
        ├── HOW-TO-GENERATE-DOCS.md
        ├── prompts/
        │   ├── phase1-copy.txt   ← Step 2.1
        │   └── phase2-copy.txt     ← Step 2.3
        ├── _template/              ← แม่แบบ HTML
        ├── .scan/PROJECT-CONTEXT.md
        ├── styles.css
        └── index.html              ← placeholder จนกว่า Phase 2 เสร็จ
```

---

## แก้ปัญหา

| อาการ | วิธีแก้ |
|-------|---------|
| ไม่มีอะไรเกิดขึ้นหลัง curl | ใช้ `bash -s -- --create` ไม่ใช่ `\| bash` อย่างเดียว |
| ขึ้น `ไม่พบ --create` | ลืม `bash -s --` |
| ไม่มี `HOW-TO` / `prompts/` | ติดตั้ง Node 18+ แล้วรัน `--create` อีกครั้ง |
| มี `.cursor` แต่ไม่มี HTML | ปกติ — ทำ Step 2 ใน Cursor |
| `curl 404` | ตรวจว่า repo Public |

---

## โครงสร้าง repo กลาง (my-cursor-rules)

```text
my-cursor-rules/
├── .cursor/
├── docs-templates/codebase-docs/   # template + prompt (แหล่งเดียวใน repo กลาง)
│   ├── styles.css
│   ├── _template/
│   └── prompts/
└── scripts/
    ├── setup-cursor.sh           # --create copy ไปโปรเจกต์ปลายทาง
    └── generate-codebase-docs.mjs
```
