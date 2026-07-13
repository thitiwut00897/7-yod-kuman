---
description: Build stage — implement task ทีละตัว (หรือทั้งหมดด้วย auto) ตาม tasks/plan.md สร้าง feature branch ก่อนเริ่ม แล้ว commit + sync Jira ต่อ task
argument-hint: [auto (รันทุก task) หรือเว้นว่าง (task ถัดไปเท่านั้น)]
---

`$ARGUMENTS` คือ `auto` (รันทุก task ต่อเนื่อง) หรือเว้นว่าง (task ถัดไป 1 ตัวแล้วหยุด)

## ก่อนเริ่ม task แรกของ plan นี้ (ทำครั้งเดียวต่อ plan)

1. ตรวจว่ามี `tasks/plan.md` แล้ว — ถ้าไม่มี บอก user ให้รัน `/plan` ก่อน
2. อ่าน `docs/codebase-docs/project-blueprint.md` § 7 Git Workflow เพื่อรู้ base branch (ปกติคือ `develop`)
3. สร้าง branch ใหม่จาก base branch นั้น ชื่อ:
   - `feature/{JIRA-KEY}/{short-name}` ถ้า plan นี้มีการ์ด Jira (key มาจาก `tasks/plan.md`)
   - `feature/{short-name}` ถ้าไม่มีการ์ด
4. Checkout เข้า branch ใหม่นี้ — commit ทุก task ของ plan นี้จะเข้า branch เดียวกันนี้เท่านั้น

## ต่อ 1 task (ทำซ้ำตาม mode)

### ขั้นตอนหลัก

```
1. ถ้า task นี้มีส่วน frontend/UI — ขอรูปอ้างอิง (mockup/design) จาก user ก่อนเริ่ม
2. `@tester-agent` เขียน test ที่ต้อง FAIL จาก AC ของ task (RED) — backend ก่อน
3. `@senior-full-stack-agent` implement backend ให้ผ่าน (GREEN) — อ้างอิงรูปจากข้อ 1 ตอนวิเคราะห์ว่า frontend ต้องการข้อมูล/flag อะไร
4. `@tester-agent` เขียน test ฝั่ง frontend/integration ของ task เดียวกัน
5. `@senior-full-stack-agent` implement frontend ตามรูปอ้างอิงจากข้อ 1 + integrate กับ backend จริง (GREEN) — ห้ามเดา icon ที่ไม่มี asset จริงในรูป ต้องขอจาก user
6. UI check เทียบผลลัพธ์ที่ implement จริงกับรูปอ้างอิงจากข้อ 1 — เครื่องมือขึ้นกับ stack ของโปรเจกต์ (ดูรายละเอียดหัวข้อ "ขั้นที่ 6" ด้านล่าง)
7. รัน full test suite (regression) + build/compile check ตาม project-blueprint.md § 6
8. Commit เข้า feature branch — commit message อ้างชื่อ/key การ์ด Jira ถ้ามี
9. ถ้ามีการ์ด Jira: mark subtask ของ task นี้เป็น Done ใน Jira + อัปเดต status การ์ดหลัก (เช่น → In Progress ถ้าเป็น task แรก)
10. Mark task เป็น complete ใน tasks/todo.md
```

### ขั้นที่ 1 — ขอรูปอ้างอิง UI ก่อนเริ่ม task

1. ดู `tasks/plan.md` ก่อนว่า task นี้มี AC ที่เกี่ยวกับ UI/frontend ไหม — ถ้าเป็น backend-only task ข้ามขั้นนี้ไปเลย ไม่ต้องขอรูป
2. ถ้ามีรูปติดมากับ `SPEC.md`/การ์ด Jira อยู่แล้วตั้งแต่ตอน `/spec` ใช้รูปนั้นได้เลย ไม่ต้องขอซ้ำ
3. ถ้ายังไม่มีรูป — หยุดถาม user ตรงๆ ว่าขอรูป mockup/design ของ task นี้ ก่อนเริ่ม step 2 (RED test) **ห้ามเดา layout เองแล้วเดินหน้าไปก่อน** แม้จะดูเดาได้ก็ตาม
4. เก็บ path/ไฟล์รูปที่ได้ไว้อ้างอิงตลอด task นี้ — ใช้ทั้งตอนวิเคราะห์ backend contract (ขั้น 3), implement frontend (ขั้น 5), และเทียบผลลัพธ์ตอนปิด task (ขั้น 6)

### ขั้นที่ 6 — UI check เทียบรูปอ้างอิง (เลือกเครื่องมือตาม stack)

อ่าน `project-blueprint.md` § 1-2 ก่อนว่าโปรเจกต์นี้เป็น stack แบบไหน แล้วเลือกวิธีตามตาราง:

