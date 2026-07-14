---
description: Regression test มือถือด้วย sim-use — replay flow script ทั้งหมดใน tester_flow/ (หรือระบุหน้าเดียว) แล้วเก็บ screenshot ให้ user ตรวจเอง หรือ record flow ใหม่/อัปเดต flow เดิม
argument-hint: [record <feature-name>/<page-name> เพื่ออัด flow ใหม่ | <feature-name>/<page-name> เพื่อ replay เฉพาะหน้านั้น | เว้นว่างเพื่อ replay ทุก flow]
---

`$ARGUMENTS` คือหนึ่งใน:
- เว้นว่าง — replay ทุก flow script ที่มีอยู่ใน `tester_flow/`
- `<feature-name>/<page-name>` — replay เฉพาะ flow ของหน้านั้น
- `record <feature-name>/<page-name>` — อัด flow ใหม่ (หรืออัปเดต flow เดิมถ้ามีอยู่แล้ว)

คำสั่งนี้แยกออกจาก `/build`/`/verify`/`/debug` โดยเจตนา — ใช้เมื่อต้องการ regression test มือถือผ่าน simulator/emulator จริงเท่านั้น ไม่ใช่ gate บังคับของ workflow หลัก

## 0. Preflight (ทำก่อนทุกโหมด)

1. อ่าน `docs/codebase-docs/project-blueprint.md` § 1-2 — ยืนยันว่าโปรเจกต์นี้ระบุ bundle id/scheme/คำสั่ง build ไว้สำหรับ sim-use แล้ว ถ้าไม่มีข้อมูลนี้ หยุดถาม user ก่อน ห้ามเดา
2. มอบหมายให้ `@tester-agent` เป็นคนขับ sim-use ทั้งหมดในคำสั่งนี้ (ดู `agents/tester-agent.md`)
3. `@tester-agent` build แอปขึ้น simulator/emulator ตามคำสั่งจริงใน `project-blueprint.md` แล้วหา device id (UDID/serial) → อ่าน `skills/sim-use/SKILL.md` ทำ preflight

## Mode: replay (default — เว้นว่าง หรือระบุ `<feature-name>/<page-name>`)

1. หา flow script ที่จะ replay:
   - เว้นว่าง: ทุกไฟล์ `tester_flow/*/*/flow.sh` ในโปรเจกต์
   - ระบุ path: เฉพาะ `tester_flow/<feature-name>/<page-name>/flow.sh` — ถ้าไม่มีไฟล์นี้ แจ้ง user ว่ายังไม่เคย record หน้านี้ แนะนำให้ใช้โหมด `record` ก่อน
2. Replay ทีละ flow ตามลำดับคำสั่งใน `flow.sh` ผ่าน sim-use (ไม่ต้อง `sim-use ui` สำรวจใหม่ — เล่นคำสั่งตามที่บันทึกไว้ตรงๆ)
3. **เกณฑ์ผ่าน/ไม่ผ่าน:** รันจบทุกคำสั่งใน flow โดยไม่ crash ถือว่า PASS — **ไม่เทียบภาพหรือ baseline อัตโนมัติ** ถ่าย `sim-use screenshot` เก็บไว้ที่ท้าย flow ให้ user ตรวจเองว่าหน้าตาถูกต้องไหม
4. เจอสัญญาณแอปเด้ง (`PROCESS DISAPPEARED` หรือ Android crash dialog) → **หยุดทันที ห้าม relaunch เอง** รายงาน banner + flow/step ที่กำลังรันตอนเด้งให้ user แล้วรอคำสั่ง (ตาม `skills/sim-use/references/crash-awareness.md`) — ข้าม flow ที่เหลือไว้ก่อน ไม่รันต่อ
5. สรุปผลเป็นตารางต่อ flow: PASS (จบไม่ crash) / CRASH (พร้อม step ที่เด้ง) พร้อม path screenshot ของทุก flow ที่รันสำเร็จ ส่งให้ user ตรวจเอง

### Template รายงาน Replay

```
📱 Regression sim-use — replay
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Device: [UDID/serial] | Platform: [iOS/Android]

| Flow | ผล | Screenshot |
|---|---|---|
| feature/page | ✅ PASS / ❌ CRASH (step N) | [path] |

→ ตรวจ screenshot แต่ละ flow เองว่าหน้าตาถูกต้องไหม (ไม่มี auto-compare)
```

## Mode: `record <feature-name>/<page-name>`

ใช้เมื่อต้อง record flow ใหม่ หรือ flow เดิมไม่ตรงกับพฤติกรรมปัจจุบันแล้ว (เช่น หลังแก้ UI/flow ของหน้านั้น)

1. ถ้ามี `tester_flow/<feature-name>/<page-name>/flow.sh` อยู่แล้ว แจ้ง user ว่าจะอัปเดตทับของเดิม (ไม่ใช่สร้างไฟล์ใหม่ซ้ำ)
2. ถาม user ว่าต้องการให้เดินผ่านหน้าจอ/action อะไรบ้าง (flow ที่ต้องการทดสอบซ้ำในอนาคต) — ห้ามเดาว่า user อยากทดสอบอะไร
3. ทำตาม flow ที่ user บอกทีละ step ผ่าน sim-use (observe→act→verify ตาม `skills/sim-use/SKILL.md`) พร้อม **บันทึกทุกคำสั่ง sim-use ที่รันจริง** (รวม `--device <UDID>` ที่ใช้) ลงไฟล์ `tester_flow/<feature-name>/<page-name>/flow.sh` ตามลำดับที่รันจริง — ปิดท้าย flow ด้วย `sim-use ui`/`sim-use screenshot` เพื่อ verify state สุดท้าย
4. เจอสัญญาณแอปเด้งระหว่าง record → หยุดทันที รายงาน user แล้วรอคำสั่ง เหมือนโหมด replay
5. Record จบแล้ว แสดง path ของ `flow.sh` ที่เขียน/อัปเดต + สรุปว่ามีกี่ step ให้ user ตรวจก่อนถาม commit
6. ไฟล์ `flow.sh` เป็น script ใช้งานจริง (ไม่ใช่ artifact ของ AI workflow อย่าง SPEC.md/tasks/) — ถาม user ว่าต้องการ commit เข้า feature branch เลยไหม ห้าม commit เองโดยไม่ถาม

## โครงสร้างไฟล์

```
tester_flow/{feature-name}/{page-name}/flow.sh
```

`{feature-name}` มาจากชื่อ feature branch ปัจจุบัน (ส่วน `{short-name}` ใน `feature/{JIRA-KEY}/{short-name}` หรือ `feature/{short-name}`) — ถ้าไม่ได้อยู่บน feature branch ให้ถาม user ว่าจะใช้ชื่อ feature อะไร
