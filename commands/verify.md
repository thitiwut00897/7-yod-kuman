---
description: Verify stage — full regression gate หลัง Build ครบทุก task ในแผน (ไม่ใช่ต่อ task) + เช็ค UI ของฟีเจอร์ทั้งหมดด้วย sim-use อัตโนมัติ (ถ้าโปรเจกต์ตั้งค่าไว้) ควบคู่กับ user confirm เอง
---

เริ่ม Verify stage:

1. ตรวจว่าทุก task ใน `tasks/todo.md` ถูก mark complete แล้ว — ถ้ายังไม่ครบ แจ้ง user ว่ายังมี task ที่ยังไม่เสร็จ ถามว่าจะ verify เท่าที่มีอยู่หรือรอให้ Build ครบก่อน

2. `@tester-agent` รัน:
   - Lint เต็มโปรเจกต์ (frontend + backend ตาม `project-blueprint.md` § 6)
   - Test suite เต็มชุด (ไม่ใช่แค่ไฟล์ที่แก้)
   - Build/compile check เต็มชุด

3. เช็ค UI ของฟีเจอร์ทั้งหมด (ไม่ใช่แค่ทีละ task) เทียบกับ `SPEC.md` และการ์ด Jira ต้นฉบับ (ถ้ามี) — ทำ 2 ทางร่วมกัน ไม่แทนที่กัน:

   **a. Automated (เฉพาะโปรเจกต์ mobile ที่ `project-blueprint.md` ระบุให้ใช้ sim-use):**
   `@tester-agent` build แอปขึ้น simulator/emulator ตามคำสั่งจริงใน `project-blueprint.md`, ต่อ sim-use, ไล่เช็คทีละ AC ใน `SPEC.md` ด้วย observe→act→verify loop, ถ่าย `sim-use screenshot` เก็บเป็นหลักฐานทุกจุดสำคัญ
   ถ้าเจอสัญญาณแอปเด้ง (process disappeared / crash dialog) — **หยุดทันที ห้าม relaunch เอง** รายงาน banner ให้ user แล้วรอคำสั่ง (ตาม `skills/sim-use/references/crash-awareness.md`)

   **b. User confirm (ทำเสมอ ไม่ว่าจะมี automated pass หรือไม่):**
   ให้ user เช็ค UI เอง — ถ้ามี automated pass จากข้อ a แล้ว ให้โชว์สรุปผล + screenshot ประกอบ เพื่อให้ user spot-check เฉพาะจุดที่ยังไม่มั่นใจแทนที่จะไล่ทุก AC เอง ถ้าไม่มี automated pass (ไม่ใช่ mobile project หรือยังไม่ได้ตั้งค่า sim-use) ให้ user เช็คแบบเดิมทั้งหมด

4. **FAIL** (lint/test/build, automated UI check พบ mismatch, หรือ user เห็นว่า UI ไม่ตรง): ส่ง `@refactor-agent` แก้ตาม report → รัน `/verify` ซ้ำ

5. **PASS** (lint/test/build ผ่าน + user confirm UI แล้ว): แจ้ง user ว่าพร้อมไป `/review` แล้ว
