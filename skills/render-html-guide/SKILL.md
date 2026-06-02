---
name: render-html-guide
description: >-
  Pattern สำหรับใช้ react-native-render-html (v6) กับ Kanit custom fonts
  ในโปรเจกต์นี้ ใช้เมื่อเขียนหรือแก้ไข RenderHtml component, tagsStyles,
  systemFonts หรือ HTML description rendering
---

# RenderHtml with Kanit Fonts — Pattern Guide

โปรเจกต์ใช้ `react-native-render-html` **v6.3.4** ร่วมกับ Kanit custom fonts
ข้อสำคัญ: React Native **ไม่รองรับ** `fontWeight: 'bold'` กับ custom font
→ ต้องใช้ font file ตรง เช่น `Kanit-SemiBold` แทน `Kanit-Regular` + bold

---

## 1. ลงทะเบียน systemFonts (บังคับ)

`react-native-render-html` v6 ต้องรู้จักชื่อ font ก่อนจึงจะใช้ได้:

```javascript
import RenderHtml, {defaultSystemFonts} from 'react-native-render-html';
import theme from '<path>/assets/theme';

const SYSTEM_FONTS = [
  ...defaultSystemFonts,
  theme.FONT_FAMILY.TH.REGULAR,   // Kanit-Regular
  theme.FONT_FAMILY.TH.LIGHT,     // Kanit-Light
  theme.FONT_FAMILY.TH.MEDIUM,    // Kanit-Medium
  theme.FONT_FAMILY.TH.SEMIBOLD,  // Kanit-SemiBold
  theme.FONT_FAMILY.TH.BOLD,      // Kanit-Bold
];
```

ส่งเข้า `<RenderHtml systemFonts={SYSTEM_FONTS} ... />`

---

## 2. Base Style + Tags Styles Pattern

### กำหนด shared text style ก่อน

```javascript
const TEXT_STYLE = {
  color: theme.COLORS.BLACK_9,
  fontFamily: theme.FONT_FAMILY.TH.REGULAR,
  fontSize: theme.FONT_SIZE.SIZE_14,
  lineHeight: theme.FONT_SIZE.SIZE_14 * 1.6,
};

const HTML_BASE_STYLE = {
  ...TEXT_STYLE,
  margin: 0,
  padding: 0,
};
```

ใช้ `TEXT_STYLE` เดียวกันกับ `styled.Text` (preview / collapsed mode)
เพื่อให้ font, size, color ตรงกันทั้ง preview กับ expanded HTML

### Tags Styles — Semantic Mapping

