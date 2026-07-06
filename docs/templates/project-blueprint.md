# Project Architecture Blueprint

> **วัตถุประสงค์:** ไฟล์นี้สร้างขึ้นเพื่อให้ AI Agent เข้าใจโครงสร้างโปรเจคอย่างรวดเร็ว
> **สร้างโดย:** `/init-project-docs` (plugin `7-yod-kuman`) — กรุณาอัปเดตเนื้อหาด้านล่างให้ตรงกับโปรเจคจริงของคุณ

---

## 1. ข้อมูลทั่วไปของโปรเจค

| รายการ | ค่า |
|---|---|
| ชื่อโปรเจค | `[project-name]` |
| ประเภท | `[e.g. React Native / Next.js / NestJS]` |
| Stack หลัก | `[e.g. React / TypeScript / Redux / Tailwind]` |
| Entry Point | `[e.g. src/App.js]` |
| Timezone | `[e.g. Asia/Bangkok]` |
| i18n | `[e.g. th, en]` |

---

## 2. Tech Stack ทั้งหมด

### Core
- **Framework:** `[Name & Version]`
- **Language:** `[Name & Version]`

### Navigation / Routing
- `[Library Name]`

### State Management
- `[Library Name]`

### UI / Styling
- `[Library Name]`

### HTTP Client
- `[Library Name]`

---

## 3. โครงสร้างโฟลเดอร์หลัก

| Path | หน้าที่ |
|---|---|
| _(เติมจากโครงสร้างจริง)_ | |

---

## 4. มาตรฐานการเขียนโค้ด (Coding Standards)

- **Simplicity:** เน้นความเรียบง่าย — inject อัตโนมัติทุก session ผ่าน plugin hook (ดู `simple-code` ใน always-on rules)
- **Clean Code:** ปฏิบัติตามหลักการใน skill `clean-code`
- **UI Guide:** อ้างอิงมาตรฐานการสร้าง UI จาก skill `ui-guide-template`

---

## 5. การอัปเดตเอกสารนี้

เมื่อมีการเปลี่ยนโครงสร้างหลักหรือเพิ่ม Tech Stack ใหม่ ควรมาอัปเดตไฟล์นี้เพื่อให้ AI Agent มีข้อมูลที่ถูกต้องที่สุดเสมอ

---

## 6. Commands

> Agent ทุกตัว (tester-agent, refactor-agent, senior-full-stack-agent ฯลฯ) อ่านคำสั่งจากตารางนี้เสมอ — ห้ามสมมติว่าเป็น `npx eslint`/`npx jest` หรือเครื่องมือใดโดยไม่เช็คที่นี่ก่อน

| ประเภท | คำสั่ง |
|---|---|
| Lint (frontend) | `[e.g. npx eslint .]` |
| Lint (backend) | `[e.g. golangci-lint run]` |
| Test (frontend) | `[e.g. npx jest --coverage]` |
| Test (backend) | `[e.g. go test ./...]` |
| Build (frontend) | `[e.g. npx expo export]` |
| Build (backend) | `[e.g. go build ./...]` |

---

## 7. Git Workflow

| รายการ | ค่า |
|---|---|
| Base branch | `[e.g. develop]` |
| Branch naming | `[e.g. feature/{JIRA-KEY}/{short-name} — default ถ้าไม่ระบุ]` |
