# AI Guide — แผนที่ค้นหาสำหรับ AI Agent

> **วัตถุประสงค์:** สรุปภาพรวมโปรเจกต์ + แนะนำว่าควรอ่านไฟล์/skill ไหนก่อนเริ่มงานแต่ละประเภท
> **สร้างโดย:** `/init-project-docs` (plugin `7-yod-kuman`) — ปรับให้ตรงกับโปรเจกต์จริง

---

## เริ่ม session — อ่านตามลำดับนี้

1. `docs/codebase-docs/project-blueprint.md` — โครงสร้าง, stack, โฟลเดอร์หลัก
2. ไฟล์นี้ (`AI-GUIDE.md`) — เลือก path/skill ตามประเภทงานด้านล่าง
3. Skill ที่เกี่ยวข้องกับงาน (ดูตาราง)

---

## เลือกอ่านตามประเภทงาน

| ประเภทงาน | อ่านอะไร |
|---|---|
| งาน UI / Layout | skill `ui-guide-template`, `visual-markers` |
| งาน Logic / State / API | skill `codeing-guide` |
| งาน Clean Code / แยกไฟล์ | skill `clean-code` |
| งาน API Design (backend) | skill `api-design` |
| งาน Diagram / Architecture Doc | skill `archify` |
| งานที่มี Refinement หลายรอบ | skill `system-optimization` (บันทึกบทเรียน) |
| ต้องการเวิร์กโฟลว์ Test-Case Gate เต็มรูปแบบ | `/po-workflow` (เรียก `@po-agent`) |

---

## หมายเหตุ

ไฟล์นี้เป็น placeholder เริ่มต้น — เมื่อโปรเจกต์มีเอกสารเพิ่ม (เช่น `docs/codebase-docs/*.html`, ADR, diagram) ให้เพิ่ม path เข้ามาในตารางด้านบนเพื่อให้ AI Agent หาข้อมูลได้เร็วขึ้น
