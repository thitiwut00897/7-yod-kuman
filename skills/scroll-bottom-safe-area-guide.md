# Scroll Bottom Safe Area — Template สำหรับ Agent

> **ใช้เมื่อ:** สร้าง/แก้หน้าจอที่มี `ScrollView` หรือเนื้อหา scroll ได้ และต้องไม่ให้ content ด้านล่างถูก **Android navigation bar โปร่งแสง** หรือ **iOS home indicator** บัง  
> **อัพเดท:** มิถุนายน 2026

---

## กฎ (บังคับ)

1. **ห้าม** hardcode `paddingBottom: 30` หรือ `height: 30` เป็น spacer ด้านล่าง ScrollView อย่างเดียว
2. **ใช้** `<ScrollBottomSpacer />` เป็น spacer สุดท้ายใน `ScrollView` (หรือท้ายเนื้อหาที่ scroll ได้)
3. ถ้าหน้าไม่ scroll แต่ content ยาวถึงขอบล่าง → ใส่ `<ScrollBottomSpacer />` ท้าย layout เช่นกัน
4. ถ้าต้องคำนวณเอง (เช่น `contentContainerStyle`) → ใช้ util จาก `src/utils/safeArea.js` ห้าม copy logic ซ้ำ

---

## Component / Util ที่ใช้

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/components/ScrollBottomSpacer/index.js` | View spacer พร้อม safe area — **ใช้ตัวนี้เป็นหลัก** |
| `src/utils/safeArea.js` | `getScrollBottomSafePadding`, `getScrollBottomSpacerHeight`, constants |

---

## Template — Section ที่ scroll ได้ (แนะนำ)

```javascript
import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Skeleton, ScrollBottomSpacer} from '../../../components';
import theme from '../../../assets/theme';

const ExampleSection = () => {
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Skeleton type="line" height={44} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}>
      {/* ... เนื้อหา ... */}
      <ScrollBottomSpacer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.GREY_1,
  },
  loadingWrap: {
    padding: 16,
    gap: 12,
  },
});

export default ExampleSection;
```

---

## Template — หน้าไม่ scroll แต่ content ถึงขอบล่าง

```javascript
import {ScrollBottomSpacer} from '../../../components';

return (
  <View style={styles.container}>
    {/* ... เนื้อหา ... */}
    <ScrollBottomSpacer />
  </View>
);
```

---

## Template — คำนวณ padding เอง (กรณีพิเศษ)

```javascript
import {Platform, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getScrollBottomSafePadding, SCROLL_BOTTOM_SPACER} from '../../../utils/safeArea';

const MyScreen = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding =
    SCROLL_BOTTOM_SPACER + getScrollBottomSafePadding(insets);

  return (
    <ScrollView contentContainerStyle={{paddingBottom: bottomPadding}}>
      {/* ... */}
    </ScrollView>
  );
};
```

---

## Logic ด้านล่าง (อ้างอิง — ไม่ต้อง copy ไปไฟล์ใหม่)

```
Android:
  insets.bottom === 0 → ใช้ ANDROID_NAV_FALLBACK (24px)
  insets.bottom > 0   → ใช้ insets.bottom

iOS:
  ใช้ insets.bottom (home indicator)

ความสูง spacer สุดท้าย = SCROLL_BOTTOM_SPACER (30) + safe padding
```

---

## ตัวอย่างในโปรเจกต์

- `src/containers/MyExerciseContainer/Section/DailySection.js`
- `src/containers/MyExerciseContainer/Section/WeeklySection.js`
- `src/containers/MyExerciseContainer/Section/MonthlySection.js`

---

## Checklist ก่อนส่งงาน

- [ ] มี `<ScrollBottomSpacer />` ท้าย ScrollView (หรือท้าย content ที่ชิดขอบล่าง)
- [ ] ไม่มี `bottomSpacer: { height: 30 }` แบบ fixed ใน StyleSheet
- [ ] ทดบน Android ที่ nav bar โปร่งแสง — เนื้อหาสุดท้าย scroll ขึ้นมาเห็นครบ
