---
description: Build stage — implement task ทีละตัว (หรือทั้งหมดด้วย auto) ตาม tasks/plan.md สร้าง feature branch ก่อนเริ่ม แล้ว commit + sync Jira ต่อ task
argument-hint: [auto (รันทุก task) หรือเว้นว่าง (task ถัดไปเท่านั้น)]
---

`$ARGUMENTS` คือ `auto` (รันทุก task ต่อเนื่อง) หรือเว้นว่าง (task ถัดไป 1 ตัวแล้วหยุด)

## ก่อนเริ่ม task แรกของ plan นี้ (ทำครั้งเดียวต่อ plan)

1. ตรวจว่ามี `tasks/plan.md` แล้ว — ถ้าไม่มี บอก user ให้รัน `/plan` ก่อน
2. อ่าน `docs/codebase-docs/project-blueprint.md` § 7 Git Workflow เพื่อรู้ base branch (ปกติคือ `develop`)
3. สร้าง branch ใหม่จาก base branch นั้น ชื่อ:
   - `feature/{JIRA-KEY}:{short-name}` ถ้า plan นี้มีการ์ด Jira (key มาจาก `tasks/plan.md`)
   - `feature/{short-name}` ถ้าไม่มีการ์ด
4. Checkout เข้า branch ใหม่นี้ — commit ทุก task ของ plan นี้จะเข้า branch เดียวกันนี้เท่านั้น

## ต่อ 1 task (ทำซ้ำตาม mode)

```
1. `@tester-agent` เขียน test ที่ต้อง FAIL จาก AC ของ task (RED) — backend ก่อน
2. `@senior-full-stack-agent` implement backend ให้ผ่าน (GREEN)
3. `@tester-agent` เขียน test ฝั่ง frontend/integration ของ task เดียวกัน
4. `@senior-full-stack-agent` implement frontend + integrate กับ backend จริง (GREEN)
5. รัน full test suite (regression) + build/compile check ตาม project-blueprint.md § 6
6. Commit เข้า feature branch — commit message อ้างชื่อ/key การ์ด Jira ถ้ามี
7. ถ้ามีการ์ด Jira: mark subtask ของ task นี้เป็น Done ใน Jira + อัปเดต status การ์ดหลัก (เช่น → In Progress ถ้าเป็น task แรก)
8. Mark task เป็น complete ใน tasks/todo.md
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
   - task นั่ high-risk/irreversible (auth, migration ที่ทำลายข้อมูล, payment, deploy, secrets)
5. เมื่อ user แก้ปัญหาที่ block แล้ว ให้รัน `/build auto` ซ้ำ — จะ resume จาก task ที่ยังไม่เสร็จ

## สรุปท้าย mode auto

รายงาน: task ที่เสร็จทั้งหมด, test ที่เพิ่ม, commit ที่สร้าง, และสิ่งที่ถูก skip/flag ไว้ให้ user ตัดสินใจ
