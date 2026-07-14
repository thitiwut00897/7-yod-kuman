---
description: Verify stage — full regression gate หลัง Build ครบทุก task ในแผน (ไม่ใช่ต่อ task) + เช็ค UI ของฟีเจอร์ทั้งหมดด้วย user confirm เอง
---

เริ่ม Verify stage:

1. ตรวจว่าทุก task ใน `tasks/todo.md` ถูก mark complete แล้ว — ถ้ายังไม่ครบ แจ้ง user ว่ายังมี task ที่ยังไม่เสร็จ ถามว่าจะ verify เท่าที่มีอยู่หรือรอให้ Build ครบก่อน

2. `@tester-agent` รัน:
   - Lint เต็มโปรเจกต์ (frontend + backend ตาม `project-blueprint.md` § 6)
   - Test suite เต็มชุด (ไม่ใช่แค่ไฟล์ที่แก้)
   - Build/compile check เต็มชุด

3. เช็ค UI ของฟีเจอร์ทั้งหมด (ไม่ใช่แค่ทีละ task) เทียบกับ `SPEC.md` และการ์ด Jira ต้นฉบับ (ถ้ามี) — ให้ user เช็ค UI เองทั้งหมด (โปรเจกต์ mobile ที่ต้องการ regression test ผ่าน simulator/emulator ให้ใช้ `/regression-sim-use` แยกต่างหาก ไม่ใช่ส่วนหนึ่งของ `/verify` นี้)

4. **FAIL** (lint/test/build หรือ user เห็นว่า UI ไม่ตรง): ส่ง `@refactor-agent` แก้ตาม report → รัน `/verify` ซ้ำ

5. **PASS** (lint/test/build ผ่าน + user confirm UI แล้ว): แจ้ง user ว่าพร้อมไป `/review` แล้ว
