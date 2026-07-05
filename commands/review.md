---
description: Review stage — 5-axis code review + security audit บน diff ปัจจุบัน (Critical ต้องแก้ก่อนไป /ship)
---

เริ่ม Review stage (ต้องผ่าน `/verify` มาแล้ว):

1. `@code-reviewer` รีวิว diff/commit ทั้งหมดของ feature branch นี้ (เทียบกับ base branch) ครบ 5 มุมมอง — correctness, readability, architecture, security (pass แรกแบบผิวๆ), performance

2. `@security-auditor` รัน OWASP-style audit บน diff เดียวกัน (แนวลึกกว่า pass แรกของ code-reviewer)

3. รวมผลลัพธ์ทั้งสองเป็นรายงานเดียว จัด severity: Critical / Important / Suggestion พร้อม file:line

4. **Critical finding**: ส่งกลับ `@senior-full-stack-agent` หรือ `@refactor-agent` (ตามประเภทปัญหา) ให้แก้ → รัน `/review` ซ้ำจนไม่มี Critical เหลือ

5. **Important/Suggestion**: แสดงในรายงาน ไม่ block — แจ้ง user ว่ามีแต่ไม่บังคับแก้ก่อนไป `/ship`

6. เมื่อไม่มี Critical เหลือ: แจ้ง user ว่าพร้อมไป `/ship` แล้ว
