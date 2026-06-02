# AI Guide

> คู่มือสั้นๆ สำหรับ AI Agent ในโปรเจกต์นี้ — ปรับเนื้อหาให้ตรงโปรเจกต์หลังสร้าง HTML docs ใน Phase 2

## เริ่มต้นอ่านอะไร

1. `docs/codebase-docs/project-blueprint.md` — ภาพรวมโครงสร้าง
2. `docs/codebase-docs/index.html` และหน้า HTML อื่นในโฟลเดอร์เดียวกัน
3. `.cursor/rules/architecture.mdc` — รายละเอียดเชิงลึก (ถ้ามี)
4. `.cursor/.cursorrules` และ `.cursor/skills/` — กฎและแนวทาง implement

## โฟลเดอร์สำคัญ

| Path | ใช้เมื่อ |
|------|----------|
| `docs/codebase-docs/` | เอกสาร codebase (HTML + blueprint) |
| `docs/work-summary/` | สรุปงานยาว (ตาม work-summary rule) |
| `src/containers/` | หน้าจอ / features |
| `src/components/` | UI แชร์ |

## สร้าง docs ครั้งแรก

ดู README ที่ repo `my-cursor-rules` — ใช้ `setup-cursor.sh --create` แล้ว copy prompt จาก `docs/codebase-docs/prompts/` (จะถูก copy เข้าโปรเจกต์ตอน install)
