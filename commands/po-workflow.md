---
description: เริ่มเวิร์กโฟลว์เต็ม 6 stage (Define → Plan → Build → Verify → Review → Ship) ผ่าน @po-agent สำหรับงาน/ฟีเจอร์นี้ — opt-in
argument-hint: [ลิงก์/key การ์ด Jira หรือคำอธิบายงานถ้าไม่มีการ์ด]
---

เริ่มเวิร์กโฟลว์ opt-in แบบเต็มรูปแบบสำหรับงานนี้: $ARGUMENTS

1. Invoke agent `po-agent` ให้เป็น orchestrator ของงานนี้ตั้งแต่ต้นจนจบ
2. `@po-agent` orchestrate ตามลำดับที่ระบุไว้ใน `agents/po-agent.md`: `/spec` → `/plan` → `/build` → `/verify` → `/review` → `/ship`
3. รอ user confirm/approve ตามจุดที่แต่ละ stage กำหนด — ห้ามข้ามไปเองโดยไม่ได้รับการยืนยัน

**หมายเหตุ:** คำสั่งนี้เป็นจุดเริ่มแบบ opt-in เท่านั้น — งานเล็กๆ ที่ไม่ต้องการผ่าน lifecycle เต็มรูปแบบ ไม่จำเป็นต้องใช้คำสั่งนี้ คุยงานตรงๆ หรือ mention agent ที่เกี่ยวข้อง หรือเรียก `/spec` `/plan` `/build` `/verify` `/review` `/ship` แยกทีละ stage เองได้
