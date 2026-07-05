---
name: visual-markers
description: มาตรฐานการเพิ่ม/ลบ Visual Markers (สีขอบ debug) และวิธีอ่าน Screenshot เพื่อตรวจ Layout เทียบกับ Design ใช้เมื่อทำ Visual Audit หรือ debug ปัญหา UI/Layout ที่มองไม่เห็นจาก code อย่างเดียว
---

# Debug Flow UI — Visual Markers & Screenshot Workflow

> **วัตถุประสงค์:** มาตรฐานการใช้ Visual Markers และการอ่าน Screenshot สำหรับทุก Agent  
> **อัพเดทล่าสุด:** เมษายน 2026

---

## 1. ทำไมต้องใช้ Visual Markers?

```
ปัญหา:
  AI ไม่สามารถมองเห็นหน้าจอ Device ได้โดยตรง
  → ไม่รู้ว่า Layout ถูกต้องหรือไม่
  → อาจแก้ผิดจุด หรือแก้แล้วยังผิดอยู่

วิธีแก้ — Visual Markers:
  เพิ่ม border สีสด ลงใน Component ที่แก้ไข
  → User เห็นขอบสีบน Device
  → ส่ง Screenshot ให้ AI ตรวจสอบ
  → AI รู้ว่า Component อยู่ถูกที่หรือไม่
```

---

## 2. Color Code ของ Visual Markers

| สี | ใช้สำหรับ | Code |
|---|---|---|
| 🔴 แดง | Component หลักที่แก้ไข | `borderColor: 'red'` |
| 🔵 น้ำเงิน | Container / Wrapper หลัก | `borderColor: 'blue'` |
| 🟢 เขียว | Element ที่เพิ่มใหม่ | `borderColor: 'green'` |
| 🟠 ส้ม | Element ที่มีปัญหา / ต้องตรวจสอบ | `borderColor: 'orange'` |
| 🟣 ม่วง | Sub-component ที่ซ้อนอยู่ข้างใน | `borderColor: 'purple'` |

---

## 3. วิธีเพิ่ม Visual Markers (สำหรับ @senior-full-stack-agent)

### styled-components

```javascript
// ✅ เพิ่ม Visual Marker ใน styled-components
const MainContainer = styled.View`
  flex: 1;
  background-color: ${theme.COLORS.WHITE};
  border-width: 2px;                        /* VISUAL_MARKER — ลบออกก่อน commit */
  border-color: blue;                       /* VISUAL_MARKER — ลบออกก่อน commit */
`;

const EditedSection = styled.View`
  padding: ${theme.SPACING.MD}px;
  border-width: 2px;                        /* VISUAL_MARKER — ลบออกก่อน commit */
  border-color: red;                        /* VISUAL_MARKER — ลบออกก่อน commit */
`;

const NewElement = styled.View`
  margin-top: ${theme.SPACING.SM}px;
  border-width: 2px;                        /* VISUAL_MARKER — ลบออกก่อน commit */
  border-color: green;                      /* VISUAL_MARKER — ลบออกก่อน commit */
`;
```

### inline style (กรณีจำเป็น)

```javascript
// ✅ inline style สำหรับ Component ที่ไม่ใช่ styled
<View style={{
  flex: 1,
  borderWidth: 2,           // VISUAL_MARKER — ลบออกก่อน commit
  borderColor: 'red',       // VISUAL_MARKER — ลบออกก่อน commit
}}>
```

### Background Area Marker

```javascript
// ✅ แสดงพื้นที่ครอบคลุมของ Component
const DebugArea = styled.View`
  background-color: rgba(255, 0, 0, 0.1);  /* VISUAL_MARKER — ลบออกก่อน commit */
`;
```

---

## 4. กฎการใช้ Visual Markers

```
✅ ต้องทำ:
1. ต้องมี comment /* VISUAL_MARKER — ลบออกก่อน commit */ ทุกบรรทัด
2. ใส่เฉพาะส่วนที่แก้ไขหรือต้องการตรวจสอบ
3. ใช้ borderWidth: 2 (ไม่มากเกินไป ไม่น้อยเกินไป)
4. รอคำสั่งจาก @po-agent ก่อนลบ

❌ ห้ามทำ:
1. ลบ Visual Markers เองโดยไม่ได้รับคำสั่ง
2. ใส่ Visual Markers ทั้งไฟล์ (ใส่เฉพาะส่วนที่เกี่ยวข้อง)
3. Commit โค้ดที่มี Visual Markers อยู่
4. ลืม comment /* VISUAL_MARKER */
```

---

## 5. ขั้นตอน Visual Audit (สำหรับ @po-agent)

