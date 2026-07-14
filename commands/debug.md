---
description: Debug workflow — /spec → /build → /verify → /review สำหรับงานแก้บั๊กที่ต้องผ่านทุก stage แบบมี test + verify จริง ต่างจาก Bug Fast Path ใน /spec ที่ข้ามไปแก้ตรงๆ (โปรเจกต์ mobile ที่ต้องการ reproduce ซ้ำบน simulator/emulator ให้ใช้ /regression-sim-use แยกหลังจบ workflow นี้)
argument-hint: [ลิงก์/key การ์ด Jira หรือคำอธิบาย bug ถ้าไม่มีการ์ด]
---

เริ่ม Debug workflow สำหรับ: $ARGUMENTS

Workflow นี้มี 4 stage (ไม่ใช่ 6 stage เต็มของ `/po-workflow`) — **ข้าม Plan** เพราะบั๊กมักเป็นงานชิ้นเดียวไม่ต้องแบ่ง task และ **ข้าม Ship** เพราะไม่ใช่ทุกบั๊กต้องมี GO/NO-GO fan-out เต็มรูป (ต้องการ ship แบบเป็นทางการ เรียก `/ship` แยกเองภายหลังได้)

## 1. `/spec` — เขียน SPEC.md เต็มรูปแบบ (ห้ามใช้ Bug Fast Path)

รัน `/spec $ARGUMENTS` ตามปกติ **ยกเว้นข้อเดียว**: แม้การ์ดจะเป็นประเภท Bug ก็ **ห้ามเข้า "Bug Fast Path"** (ข้อ 3 ของ `/spec`) — ให้ทำข้อ 4-7 เต็มรูปแบบเสมอ เพราะ workflow นี้ต้องการ `SPEC.md` จริงเป็น input ให้ `/build` และ `/verify`

เพิ่มเติมจาก `/spec` ปกติ: `SPEC.md` **ต้องมีหัวข้อ "ขั้นตอน reproduce บั๊ก"** ระบุ flow ที่ทำให้เกิดอาการ (กด/พิมพ์อะไรตามลำดับ หน้าไหน) ชัดเจนพอที่จะเล่นซ้ำผ่าน simulator/emulator ได้ในขั้น Verify — ถ้าข้อมูลจากการ์ด/user ไม่พอ ให้ถามก่อนเขียน

รอ user confirm `SPEC.md` ก่อนไปข้อ 2

## 2. `/build` — แก้แบบ RED → GREEN โดยไม่ต้องผ่าน `/plan`

ข้าม `/plan` (ไม่ต้องสร้าง `tasks/plan.md`/`tasks/todo.md`) ทำตามลำดับเดียวกับที่ `/build` ทำต่อ 1 task โดยตรง:

1. สร้าง feature branch จาก branch หลัก (ตาม `project-blueprint.md` § 7) ชื่อ `feature/{JIRA-KEY}/{short-name}` (หรือ `feature/{short-name}` ถ้าไม่มีการ์ด)
2. `@tester-agent` เขียน test ที่ reproduce บั๊กตามขั้นตอนใน `SPEC.md` — ต้อง **FAIL** ก่อน (พิสูจน์ว่าจับบั๊กได้จริง)
3. `@senior-full-stack-agent` แก้ root cause ให้ test ผ่าน (GREEN)
4. รัน regression + build/compile check ตาม `project-blueprint.md` § 6
5. Commit เข้า feature branch อ้างชื่อ/key การ์ด Jira ถ้ามี → sync Jira (subtask Done ถ้ามี, อัปเดต status การ์ดหลัก)

## 3. `/verify` — reproduce ซ้ำจนกว่าบั๊กจะหายจริง

รัน `/verify` ตามปกติ (lint/test/build เต็มชุด + user เช็ค UI เอง) — เล่นซ้ำ "ขั้นตอน reproduce บั๊ก" จาก `SPEC.md` แล้วเช็คว่าอาการยังเกิดอยู่ไหม (โปรเจกต์ mobile ที่ต้องการ reproduce ซ้ำผ่าน simulator/emulator อัตโนมัติ ให้รัน `/regression-sim-use` แยกหลังขั้นตอนนี้)

- **บั๊กยังไม่หาย** → กลับไปข้อ 2 (`/build`) ให้ `@senior-full-stack-agent`/`@refactor-agent` แก้ต่อ แล้ววน verify ซ้ำ
  - วนครบ **3 รอบ** แล้วบั๊กยังไม่หาย → หยุด รายงาน user ว่าลองแก้กี่รอบ ผลแต่ละรอบเป็นยังไง รอ user ตัดสินใจต่อ ห้ามวนต่อเองไม่จำกัด
- **บั๊กหายแล้ว** (reproduce ไม่เจออาการอีก + lint/test/build ผ่านหมด) → โชว์สรุปผลให้ user เพื่อ confirm รอบสุดท้าย → ไปข้อ 4

## 4. `/review` — 5-axis review + security audit

รัน `/review` ตามปกติบน diff ของ fix นี้ — Critical ต้องแก้ก่อนถือว่า debug workflow เสร็จ (ถ้าแก้ Critical เพิ่มระหว่าง review ให้ commit เข้า feature branch เดิมตามปกติ)

## 5. จบงาน — ถาม commit

เมื่อไม่มี Critical เหลือแล้ว (debug workflow เสร็จสมบูรณ์) ให้ถาม user ว่าต้องการ commit เลยไหม — ห้าม commit เองโดยไม่ถาม

ถ้า user confirm: commit การเปลี่ยนแปลงที่เหลือ (ถ้ามี diff ค้าง) เข้า feature branch ที่สร้างจาก develop ตั้งแต่ข้อ 2 ด้วย commit message รูปแบบ `{JIRA-KEY}: {สรุปสั้นๆ}` เช่น `AJI-1234: แก้เมนู title` (ถ้าไม่มีการ์ด Jira ใช้ `{short-name}: {สรุปสั้นๆ}` แทน)

---

## กฎการ orchestrate

- ห้ามข้าม stage และห้ามข้าม gate confirm ของแต่ละ stage (หลัง `/spec` ต้องรอ confirm ก่อนเข้า `/build` เสมอ)
- ห้ามเดาว่า user โอเคแล้วเดินหน้าเอง
- ถ้า user สั่งงานเล็กที่ไม่ต้องการผ่าน workflow เต็มรูปแบบนี้ — แนะนำให้ใช้ Bug Fast Path ปกติของ `/spec` แทน (เร็วกว่า ไม่ต้องผ่าน 4 stage)
