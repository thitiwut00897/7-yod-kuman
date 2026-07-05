---
name: ui-guide-template
description: เทคนิค Layout, Flexbox, และจุดที่ AI มักพลาดเมื่อเขียน UI ด้วย React Native ใช้เมื่อสร้างหรือแก้ไขหน้าจอ/component ที่มี layout ซับซ้อน
---

# UI Guide — เทคนิค Layout และจุดที่ AI มักพลาดใน React Native

> **วัตถุประสงค์:** Knowledge base สำหรับ @senior-full-stack-agent และ @po-agent  
> **อัพเดทล่าสุด:** เมษายน 2026

---

## 1. React Native Layout Fundamentals

### Flexbox ใน RN ≠ Flexbox ใน Web

```
ความแตกต่างสำคัญ:
┌─────────────────────────────────────────────────────┐
│ Property          │ Web Default   │ RN Default       │
│───────────────────│───────────────│──────────────────│
│ flexDirection     │ row           │ column ← ระวัง!  │
│ alignContent      │ stretch       │ flex-start       │
│ flexShrink        │ 1             │ 0                │
└─────────────────────────────────────────────────────┘
```

### กฎ Flex ที่ต้องรู้

```javascript
// ✅ Root Screen ต้องมี flex: 1 เสมอ
const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: ${theme.COLORS.WHITE};
`;

// ✅ ใช้ flex: 1 แทน height: '100%'
// height: '100%' ใน nested View อาจไม่ทำงาน
const Content = styled.View`
  flex: 1;  /* ✅ */
  /* height: '100%'; ❌ */
`;

// ✅ Row layout ต้องระบุ flexDirection: row ชัดเจน
const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;
```

---

## 2. Common Mistakes & Solutions

### Mistake #1: หน้าจอว่าง / Component ไม่แสดง

```javascript
// ❌ ปัญหา: ลืม flex: 1 ใน root
const Screen = styled.View`
  background-color: white;  /* ไม่มี flex: 1 → ไม่มีความสูง */
`;

// ✅ แก้ไข
const Screen = styled.View`
  flex: 1;
  background-color: ${theme.COLORS.WHITE};
`;
```

### Mistake #2: Content ซ่อนใต้ Status Bar / Notch

```javascript
// ❌ ปัญหา: ไม่ใช้ SafeArea
const Screen = styled.View`
  flex: 1;
`;

// ✅ แก้ไข — วิธีที่ 1: SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';
const Screen = styled(SafeAreaView)`
  flex: 1;
`;

// ✅ แก้ไข — วิธีที่ 2: useSafeAreaInsets (ควบคุมได้มากกว่า)
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const MyScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <Container style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      ...
    </Container>
  );
};
```

### Mistake #2b: Content ด้านล่างถูก Android nav bar โปร่งแสงบัง

```javascript
// ❌ ปัญหา: spacer ด้านล่าง hardcode 30px
<View style={{ height: 30 }} />

// ✅ แก้ไข — ใช้ ScrollBottomSpacer (ดู template ครบใน scroll-bottom-safe-area-guide.md)
import { ScrollBottomSpacer } from '../../components';

<ScrollView>
  {/* ... */}
  <ScrollBottomSpacer />
</ScrollView>
```

> **Agent:** อ่าน `.cursor/skills/scroll-bottom-safe-area-guide.md` ก่อนสร้าง Section/หน้า scroll ใหม่

### Mistake #3: Text ล้นออกนอก Container

```javascript
// ❌ ปัญหา: Text ไม่ wrap
const Title = styled.Text`
  font-size: ${theme.FONT_SIZE.LG}px;
`;

// ✅ แก้ไข
const Title = styled.Text`
  font-size: ${theme.FONT_SIZE.LG}px;
  flex-shrink: 1;     /* ให้ Text หดตัวได้ */
  flex-wrap: wrap;    /* ให้ Text ขึ้นบรรทัดใหม่ */
`;
```

### Mistake #4: Image ไม่แสดง

```javascript
// ❌ ปัญหา: Image ไม่มีขนาด
<Image source={{ uri: url }} />

// ✅ แก้ไข — ต้องระบุขนาดเสมอ
const StyledImage = styled(FastImage)`
  width: 100px;
  height: 100px;
`;

// ✅ หรือใช้ aspectRatio
const StyledImage = styled(FastImage)`
  width: 100%;
  aspect-ratio: 1;
`;
```

### Mistake #5: ScrollView ไม่ scroll

```javascript
// ❌ ปัญหา: ScrollView ใน flex: 1 container ไม่ scroll
<View style={{ flex: 1 }}>
  <ScrollView>
    {/* content */}
  </ScrollView>
</View>

// ✅ แก้ไข — ต้องมี flex: 1 ใน ScrollView ด้วย
<View style={{ flex: 1 }}>
  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    {/* content */}
  </ScrollView>
</View>
```

### Mistake #6: Absolute Position ไม่ทำงาน

```javascript
// ❌ ปัญหา: Parent ไม่มี position: relative
const Overlay = styled.View`
  position: absolute;
  top: 0;
  /* ไม่ทำงานถ้า parent ไม่มี position: relative */
`;

// ✅ แก้ไข
const Wrapper = styled.View`
  position: relative;  /* ต้องมี */
`;
const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;
```

---

## 3. Styled-Components Patterns

### Theme Integration

```javascript
import styled from 'styled-components/native';
import { theme } from '../../assets/theme';

// ✅ ใช้ theme tokens ทั้งหมด
const Card = styled.View`
  background-color: ${theme.COLORS.WHITE};
  border-radius: ${theme.BORDER_RADIUS.MD}px;
  padding: ${theme.SPACING.MD}px;
  shadow-color: ${theme.COLORS.SHADOW};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;
```

