# งาน: สร้าง Documentation HTML เต็มรูปแบบ (Phase 2)

@Workspace สร้างระบบ Documentation HTML ใน `docs/codebase-docs/` ตาม **OUTLINE-PHASE1.md** ที่อนุมัติแล้ว

**โมเดลที่แนะนำ:** Claude Opus (หรือ Opus 4.6 ใน Cursor)

## กฎบังคับ

1. **รูปแบบ HTML** — ใช้โครงสร้างเดียวกับ Well Life:
   - `styles.css` (มีอยู่แล้วในโฟลเดอร์)
   - Sidebar navigation เหมือนกันทุกหน้า
   - `<main class="main-content">` + sections, cards, tables
   - ภาษาไทยได้เมื่อเหมาะสม

2. **ไฟล์ที่ต้องมี** (ปรับตาม outline):
   - `index.html`, `overview.html`, `architecture.html`
   - `navigation.html`, `state-management.html`, `api-layer.html`
   - `components.html`, `theme-styling.html`, `utilities.html`
   - `features/<feature-slug>.html` ตามฟีเจอร์หลักที่อนุมัติ

3. **เนื้อหาต้องมาจากโค้ดจริง** — อ่านไฟล์ในโปรเจกต์ ไม่เดา
4. อัปเดต `project-blueprint.md` และ `AI-GUIDE.md` ให้ตรงโปรเจกต์นี้
5. วันที่ "อัปเดตล่าสุด" ใช้วันนี้

## อ้างอิง

- Outline: `docs/codebase-docs/OUTLINE-PHASE1.md`
- Scan data: `docs/codebase-docs/.scan/PROJECT-CONTEXT.md`
- ตัวอย่างรูปแบบ: Well Life `docs/codebase-docs/` (sidebar, stats-row, card-grid, file-tree)

## ข้อมูลสแกน

{{PROJECT_SCAN}}