| Stack | เครื่องมือ auto-check | เงื่อนไขที่ใช้ได้ |
|---|---|---|
| Mobile (React Native / iOS / Android) | `sim-use` ขับ simulator/emulator | `project-blueprint.md` ต้องระบุ bundle id/scheme/คำสั่ง build ไว้ |
| Web | `webapp-testing` (Playwright) ขับ browser | ต้อง run local dev server ได้ (คำสั่ง start ดูจาก `project-blueprint.md` § 6) |
| Stack อื่นที่ไม่มีเครื่องมือ automate UI | ไม่มี auto-check | ให้ user เช็ค UI จริงเองก่อนปิด task แบบเดิม (ข้ามลูปด้านล่างทั้งหมด) |

ขั้นตอนย่อยของ auto-check (ทำแบบเดียวกันไม่ว่า mobile หรือ web ต่างกันแค่เครื่องมือ):

```
1. เปิดของจริงที่เพิ่ง implement ขึ้นมา
   - Mobile: build แอปขึ้น simulator/emulator ตามคำสั่งใน project-blueprint.md แล้วหา device id (UDID/serial)
   - Web: start dev server (ถ้ายังไม่รัน) แล้วเปิด browser ไปที่ route ของ feature นี้ผ่าน webapp-testing
2. ถ่าย screenshot ของหน้า/จอที่เพิ่งทำ
   - Mobile: `sim-use screenshot --device <UDID>`
   - Web: `page.screenshot()` ผ่าน webapp-testing
3. เทียบ screenshot ที่ได้กับรูปอ้างอิงจากขั้นที่ 1 ด้วย vision — เช็คทีละจุด: layout/โครงหน้าจอ, สี, spacing, icon, ข้อความ/label
4. ไม่ตรง → กลับไปแก้ frontend ต่อ (ขั้นตอนหลักข้อ 5) แล้ววนกลับมาทำขั้นนี้ใหม่ตั้งแต่ต้น — วนได้สูงสุด 3 รอบ
5. วนครบ 3 รอบแล้วยังไม่ตรง → หยุดทันที ห้ามวนต่อเอง รายงาน user ว่าแก้ไปกี่รอบ ต่างจากรูปตรงจุดไหนบ้างในแต่ละรอบ (พร้อม screenshot ทุกรอบ) รอ user ตัดสินใจว่าจะแก้ต่อหรือรับ diff ที่เหลือ
6. ตรงแล้ว (ครบทุกจุดที่เช็คในขั้น 3) → แจ้ง user มา confirm รอบสุดท้าย — **ไม่ตัดขั้นตอน user เช็คเองออกจาก flow** auto-check เป็นตัวกรองรอบแรกให้ ไม่ใช่ตัวแทน user
```

### Template รายงาน UI check ต่อ task

```
🖼️ UI Check — [ชื่อ task]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
เครื่องมือ: sim-use (mobile) / webapp-testing (web) / ไม่มี (user เช็คเอง)
รอบที่: [N]/3

| จุดที่เทียบ | ตรงกับรูปอ้างอิงไหม | หมายเหตุ |
|---|---|---|
| Layout | ✅/❌ | ... |
| สี/spacing | ✅/❌ | ... |
| Icon | ✅/❌ | ... |
| ข้อความ/label | ✅/❌ | ... |

Screenshot: [path]
→ [ไปขั้นถัดไป / กลับไปแก้ frontend รอบ N+1 / ครบ 3 รอบแล้ว รอ user ตัดสินใจ]
```

## Mode: default (ไม่มี argument)

ทำ 1 task ตามลำดับข้างบน แล้ว**หยุด** — รอ user สั่งรัน `/build` ต่อสำหรับ task ถัดไป

## Mode: `auto`

1. ขอ approve **ครั้งเดียว** สำหรับ task ที่เหลือทั้งหมดใน `tasks/plan.md`
2. ถ้า user ตอบกำกวม (เช่น "ดูโอเคนะ") ให้ถือว่า**ไม่ approve** — ต้องได้คำตอบยืนยันชัดเจน (เช่น "approve", "ไปเลย")
3. หลัง approve แล้ว รันทุก task ตามลำดับ dependency ต่อเนื่องโดยไม่หยุดถามระหว่าง task — แต่ยังทำครบทุก step (1-8) ของแต่ละ task รวมถึง commit แยกต่อ task
4. **หยุดและถาม user** ทันทีเมื่อ:
   - test/build fail แล้วไม่มีวิธีแก้ที่ชัดเจน (ส่งต่อ `@refactor-agent` แล้วยัง fail)
   - AC ของ task คลุมเครือจนตัดสินใจไม่ได้
   - task นั้น high-risk/irreversible (auth, migration ที่ทำลายข้อมูล, payment, deploy, secrets)
5. เมื่อ user แก้ปัญหาที่ block แล้ว ให้รัน `/build auto` ซ้ำ — จะ resume จาก task ที่ยังไม่เสร็จ

## สรุปท้าย mode auto

รายงาน: task ที่เสร็จทั้งหมด, test ที่เพิ่ม, commit ที่สร้าง, และสิ่งที่ถูก skip/flag ไว้ให้ user ตัดสินใจ
