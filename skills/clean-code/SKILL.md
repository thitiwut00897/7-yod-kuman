---
name: clean-code
description: มาตรฐานการเขียนโค้ดแบบ Clean & Modular Architecture สำหรับ React Native — file size limits, การแยก Container/hooks/Section ใช้เมื่อสร้าง/แก้ไข Container, Component, Hook หรือไฟล์ยาวเกิน 300 บรรทัด
---

# Clean Code & Modular Architecture Guide

> **วัตถุประสงค์:** มาตรฐานการเขียน code ที่ clean และ modular สำหรับโปรเจกต์ React Native ที่ใช้ Redux + react-navigation + i18n  
> **ใช้เมื่อ:** สร้าง/แก้ไข Container, Component, Hook, หรือเมื่อไฟล์เริ่มยาวเกิน 300 บรรทัด  
> **ความเรียบง่าย (บังคับทุกงาน):** `.cursor/rules/simple-code.mdc` — แยกไฟล์เพื่ออ่านง่าย ไม่ใช่เพื่อสร้าง abstraction หรือโครงสร้างที่ซับซ้อนโดยไม่จำเป็น

---

## 0. Simplicity First (ก่อนแยกไฟล์)

- งานเล็ก / ไฟล์สั้น → **อย่า** บังคับสร้าง `hooks/` + หลาย `Section/` ถ้าอ่านในไฟล์เดียวได้ชัด
- แยกเมื่อ **เกิน limit ด้านล่าง** หรือ **อ่านยากจริง** — ไม่ใช่เพราะ “pattern สวย” อย่างเดียว
- รายละเอียด KISS, ห้าม over-engineer: ดู **`.cursor/rules/simple-code.mdc`**

---

## 1. File Size Limits

| ประเภทไฟล์ | Limit | เกินแล้วทำอะไร |
|---|---|---|
| Container `index.js` | 300 บรรทัด | แยก Section + Custom Hook |
| Section Component | 200 บรรทัด | แยก sub-component |
| Card Component | 200 บรรทัด | แยก sub-component |
| Custom Hook | 150 บรรทัด | แยก hook ย่อย |
| **Hard Limit (ทุกไฟล์)** | **500 บรรทัด** | **ห้ามเกินเด็ดขาด** |

> **ทำไม 500 บรรทัด:** เกินจุดนี้แล้วไฟล์เดียวมักถือ concern มากกว่า 1 อย่าง (data + UI + business logic ปนกัน) ทำให้ diff review ยากและเพิ่มโอกาส merge conflict — เป็นสัญญาณเตือนให้แยก ไม่ใช่กฎที่ตายตัวโดยไม่มีเหตุผล

---

## 2. Container Structure — Orchestrator Pattern

Container ที่ดีคือ **Orchestrator** — รับผิดชอบแค่การ "ประสานงาน" ระหว่าง hooks และ sections

### โครงสร้างมาตรฐาน

```
FeatureContainer/
├── index.js                    ← Orchestrator เท่านั้น (< 300 บรรทัด)
├── constants.js                ← MOCK_DATA, CONFIG, TABS constants
├── hooks/
│   ├── useFeatureData.js       ← fetch + state logic หลัก
│   ├── useFeatureFilter.js     ← filter/sort/search logic
│   └── useFeaturePagination.js ← pagination logic
└── Section/
    ├── HeaderSection.js        ← Header + Tab bar
    ├── ListSection.js          ← FlatList + skeleton
    ├── FilterSection.js        ← Filter/sort bar
    ├── EmptySection.js         ← Empty state
    ├── FooterSection.js        ← Load more indicator
    └── FeatureCard.js          ← List item card
```

### index.js ที่ดี (Orchestrator)

```javascript
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ROUTE_PATH} from '../../assets';
import {Headers} from '../../components';
import i18n from '../../utils/i18n';

import useFeatureData from './hooks/useFeatureData';
import HeaderSection from './Section/HeaderSection';
import ListSection from './Section/ListSection';

const FeatureContainer = () => {
  const navigation = useNavigation();
  const {data, loading, error, fetchData, loadMore, hasMore} = useFeatureData();

  const handleItemPress = useCallback(
    item => {
      navigation.navigate(ROUTE_PATH.FEATURE.DETAIL, {id: item.id});
    },
    [navigation],
  );

  return (
    <View style={{flex: 1}}>
      <Headers title={i18n.t('feature.title')} />
      <HeaderSection />
      <ListSection
        data={data}
        loading={loading}
        error={error}
        onItemPress={handleItemPress}
        onLoadMore={loadMore}
        hasMore={hasMore}
        onRefresh={fetchData}
      />
    </View>
  );
};

export default FeatureContainer;
```

---

## 3. Custom Hook Pattern — Logic Separation

แยก logic ออกจาก Container เป็น hook เฉพาะทาง — data fetching กับ filter/search ควรอยู่คนละไฟล์เสมอ เพราะ concern ต่างกันและ re-render ด้วยเหตุผลต่างกัน

- **Data hook** (fetch, pagination, load-more): ดู template `templates/useFeatureData.js`
- **Filter/search hook** (client-side filter, search query): ดู template `templates/useFeatureFilter.js`

Copy ไฟล์ใน `templates/` ไปวางในโฟลเดอร์ feature แล้ว rename `Feature`/`feature` เป็นชื่อ feature จริง

---

## 4. Section Component Pattern

Section component (เช่น list ที่มี loading/empty/pagination state) มักซ้ำโครงเดิมทุกครั้ง — ใช้ template `templates/ListSection.js` เป็นจุดเริ่ม แล้ว rename `Feature`/`feature` เป็นชื่อจริง

---

## 5. Constants File Pattern

