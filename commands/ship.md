---
description: Ship stage — parallel fan-out (code-reviewer + security-auditor + test-engineer) รวมผลเป็น GO/NO-GO พร้อม rollback plan บังคับ
---

เริ่ม Ship stage (ต้องผ่าน `/review` — ไม่มี Critical เหลือ — มาแล้ว):

## เช็คก่อนว่าต้อง fan-out ไหม

Skip fan-out ได้เฉพาะเมื่อ **ครบทุกข้อ**: diff แตะ ≤2 ไฟล์, dif <50 บรรทัด, ไม่แตะ auth/payment/data/config — นอกนั้น fan-out เสมอ

## Phase A — Fan-out พร้อมกัน (ถ้าไม่ skip)

เรียก subagent 3 ตัว **พร้อมกันในเทิร์นเดียว** (อย่าเรียกทีละตัว):

1. `@code-reviewer` — รีวิว 5-axis เต็มรูปแบบบน diff ของฟีเจอร์นี้ทั้งหมด (ตั้งแต่ branch แยกจาก base จนถึงปัจจุบัน)
2. `@security-auditor` — OWASP audit เต็มรูปแบบบน diff เดียวกัน
3. `@test-engineer` — วิเคราะห์ coverage gap ของฟีเจอร์นี้ทั้งหมด

## Phase B — รวมผลใน main session

รวมทั้ง 3 รายงานเป็นหมวดเดียว:

- **Code Quality** — จาก `@code-reviewer` (Critical/Important) + ผลลัพธ์ lint/test ล่าสุดจาก `/verify`
- **Security** — Critical/High จาก `@security-auditor` → กลายเป็น launch blocker ทันที
- **Performance** — จากมุม performance ของ `@code-reviewer`
- **Accessibility** — เช็คตรงนี้เองถ้าเป็นงาน UI (keyboard nav, contrast, screen reader) — ไม่มี agent เฉพาะทางสำหรับเรื่องนี้
- **Infrastructure** — env var ใหม่, migration, monitoring, feature flag ที่เกี่ยวข้อง — เช็คตรงนี้เอง
- **Documentation** — README/`SPEC.md`/changelog อัปเดตครบไหม — เช็คตรงนี้เอง

## Phase C — GO/NO-GO Decision

```markdown
## Ship Decision: GO | NO-GO

### Blockers (ต้องแก้ก่อน ship)
- [ที่มา: finding Critical + file:line]

### Recommended fixes (ควรแก้ก่อน ship)
- [ที่มา: finding Important + file:line]

### Acknowledged risks (ship ทั้งที่มีความเสี่ยง — ต้องได้รับอนุญาตจาก user ชัดเจน)
- [ความเสี่ยง + วิธีลดผลกระทบ]

### Rollback Plan (บังคับก่อน GO ทุกครั้ง)
- เงื่อนไขที่ต้อง rollback: [signal อะไรที่บอกว่าต้อง rollback]
- ขั้นตอน rollback: [ระบุขั้นตอนจริง]
- Recovery time target: [ประมาณเวลา]

### รายงานฉบับเต็ม
- [code-reviewer report]
- [security-auditor report]
- [test-engineer report]
```

## กฎ

1. Blocker (Critical) ใดๆ ที่เหลืออยู่ → ผลลัพธ์ default คือ **NO-GO** เว้นแต่ user ยอมรับความเสี่ยงอย่างชัดเจน
2. Rollback plan ต้องมีเสมอก่อนสรุป GO — ห้าม GO โดยไม่มี rollback plan
3. Personas ทั้ง 3 ไม่คุยกันเอง — main session (ตัวที่รัน `/ship`) เป็นคนรวมผลเท่านั้น
