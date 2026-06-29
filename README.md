# my-cursor-rules (Rules & Skills Installer)

คลังรวบรวม Cursor Rules (`.mdc`), Agents และ Skills สำหรับติดตั้งในโปรเจกต์ต่างๆ เพื่อให้ AI ทำงานได้แม่นยำและเป็นระบบมากขึ้น

---

## วิธีติดตั้ง (Installation)

รันคำสั่งนี้ใน Root ของโปรเจกต์ที่คุณต้องการติดตั้ง:

```bash
curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --project .
```

### สิ่งที่จะได้รับ:
- **Rules (`.cursor/rules/`):** กฎการเขียนโค้ดและการทำงาน (เช่น Architecture, Simple Code, Tester Agent)
- **Agents (`.cursor/agents/`):** คำแนะนำสำหรับบทบาทต่างๆ ของ AI
- **Skills (`.cursor/skills/`):** คู่มือความเชี่ยวชาญเฉพาะด้าน (เช่น Clean Code, UI Guide, API Design)

---

## วิธีอัปเดต (Update)

รันคำสั่งเดิมเพื่อรับ Rules เวอร์ชั่นล่าสุด (สคริปต์จะเขียนทับโฟลเดอร์ `.cursor` เดิม):

```bash
curl -fsSL https://raw.githubusercontent.com/thitiwut00897/my-cursor-rules/main/scripts/setup-cursor.sh | bash -s -- --project .
```

---

## รายการ Rules ที่มีจำหน่าย (Available Rules)

| ชื่อไฟล์ | คำอธิบาย |
|----------|----------|
| `architecture.mdc` | เทมเพลตโครงสร้างโปรเจค (กรุณาอัปเดตข้อมูลโปรเจคจริงในไฟล์นี้หลังติดตั้ง) |
| `simple-code.mdc` | กฎการเขียนโค้ดให้เรียบง่าย อ่านง่าย และไม่ซับซ้อน |
| `po-agent.mdc` | Workflow สำหรับ PO และการมอบหมายงาน |
| `tester-agent.mdc` | กฎการเขียน Unit Test และการทดสอบ |
| `refactor-agent.mdc` | คำแนะนำในการ Refactor โค้ด |
| `work-summary.mdc` | รูปแบบการสรุปงานรายวัน/รายฟีเจอร์ |

---

## สำหรับนักพัฒนา (For Local Development)

หากคุณต้องการแก้ไข Rules ใน Repo นี้และทดสอบในโปรเจคอื่นบนเครื่องเดียวกัน:

```bash
bash /path/to/my-cursor-rules/scripts/setup-cursor.sh --local --project .
```