รวมค่าคงที่ของ feature (page size, tab/sort options, mock data ระหว่างรอ API) ไว้ไฟล์เดียว แยกจาก logic — ดู template `templates/constants.js`

---

## 6. Decomposition Decision Tree

เมื่อเจอ code ที่ยาว ให้ถามตัวเองตามลำดับนี้:

```
ไฟล์เกิน 500 บรรทัด?
  ↓ ใช่
มี styled-components จำนวนมาก?
  ↓ ใช่ → แยก Section components ออกก่อน
  ↓ ไม่ใช่
มี useEffect / useState เยอะ?
  ↓ ใช่ → แยก custom hook
  ↓ ไม่ใช่
มี render functions ยาวๆ?
  ↓ ใช่ → แยกเป็น Section component
  ↓ ไม่ใช่
มี constants / mock data เยอะ?
  ↓ ใช่ → แยกไป constants.js
```

---

## 7. Anti-Patterns ที่ต้องหลีกเลี่ยง

### ❌ God Component — ทำทุกอย่างในไฟล์เดียว

```javascript
// ❌ ผิด: index.js ยาว 1,000+ บรรทัด มีทุกอย่าง
const FeatureContainer = () => {
  // 20 useState
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  // ... อีก 17 ตัว

  // fetch logic ยาว 100 บรรทัด
  const fetchData = async () => { /* ... */ };

  // render functions ยาว
  const renderHeader = () => { /* 80 บรรทัด */ };
  const renderList = () => { /* 150 บรรทัด */ };
  const renderCard = ({item}) => { /* 100 บรรทัด */ };

  // styled-components 30 ตัว
  // ...

  return (/* ... */);
};
```

### ✅ ถูก: แยก concerns ออกจากกัน

```javascript
// ✅ ถูก: index.js เป็น Orchestrator สั้นๆ
const FeatureContainer = () => {
  const {data, loading, fetchData} = useFeatureData();
  const {filteredData, handleFilterChange} = useFeatureFilter(data);

  return (
    <Container>
      <HeaderSection onFilterChange={handleFilterChange} />
      <ListSection data={filteredData} loading={loading} onRefresh={fetchData} />
    </Container>
  );
};
```

### ❌ Prop Drilling เกิน 3 ชั้น

```javascript
// ❌ ผิด: ส่ง props ผ่านหลายชั้น
<GrandParent data={data}>
  <Parent data={data}>
    <Child data={data} />  // data ไม่ได้ใช้ใน Parent
  </Parent>
</GrandParent>
```

```javascript
// ✅ ถูก: ใช้ useSelector ใน child โดยตรง หรือ Context
const Child = () => {
  const data = useSelector(state => state.feature.data);
  return (/* ... */);
};
```

### ❌ Inline Logic ใน JSX

```javascript
// ❌ ผิด: logic ซับซ้อนใน JSX
return (
  <View>
    {data
      .filter(item => item.status === 'active')
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => <Card key={item.id} item={item} />)}
  </View>
);
```

```javascript
// ✅ ถูก: คำนวณก่อนใน useMemo
const displayData = useMemo(
  () =>
    data
      .filter(item => item.status === 'active')
      .sort((a, b) => b.score - a.score)
      .slice(0, 10),
  [data],
);

return (
  <View>
    {displayData.map(item => <Card key={item.id} item={item} />)}
  </View>
);
```

---

## 8. Refactoring Checklist (เมื่อต้องแยกไฟล์)

เมื่อได้รับงาน refactor ไฟล์ที่ยาวเกิน 500 บรรทัด:

```
Step 1: วิเคราะห์ไฟล์
□ นับจำนวน useState → ถ้า > 6 ตัว → แยก custom hook
□ นับจำนวน useEffect → ถ้า > 3 ตัว → แยก custom hook
□ ดู render functions → แต่ละอันยาวเกิน 30 บรรทัดไหม? → แยก Section
□ ดู styled-components → มีเกิน 5 ตัวไหม? → แยก Section
□ ดู constants/mock data → มีเยอะไหม? → แยก constants.js

Step 2: สร้างโครงสร้างโฟลเดอร์
□ สร้าง hooks/ folder
□ สร้าง Section/ folder (ถ้ายังไม่มี)
□ สร้าง constants.js (ถ้ามี constants เยอะ)

Step 3: แยก Custom Hooks ก่อน
□ แยก data fetching → useFeatureData.js
□ แยก filter/sort logic → useFeatureFilter.js (ถ้ามี)
□ แยก pagination → useFeaturePagination.js (ถ้าซับซ้อน)

Step 4: แยก Section Components
□ แยก Header UI → HeaderSection.js
□ แยก List/FlatList → ListSection.js
□ แยก Card item → FeatureCard.js
□ แยก Empty state → EmptySection.js

Step 5: ทำความสะอาด index.js
□ ลบ styled-components ที่ย้ายออกไปแล้ว
□ ลบ logic ที่ย้ายไป hook แล้ว
□ ตรวจสอบว่า index.js < 300 บรรทัด

Step 6: ตรวจสอบ
□ ทุกไฟล์ < 500 บรรทัด
□ ไม่มี prop drilling เกิน 3 ชั้น
□ ไม่มี logic ซับซ้อนใน JSX
□ Custom hooks ไม่มี JSX
□ Section components ไม่มี API calls
```

---

## 9. Lessons Learned

> ส่วนนี้จะถูกอัพเดทโดย @po-agent เมื่อมีบทเรียนใหม่

### CompanyMission Refactor (เมษายน 2026)
- `MainContainer/index.js` เคยยาว 1,346 บรรทัด → ต้องแยก hooks + sections
- ปัญหาหลัก: fetch logic, pagination, styled-components อยู่รวมกันหมด
- แนวทางแก้: แยก `useCompanyMissionData`, `useLeaderboard`, `useMemberList` ออกมา
