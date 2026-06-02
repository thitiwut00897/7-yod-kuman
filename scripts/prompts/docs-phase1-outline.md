# งาน: วิเคราะห์โปรเจกต์และสรุปสารบัญ Documentation (Phase 1)

@Workspace ช่วยวิเคราะห์โปรเจกต์นี้ทั้งหมดอย่างละเอียด เพื่อเตรียมทำระบบ Documentation ในรูปแบบไฟล์ HTML โดยเซฟไว้ในโฟลเดอร์ `docs/codebase-docs/`

**โมเดลที่แนะนำ:** Claude Opus (หรือ Opus 4.6 ใน Cursor)

## เป้าหมาย

เพื่อให้ Developer คนอื่น หรือ AI ตัวอื่นในอนาคต มาอ่านแล้วเข้าใจระบบการทำงานทั้งหมดทันทีโดยไม่ต้องไปไล่โค้ดเอง

## ขั้นตอนนี้ (Phase 1 เท่านั้น)

**อย่าเพิ่งสร้างไฟล์ HTML** — ตอบกลับมาเป็นโครงสร้างหัวข้อก่อน เพื่อให้ตรวจสอบความถูกต้อง

ครอบคลุม:

### 1. ฟีเจอร์หลัก (Core Features)

- โปรเจกต์นี้มีฟีเจอร์หลักอะไรบ้าง (จัดกลุ่มตาม business ไม่ใช่ 1 container = 1 feature)
- แต่ละฟีเจอร์ทำหน้าที่อะไร
- ระบุ containers / screens ที่เกี่ยวข้อง

### 2. โครงสร้างโฟลเดอร์และไฟล์สำคัญ (Architecture & File Mapping)

- ไฟล์/โฟลเดอร์สำคัญทำหน้าที่อะไร
- data flow คร่าวๆ (UI → state → API)

### 3. สารบัญ HTML ที่จะสร้างใน Phase 2

อ้างอิงรูปแบบเดียวกับ Well Life / MeSook:

| ไฟล์ | เนื้อหา |
|------|---------|
| `index.html` | Home, stats, quick links |
| `overview.html` | Tech stack, identity |
| `architecture.html` | Folder map, patterns |
| `navigation.html` | Routes, stacks, tabs |
| `state-management.html` | Redux reducers/actions |
| `api-layer.html` | API services |
| `components.html` | Shared components |
| `theme-styling.html` | Theme / styled-components |
| `utilities.html` | Helpers |
| `features/*.html` | แต่ละฟีเจอร์หลัก |

ใช้ `styles.css` เดียวกัน + sidebar navigation เหมือนกันทุกหน้า

---

## ข้อมูลสแกนจากโปรเจกต์ (อ่านประกอบ)

{{PROJECT_SCAN}}

---

## หลัง Phase 1 อนุมัติแล้ว

รัน Phase 2 ด้วย prompt ใน `docs/codebase-docs/GENERATE-DOCS-PROMPT-PHASE2.md`