```javascript
const BOLD_STYLE = {
  ...HTML_BASE_STYLE,
  fontFamily: theme.FONT_FAMILY.TH.SEMIBOLD,
};

const TAGS_STYLES = {
  // Layout
  body: HTML_BASE_STYLE,
  div:  HTML_BASE_STYLE,
  span: HTML_BASE_STYLE,
  p:    {...HTML_BASE_STYLE, marginBottom: 4},

  // Bold — ใช้ font file ตรง ห้ามใช้ fontWeight
  strong: BOLD_STYLE,
  b:      BOLD_STYLE,

  // Italic
  em: {...HTML_BASE_STYLE, fontStyle: 'italic'},
  i:  {...HTML_BASE_STYLE, fontStyle: 'italic'},

  // Text decoration
  u:   {...HTML_BASE_STYLE, textDecorationLine: 'underline'},
  s:   {...HTML_BASE_STYLE, textDecorationLine: 'line-through'},
  del: {...HTML_BASE_STYLE, textDecorationLine: 'line-through'},

  // Headings — ใช้ SemiBold font, ไม่เพิ่ม size (ให้ uniform กับ body)
  h1: BOLD_STYLE,
  h2: BOLD_STYLE,
  h3: BOLD_STYLE,
  h4: BOLD_STYLE,
  h5: BOLD_STYLE,
  h6: BOLD_STYLE,

  // Lists — paddingLeft ของ ol/ul = ความกว้างกล่องเลข/bullet (ใช้กับ enableDynamicMarkerBoxWidth: false)
  ul: {...HTML_BASE_STYLE, paddingLeft: 24},
  ol: {...HTML_BASE_STYLE, paddingLeft: 40, listStyleType: 'decimal'},
  li: {...HTML_BASE_STYLE, marginBottom: 4, paddingLeft: 0},

  // Block elements
  blockquote: {
    ...HTML_BASE_STYLE,
    borderLeftWidth: 3,
    borderLeftColor: theme.COLORS.GREY_33,
    paddingLeft: 10,
  },
  // pre จาก CMS มักเป็น prose (ไทย) ไม่ใช่ code — ใช้ Kanit + พื้นหลังเทา
  pre: {
    ...HTML_BASE_STYLE,
    backgroundColor: theme.COLORS.GREY_23,
    padding: 10,
    marginVertical: 8,
    borderRadius: 4,
  },
  code: {
    ...HTML_BASE_STYLE,
    fontFamily: 'Courier',
    backgroundColor: theme.COLORS.GREY_23,
    paddingHorizontal: 4,
    borderRadius: 2,
  },

  // Link
  a: {...HTML_BASE_STYLE, color: theme.COLORS.BLUE_15},

  // Table
  table: {borderCollapse: 'collapse'},
  th: {...BOLD_STYLE, borderWidth: 1, borderColor: theme.COLORS.GREY_33, padding: 4},
  td: {...HTML_BASE_STYLE, borderWidth: 1, borderColor: theme.COLORS.GREY_33, padding: 4},

  // Misc
  hr:    {borderTopWidth: 1, borderTopColor: theme.COLORS.GREY_33, marginVertical: 8},
  small: {...HTML_BASE_STYLE, fontSize: theme.FONT_SIZE.SIZE_12},
};
```

### sup / sub — ต้องใช้ custom renderer

`tagsStyles` + `transform` / `textAlignVertical` **ไม่ทำงาน** กับ nested `Text` ใน RenderHtml

```javascript
import { Text } from 'react-native';
import { getNativePropsForTNode } from 'react-native-render-html';

const createScriptRenderer = isSup => props => {
  const {children} = getNativePropsForTNode(props);
  return (
    <Text
      allowFontScaling={false}
      style={{
        fontSize: theme.FONT_SIZE.SIZE_10,
        lineHeight: TEXT_STYLE.lineHeight, // ต้องเท่าบรรทัดหลัก
        fontFamily: theme.FONT_FAMILY.TH.REGULAR,
        ...(Platform.OS === 'android'
          ? {textAlignVertical: isSup ? 'top' : 'bottom'}
          : {transform: [{translateY: isSup ? -5 : 5}]}),
      }}>
      {children}
    </Text>
  );
};

const renderers = {
  sup: createScriptRenderer(true),
  sub: createScriptRenderer(false),
};

<RenderHtml renderers={renderers} ... />
```

