# Design: ถอด sim-use ออกจาก /build /verify /debug — ย้ายไปเป็นคำสั่งแยก /regression-sim-use

**วันที่:** 2026-07-14
**สถานะ:** Implemented

## เป้าหมาย

ถอด `sim-use` ออกจากทุกจุดใน workflow หลัก (`/build` ขั้นที่ 6, `/verify` ข้อ 3a, `/debug` ข้อ 3) แล้วรวมความสามารถขับ simulator/emulator ไว้ในคำสั่งใหม่ `/regression-sim-use` แยกต่างหาก ที่ replay flow script จาก `tester_flow/{feature-name}/{page-name}/` — ทำให้ regression test มือถือเป็น opt-in ที่เรียกเมื่อต้องการเท่านั้น ไม่ใช่ gate บังคับที่ทำให้ `/build`/`/verify`/`/debug` ช้าลงทุกครั้งที่มี UI เปลี่ยน

## ทำไมต้องเปลี่ยน

จาก brainstorming ก่อนหน้านี้พบว่า sim-use ที่ผูกอยู่ใน `/build` (เทียบ screenshot กับรูปอ้างอิงด้วย vision) ไม่สามารถเช็ค UI ได้แม่นยำ 100% — vision-compare เป็น subjective, รูปอ้างอิงเป็น static ไม่ครอบคลุม dynamic state (empty/error/loading/long-text), ไม่เช็ค motion/accessibility/dark-mode ผลคือทุก task ที่มี UI บน mobile ต้อง build ขึ้น simulator + วนเช็ค vision สูงสุด 3 รอบ แต่ความแม่นยำที่ได้ไม่คุ้มกับ cost/เวลาที่เสียไปในทุก task

แทนที่จะพยายามเพิ่มความแม่นยำของ vision-compare (pixel-diff, edge-case checklist) ซึ่งยังแก้ปัญหาพื้นฐานไม่ได้ — ตัดสินใจแยก sim-use ออกมาเป็น regression tool ที่ dev เรียกเองเมื่อจะเช็ค flow จริงบน simulator/emulator โดยเกณฑ์ผ่าน/ไม่ผ่านเปลี่ยนจาก "vision compare ตรงกับรูปไหม" เป็น "รันจบ flow โดยไม่ crash ไหม" (แม่นยำและตรวจสอบได้จริงกว่า) แล้วให้ user ดู screenshot ตัดสินใจเรื่องหน้าตาเอง

## ขอบเขตที่แก้

| ไฟล์ | เปลี่ยนอะไร |
|---|---|
| `commands/build.md` | ลบ step "บันทึก sim-use script" ออกจากขั้นตอนหลัก, ลบแถว Mobile/sim-use ออกจากตาราง auto-check ขั้นที่ 6 (เหลือ Web ที่มี auto-check, ที่เหลือรวม Mobile ให้ user เช็คเอง), ลบ section "ขั้นที่ 7" ทั้งหมด |
| `commands/verify.md` | ลบ branch "a. Automated (sim-use)" ออก เหลือแค่ user confirm ทั้งหมด |
| `commands/debug.md` | ลบ mandatory sim-use reproduce loop ออกจากข้อ 3 fallback กลับไปใช้ `/verify` ปกติ (user reproduce เอง) |
| `agents/tester-agent.md` | เปลี่ยน scope ของ sim-use capability จากผูกกับ `/verify` (เช็ค AC ทีละข้อจาก SPEC.md) เป็นผูกกับ `/regression-sim-use` (replay `tester_flow/*/flow.sh`) |
| `agents/senior-full-stack-agent.md` | ลบแถว "Mobile + sim-use" ออกจากตาราง visual check และลบ reference ไปยัง skill `sim-use` (agent นี้ไม่ทำ auto-check บน mobile แล้ว) |
| `commands/regression-sim-use.md` | **ใหม่** — คำสั่ง standalone สำหรับ regression test มือถือด้วย sim-use |
| `README.md` | อัปเดตจำนวน command (9→10), ตาราง commands, callout เรื่อง UI reference image, คำอธิบาย skill `sim-use` |
| Artifact เว็บ overview | อัปเดตให้ตรงกับ README (stats, workflow card /build /verify, callout, commands table) |

## การออกแบบ `/regression-sim-use`

### Input

`tester_flow/{feature-name}/{page-name}/flow.sh` — ผูกกับชื่อ feature branch เดียวกับ convention เดิมของ `feature/{JIRA-KEY}/{short-name}` หรือ `feature/{short-name}`

### โหมด replay (default)

- ไม่ระบุ argument → replay ทุก flow ที่มีในโปรเจกต์
- ระบุ `<feature-name>/<page-name>` → replay เฉพาะหน้านั้น
- เกณฑ์ผ่าน/ไม่ผ่าน: **รันจบทุกคำสั่งใน flow โดยไม่ crash** ถือว่า PASS — ไม่มี automated vision/baseline compare เก็บ screenshot ท้าย flow ไว้ให้ user ตรวจหน้าตาเอง
- เจอสัญญาณแอปเด้ง → หยุดทันทีตาม `skills/sim-use/references/crash-awareness.md` เหมือน sim-use ทุกจุดในโปรเจกต์นี้

### โหมด `record <feature-name>/<page-name>`

- รองรับทั้ง dev เขียน flow script เองด้วยมือ และให้คำสั่งนี้ช่วย record ผ่านการทำตาม instruction ของ user แบบ interactive แล้วบันทึกทุกคำสั่ง sim-use ที่รันจริงลงไฟล์
- ถ้ามี flow เดิมของหน้านั้นอยู่แล้ว — อัปเดตทับ ไม่สร้างไฟล์ซ้ำ (สำคัญเมื่อ flow ของหน้าเปลี่ยนหลัง bug fix/revisit)

### Executor

`@tester-agent` (ไม่สร้าง agent ใหม่) — ปรับ scope ให้ผูกกับคำสั่งนี้แทน `/verify`

## สิ่งที่ตัดออกจาก flow เก่า

- Vision-compare screenshot กับรูปอ้างอิงบน mobile (ทั้งใน `/build` และ `/verify`) — เพราะไม่แม่นยำพอที่จะเป็น gate อัตโนมัติ
- Mandatory sim-use reproduce loop ใน `/debug` — เปลี่ยนเป็น optional ผ่าน `/regression-sim-use` แยกทีหลัง
- แนวคิด sim-use script ที่ auto-save ต่อ task ใน `/build` (design เดิมก่อนหน้านี้) — ถูกแทนที่ด้วย flow script ที่ dev เลือก record เองผ่าน `/regression-sim-use record`

## ทำไมไม่ทำ automated vision/baseline compare ใน `/regression-sim-use`

พิจารณาแล้วว่า pass/fail จาก crash-only + ให้ user ดู screenshot เอง ตรงไปตรงมาและตรวจสอบได้มากกว่า vision-compare ที่เป็น subjective (เหตุผลเดียวกับที่ตัดออกจาก `/build`/`/verify`) — ถ้าในอนาคตต้องการความแม่นยำเรื่องหน้าตาเพิ่ม ให้พิจารณาแยกเป็น design ใหม่ต่างหาก ไม่ผูกกับคำสั่งนี้
