---
description: Scaffold docs/codebase-docs/project-blueprint.md + AI-GUIDE.md ในโปรเจกต์นี้ และผูก reference ไว้ใน CLAUDE.md — รันครั้งเดียวต่อโปรเจกต์
---

Scaffold เอกสารโครงสร้างโปรเจกต์สำหรับ 7-yod-kuman ในโปรเจกต์ปัจจุบัน (path ที่รันคำสั่งนี้อยู่ ไม่ใช่ตัว plugin เอง):

1. **สร้าง `docs/codebase-docs/` ถ้ายังไม่มี**

2. **`docs/codebase-docs/project-blueprint.md`**
   - ถ้ายังไม่มีไฟล์นี้: copy เนื้อหาจาก `${CLAUDE_PLUGIN_ROOT}/docs/templates/project-blueprint.md` มาเป็นจุดเริ่ม แล้ว **สแกนโปรเจกต์จริง** (package.json, โครงสร้างโฟลเดอร์, ไฟล์ config) เพื่อเติมข้อมูลที่รู้ได้อัตโนมัติ (ชื่อโปรเจกต์, stack, entry point, โฟลเดอร์หลัก) แทนการทิ้ง placeholder ไว้ทั้งหมด — ส่วนที่เดาไม่ได้ให้คงเป็น placeholder ให้ user เติมเอง
   - ถ้ามีไฟล์นี้อยู่แล้ว: **ห้ามทับ** — แจ้ง user ว่ามีอยู่แล้วที่ path นี้ และถามว่าต้องการให้ช่วย diff/อัปเดตเฉพาะส่วนที่ล้าสมัยไหม

3. **`docs/codebase-docs/AI-GUIDE.md`**
   - ถ้ายังไม่มี: copy จาก `${CLAUDE_PLUGIN_ROOT}/docs/templates/AI-GUIDE.md` แล้วปรับให้ตรงกับโปรเจกต์ (เช่น path เอกสารจริงที่มี)
   - ถ้ามีอยู่แล้ว: ห้ามทับ เช่นเดียวกับข้อ 2

4. **CLAUDE.md ของโปรเจกต์**
   - ถ้า **ไม่มี** `CLAUDE.md` ที่ root โปรเจกต์: สร้างไฟล์ใหม่ที่มีเนื้อหาเริ่มต้นสั้นๆ พร้อมบรรทัด reference:
     ```
     @docs/codebase-docs/project-blueprint.md
     ```
   - ถ้า **มีอยู่แล้ว**: ตรวจก่อนว่ามีบรรทัด reference ไปที่ `docs/codebase-docs/project-blueprint.md` อยู่แล้วหรือยัง (ทั้งแบบ `@docs/codebase-docs/project-blueprint.md` หรือคำอธิบายที่ชี้ไป path เดียวกัน) — ถ้ายังไม่มี ให้ **append** ส่วนใหม่ต่อท้ายไฟล์:
     ```markdown
     ## Project Architecture
     @docs/codebase-docs/project-blueprint.md
     ```
     ถ้ามีอยู่แล้วไม่ต้องทำอะไรเพิ่ม (idempotent — รันคำสั่งนี้ซ้ำได้โดยไม่ append ซ้ำ)

5. สรุปให้ user เห็นว่าสร้าง/ข้ามไฟล์ไหนบ้าง และเตือนให้เข้าไปเติมข้อมูลจริงใน `project-blueprint.md` ส่วนที่ยังเป็น placeholder