---
```

---

## 3. Lists (`ol` / `ul`) — แปลงเป็น div markers (ไม่ใช้ native list rendering)

CMS มักส่ง HTML ที่มี list ซ้อนผิด spec → library render เลขซ้ำ (เช่น `2. 1.`)

**แนวทาง:** `prepareDescriptionHtmlForMobile` แปลง `<ol>`/`<ul>` ทั้งหมดเป็น `<div class="rt-li-row">` + marker ชัดเจน (ดัดแปลงจาก TTIB)

ไม่ต้องใช้ `renderersProps` สำหรับ ol/ul, ไม่ต้องใช้ custom `li` renderer

```javascript
const CLASSES_STYLES = {
  'rt-li-row': {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  'rt-marker': {
    width: theme.FONT_SIZE.SIZE_14 * 1.6,
    ...TEXT_STYLE,
  },
  'rt-content': {
    flex: 1,
  },
  'rt-spacer': {
    height: 4,
  },
};

<RenderHtml classesStyles={CLASSES_STYLES} ... />
```

Nested list indent มาจาก nesting ของ div อัตโนมัติ (rt-marker กว้าง = indent ต่อชั้น)

## 3b. contentWidth ต้องตรงพื้นที่จริง

```javascript
// ตัวอย่าง: WhiteCard margin 4% + Container padding 5% แต่ละข้าง
const CONTENT_WIDTH = WIDTH * (1 - 0.04 * 2 - 0.05 * 2);
```

ถ้า `contentWidth` กว้างกว่าจริง + parent มี `overflow: hidden` เนื้อหาอาจโดนตัด

---

## 4. RenderHtml Component Usage

```jsx
<RenderHtml
  source={{html: `<div>${htmlContent}</div>`}}
  contentWidth={WIDTH * 0.9}
  baseStyle={HTML_BASE_STYLE}
  tagsStyles={TAGS_STYLES}
  classesStyles={CLASSES_STYLES}
  systemFonts={SYSTEM_FONTS}
  defaultTextProps={{allowFontScaling: false}}
/>
```

**ต้องมีครบ:** `baseStyle`, `tagsStyles`, `classesStyles` (สำหรับ list markers), `systemFonts`

---

## 5. Preview (collapsed) — ใช้ RenderHtml ชุดเดียวกับ expanded

**ห้ามใช้ `stripHtml` + `Text`** — จะไม่แสดง bold, list, pre พื้นเทา ฯลฯ

จำกัดความสูง ~3 บรรทัดด้วย wrapper:

```javascript
const PREVIEW_LINE_COUNT = 3;
const PREVIEW_MAX_HEIGHT = TEXT_STYLE.lineHeight * PREVIEW_LINE_COUNT;

const DescriptionClip = styled.View`
  ${({$clip}) =>
    $clip
      ? `
    max-height: ${PREVIEW_MAX_HEIGHT}px;
    overflow: hidden;
  `
      : ''}
`;

<DescriptionClip $clip={!expanded}>
  <RenderHtml {...htmlProps} />
</DescriptionClip>
```

---

## 6. HTML sanitize (ใน HtmlContent)

`src/components/HtmlContent/index.js` — `prepareHtmlForMobile` เรียกภายใน component ก่อน `RenderHtml`:

1. ลบ `type`/`list-style` attrs จาก `<ol>` (กัน browser override)
2. ลบ `<li>` ว่าง
3. `fixInvalidNestedLists` — รวม orphan list เข้า `<li>` ก่อนหน้า
4. ลบ list ว่างที่เหลือ
5. **`transformListsToDiv`** — แปลง `<ol>`/`<ul>` ทั้งหมดเป็น `<div class="rt-li-row">` (bottom-up จากชั้นในสุด)
6. `compressAndReplaceBr` — ยุบ `<br>` ซ้ำเป็น spacer div

---

## Checklist

- [ ] import `defaultSystemFonts` จาก `react-native-render-html`
- [ ] ลงทะเบียน Kanit fonts ใน `systemFonts`
- [ ] `baseStyle` ใช้ `HTML_BASE_STYLE`
- [ ] `strong`/`b` → `fontFamily: Kanit-SemiBold` (ไม่ใช่ fontWeight)
- [ ] `em`/`i` → `fontStyle: 'italic'`
- [ ] `a` → สี link (`BLUE_15`)
- [ ] ใช้ `<HtmlContent html={...} />` (sanitize อยู่ใน component แล้ว)
- [ ] preview ใช้ `RenderHtml` เดียวกับ expanded (clip ด้วย `max-height`)
- [ ] `classesStyles` มี `rt-li-row`, `rt-marker`, `rt-content`, `rt-spacer`
- [ ] `contentWidth` คำนวณจาก margin/padding จริงของ parent
- [ ] `defaultTextProps={{allowFontScaling: false}}`

---

## ตัวอย่างอ้างอิง

| ไฟล์ | ใช้ pattern นี้ |
|---|---|
| `src/containers/BookingClass/ClassDetailContainer/Section/ClassInfo.js` | Full pattern + preview + stripHtml |