### Dynamic Styles

```javascript
// ✅ รับ props เพื่อ dynamic styling
const Button = styled.TouchableOpacity`
  background-color: ${({ isActive }) =>
    isActive ? theme.COLORS.PRIMARY : theme.COLORS.GRAY_200};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;
```

### Platform-specific

```javascript
import { Platform } from 'react-native';

const Shadow = styled.View`
  ${Platform.OS === 'ios' ? `
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.15;
    shadow-radius: 4px;
  ` : `
    elevation: 4;
  `}
`;
```

---

## 4. FlatList Best Practices

```javascript
// ✅ Pattern มาตรฐาน
const MyList = ({ data }) => {
  const renderItem = useCallback(({ item }) => (
    <ItemCard item={item} />
  ), []);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const getItemLayout = useCallback((_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={data.length === 0 ? styles.emptyContainer : null}
      ListEmptyComponent={<EmptyState />}
      ListFooterComponent={<Footer />}
    />
  );
};
```

---

## 5. Loading & Skeleton UX

```javascript
// ✅ Skeleton Loading Pattern
const SkeletonCard = () => (
  <SkeletonContainer>
    <SkeletonLine width="60%" height={16} />
    <SkeletonLine width="100%" height={12} />
    <SkeletonLine width="80%" height={12} />
  </SkeletonContainer>
);

// ✅ ใช้ conditional rendering
const MyScreen = () => {
  const { data, loading, error } = useSelector(state => state.feature);

  if (loading) return <SkeletonCard />;
  if (error) return <ErrorState message={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  return <DataList data={data} />;
};
```

---

## 6. Animation Patterns

```javascript
// ✅ Fade In Animation
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const FadeInView = ({ children }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,  // ✅ ต้องมีเสมอ
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity }}>
      {children}
    </Animated.View>
  );
};
```

---

## 7. Responsive Design

```javascript
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ✅ Responsive sizing
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.15;

// ✅ ใช้ useWindowDimensions สำหรับ dynamic (รองรับ rotation)
import { useWindowDimensions } from 'react-native';
const { width, height } = useWindowDimensions();
```

---

## 8. Reuse First — Component/Structure ที่ใช้บ่อย (ก่อนสร้างหน้าใหม่)

> เป้าหมาย: เวลาสร้างหน้าใหม่ให้ “หยิบของเดิมมาใช้” ก่อนเสมอ เพื่อให้ UI/โครงสร้างเหมือนกันทั้งแอป และลดการสร้าง component ซ้ำ

### Quick Checklist (ทำตามลำดับนี้)

- **1) ถ้ามี title header → ใช้ `<Headers>`**
  - component: `src/components/Headers/index.js`
  - แนะนำ import ผ่านจุดรวม: `src/components/index.js`
- **2) ถ้ามีปุ่มหลัก (CTA) → ใช้ `<ButtonApp>`**
  - component: `src/components/ButtonApp/index.js`
  - แนะนำ import ผ่านจุดรวม: `src/components/index.js`
- **3) หา component ที่มีอยู่แล้วก่อนสร้างใหม่**
  - เริ่มจาก `src/components/**`
  - ถ้าเป็น Card ให้เริ่มที่ `src/components/Cards/` และ `src/components/Cards/index.js`
- **4) ยึดโครงสร้าง container ของโปรเจค**
  - หน้า/จอส่วนใหญ่อยู่ที่ `src/containers/<Feature>/<Something>Container/index.js`
  - route ไปหน้ามักอยู่ใน `src/routes/pageRoutes.js`

### New Page Template (Header + Button มาตรฐาน)

```javascript
import React, {useCallback} from 'react';
import styled from 'styled-components/native';
import {SafeAreaView} from 'react-native-safe-area-context';

// ✅ ใช้ import จากจุดรวมเพื่อให้ pattern เหมือนกันทั้งโปรเจค
import {Headers, ButtonApp, Skeleton, ListEmpty} from '../../components';

const Screen = styled(SafeAreaView)`
  flex: 1;
`;

const Content = styled.View`
  flex: 1;
`;

export const NewPageContainer = () => {
  // const {data, loading, error} = useNewPageData(); // prefer hook

  const onPressPrimary = useCallback(() => {
    // TODO: handle primary action
  }, []);

  return (
    <Screen>
      <Headers title="ชื่อหน้า" />

      <Content>
        {/* loading/error/empty/content: ให้ยึด pattern เดียวกันทุกหน้า */}
        {/* {loading ? <Skeleton /> : null} */}
        {/* {error ? <ErrorState /> : null} */}
        {/* {!loading && !error && !data?.length ? <ListEmpty /> : null} */}
        {/* ...content... */}
      </Content>

      <ButtonApp title="ปุ่มหลัก" onPress={onPressPrimary} />
    </Screen>
  );
};
```

### Component ที่มักใช้คู่กับ “หน้าใหม่” (เสริม)

- **Skeleton/Loader**: ใช้ `Skeleton` หรือ `LoaderApp` จาก `src/components/index.js` สำหรับ loading state
- **Empty state**: ใช้ `ListEmpty` (มี export ใน `src/components/index.js`) สำหรับ empty list
- **Notification/Toast**: ถ้าต้องใช้แจ้งเตือน → เช็ค `src/helpers/hooks/useNotification.js` ก่อนเสมอ

---

## 9. Lessons Learned (บทเรียนจากการแก้ไขจริง)

> ส่วนนี้จะถูกอัพเดทโดย @po-agent เมื่อมีบทเรียนใหม่

```
[เพิ่มบทเรียนที่นี่เมื่อมีการ Refinement]
```