```
Step 1 — ประเมินว่าต้องการ Visual Audit ไหม:
  ✅ ต้องการ → งาน UI ที่ซับซ้อน, แก้ Layout, เพิ่ม Component ใหม่
  ❌ ไม่ต้องการ → แก้ text, แก้ color เล็กน้อย, แก้ logic ล้วนๆ

Step 2 — สั่ง @senior-full-stack-agent เพิ่ม Visual Markers:
  "@senior-full-stack-agent: เพิ่ม Visual Markers ตาม debug-flow.md ในส่วนที่แก้ไข
   - Container หลัก → borderColor: 'blue'
   - Section ที่แก้ไข → borderColor: 'red'
   - Element ใหม่ → borderColor: 'green'"

Step 3 — แจ้ง User:
  ┌──────────────────────────────────────────────────────────────┐
  │ ผมใส่ขอบสีไว้ในจุดที่แก้ไขแล้วครับ:                        │
  │ 🔵 ขอบน้ำเงิน = Container หลัก                             │
  │ 🔴 ขอบแดง = ส่วนที่แก้ไข                                   │
  │ 🟢 ขอบเขียว = Element ที่เพิ่มใหม่                          │
  │                                                              │
  │ รบกวนรัน App แล้วส่ง Screenshot มาให้ผมตรวจสอบครับ         │
  └──────────────────────────────────────────────────────────────┘

Step 4 — วิเคราะห์ Screenshot จาก User:
  ตรวจสอบ:
  □ เห็นขอบสีที่ถูกต้องไหม?
  □ Component อยู่ในตำแหน่งที่ถูกต้องไหม?
  □ Layout ตรงกับ Design ไหม?
  □ Spacing/Padding ถูกต้องไหม?
  □ ไม่มี Component ล้นออกนอกขอบเขตไหม?

Step 5A — ถ้าผ่าน:
  "@senior-full-stack-agent: Layout ถูกต้องแล้วครับ กรุณาลบ Visual Markers ทั้งหมดออก"
  แจ้ง User: "Layout ถูกต้องแล้วครับ กำลังลบขอบสีออก..."

Step 5B — ถ้าไม่ผ่าน:
  ระบุปัญหาที่เห็นจาก Screenshot ให้ชัดเจน:
  "@senior-full-stack-agent: จาก Screenshot พบว่า:
   1. [ปัญหาที่ 1] — [วิธีแก้]
   2. [ปัญหาที่ 2] — [วิธีแก้]
   กรุณาแก้ไขและคง Visual Markers ไว้เพื่อตรวจสอบรอบถัดไป"
```

---

## 6. วิธีอ่าน Screenshot

### สิ่งที่ต้องตรวจสอบ

```
Layout Check:
□ Component อยู่ในตำแหน่งที่ถูกต้อง (top/center/bottom)
□ ขอบสีครอบคลุมพื้นที่ที่ถูกต้อง
□ ไม่มี Component ซ้อนทับกันโดยไม่ตั้งใจ
□ ไม่มี Component ล้นออกนอกหน้าจอ

Spacing Check:
□ Padding/Margin ดูสมดุล
□ ไม่มีช่องว่างที่ผิดปกติ
□ Text ไม่ชิดขอบเกินไป

Content Check:
□ Text แสดงถูกต้อง ไม่ถูกตัด
□ Image แสดงถูกต้อง ไม่ stretch
□ Icon อยู่ถูกตำแหน่ง

Platform Check:
□ ดูถูกต้องบน iOS ไหม?
□ ดูถูกต้องบน Android ไหม? (ถ้ามี Screenshot ทั้งสอง)
```

### การอธิบายปัญหาจาก Screenshot

```
✅ อธิบายให้ชัดเจน:
"จาก Screenshot เห็นว่า:
- ขอบแดง (EditedSection) อยู่ต่ำกว่าที่ควรประมาณ 20px
- ขอบเขียว (NewElement) ล้นออกนอกขอบแดง
- ช่องว่างระหว่าง Header กับ Content มากเกินไป"

❌ อธิบายไม่ชัด:
"Layout ดูไม่ถูกต้อง"
```

---

## 7. ลบ Visual Markers (สำหรับ @senior-full-stack-agent)

เมื่อ @po-agent สั่งให้ลบ:

```javascript
// ✅ ลบทุกบรรทัดที่มี /* VISUAL_MARKER */
// ก่อน:
const Container = styled.View`
  flex: 1;
  background-color: ${theme.COLORS.WHITE};
  border-width: 2px;                        /* VISUAL_MARKER — ลบออกก่อน commit */
  border-color: red;                        /* VISUAL_MARKER — ลบออกก่อน commit */
`;

// หลัง:
const Container = styled.View`
  flex: 1;
  background-color: ${theme.COLORS.WHITE};
`;
```

### Checklist หลังลบ

```
□ ค้นหา "VISUAL_MARKER" ในไฟล์ทั้งหมดที่แก้ไข → ต้องไม่พบ
□ ค้นหา "borderColor: 'red'" → ต้องไม่พบ (ยกเว้น design จริง)
□ ค้นหา "borderColor: 'blue'" → ต้องไม่พบ
□ ค้นหา "borderColor: 'green'" → ต้องไม่พบ
□ ค้นหา "rgba(255, 0, 0" → ต้องไม่พบ
```

---

## 8. Debug Flow สำหรับ Bug ที่ไม่ใช่ Layout

### Console Logging Pattern

```javascript
// ✅ Log ที่มีประโยชน์
console.log('[FeatureName] state:', JSON.stringify(state, null, 2));
console.log('[FeatureName] API response:', response?.status, response?.data);
console.error('[FeatureName] error:', error?.message, error?.code);

// ✅ ลบออกก่อน commit (หรือเปลี่ยนเป็น comment)
// console.log('[FeatureName] debug:', value);
```

### State Debug

```javascript
// ✅ Debug Redux state
const debugState = useSelector((state) => state.feature);
console.log('[Debug] feature state:', debugState);

// ✅ ลบออกก่อน commit
```

---

## 9. Lessons Learned (บทเรียนจากการ Debug จริง)

> ส่วนนี้จะถูกอัพเดทโดย @po-agent เมื่อมีบทเรียนใหม่

```
[เพิ่มบทเรียนที่นี่เมื่อมีการ Refinement]
```
