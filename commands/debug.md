---
description: Debug workflow — /spec → /build → /verify (sim-use ลอง reproduce บั๊กซ้ำ ถ้ายังไม่หายกลับไปแก้ใหม่) → /review สำหรับงานแก้บั๊กที่ต้องผ่านทุก stage แบบมี test + verify จริงบน simulator/emulator ต่างจาก Bug Fast Path ใน /spec ที่ข้ามไปแก้ตรงๆ
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

## 3. `/verify` ด้วย sim-use loop — reproduce ซ้ำจนกว่าบั๊กจะหายจริง

รัน lint/test/build เต็มชุดตามปกติของ `/verify` ก่อน แล้วต่อด้วย sim-use loop

**บังคับ:** ถ้าบั๊กที่แก้เกี่ยวข้องกับ UI ของ mobile app (React Native/iOS/Android) — **ต้องทดสอบด้วย sim-use เสมอ ห้ามข้าม** แม้ `project-blueprint.md` จะยังไม่มีข้อมูล bundle id/scheme/คำสั่ง build ก็ให้หยุดถาม user ขอข้อมูลนี้ก่อน แทนที่จะข้ามไปให้ user เช็คเองเฉยๆ

ข้ามได้เฉพาะกรณี: บั๊กไม่เกี่ยวกับ UI เลย (backend logic, API, data processing ล้วนๆ) หรือโปรเจกต์ไม่ใช่ mobile app (ไม่มี simulator/emulator ให้ทดสอบ) — เท่านั้นจึงให้ user reproduce/verify เองแทน

```
1. Build แอปขึ้น simulator/emulator ตามคำสั่งใน project-blueprint.md แล้วหา device id
2. อ่าน skills/sim-use/SKILL.md ทำ preflight
3. เล่นซ้ำ "ขั้นตอน reproduce บั๊ก" จาก SPEC.md ผ่าน sim-use ทีละ step (ui → tap/type ตาม flow → ui เช็คผล)
4. เช็คว่าอาการบั๊กยังเกิดอยู่ไหม เทียบกับที่ SPEC.md ระบุ — ถ่าย screenshot เก็บหลักฐานทุกครั้ง
5. เจอสัญญาณแอปเด้ง (PROCESS DISAPPEARED / crash dialog) → หยุดทันที ห้าม relaunch เอง รายงาน user แล้วรอคำสั่ง (skills/sim-use/references/crash-awareness.md)
```

- **บั๊กยังไม่หาย** → กลับไปข้อ 2 (`/build`) ให้ `@senior-full-stack-agent`/`@refactor-agent` แก้ต่อ แล้ววน verify ซ้ำ
  - วนครบ **3 รอบ** แล้วบั๊กยังไม่หาย → หยุด รายงาน user ว่าลองแก้กี่รอบ ผลแต่ละรอบเป็นยังไง (พร้อม screenshot) รอ user ตัดสินใจต่อ ห้ามวนต่อเองไม่จำกัด
- **บั๊กหายแล้ว** (sim-use reproduce ไม่เจออาการอีก + lint/test/build ผ่านหมด) → โชว์สรุปผล + screenshot ก่อน/หลังให้ user เพื่อ confirm รอบสุดท้าย → ไปข้อ 4

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
