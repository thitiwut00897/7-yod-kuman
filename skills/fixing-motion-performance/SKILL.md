---
name: fixing-motion-performance
description: Audit and fix React Native animation performance issues — JS-thread blocking, missing useNativeDriver, FlatList/ScrollView jank, and Reanimated worklet misuse. Use when animations stutter, list scrolling drops frames, or reviewing Animated/Reanimated code.
---

# fixing-motion-performance

Fix React Native animation and list-scroll performance issues.

## how to use

- `/fixing-motion-performance`
  Apply these constraints to any RN animation/list work in this conversation.

- `/fixing-motion-performance <file>`
  Review the file against all rules below and report:
  - violations (quote the exact line or snippet)
  - why it matters (one short sentence)
  - a concrete fix (code-level suggestion)

Do not migrate `Animated` ↔ `Reanimated` unless explicitly requested. Apply rules within the existing stack.

## when to apply

Reference these guidelines when:
- adding or changing `Animated`/`Reanimated` animations
- refactoring janky interactions, transitions, or gesture-driven motion
- implementing scroll-linked motion (parallax header, fade-on-scroll, reveal-on-scroll)
- working on `FlatList`/`ScrollView`/`SectionList` performance
- reviewing components that use `useNativeDriver`, `LayoutAnimation`, or `measure`/`onLayout`

## thread glossary

- **UI thread (native):** runs `useNativeDriver: true` animations and Reanimated worklets — unaffected by JS work, this is why it stays smooth under load
- **JS thread:** runs React re-renders, JS-driven `Animated` updates (no native driver), and event handlers — a slow render or heavy computation here drops animation frames even if the animation itself is simple
- **Shadow/layout thread (Yoga):** recomputes flexbox layout whenever a layout-affecting prop (`width`, `height`, `top`, `left`, `padding`) changes — this is why animating those props is expensive every frame

## rule categories by priority

| priority | category | impact |
|----------|----------|--------|
| 1 | never patterns | critical — these force work onto the JS/layout thread every frame, guaranteeing dropped frames under any load |
| 2 | choose the mechanism | critical — picking JS-driven `Animated` or a `View`-based gesture when native driver/Reanimated would work is the #1 cause of jank reports |
| 3 | measurement | high |
| 4 | lists (FlatList/ScrollView) | high |
| 5 | paint and layers | medium-high |
| 6 | blur and filters | medium |
| 7 | screen transitions | low |
| 8 | tool boundaries | critical |

## quick reference

### 1. never patterns (critical)

- do not run heavy synchronous computation inside a gesture/animation callback — it blocks the JS thread, so even a native-driven animation stalls waiting on state updates
- do not animate layout props (`width`, `height`, `top`, `left`) continuously — each frame re-triggers a Yoga layout pass; animate `transform`/`opacity` instead
- do not drive scroll-linked motion from a JS `onScroll` handler calling `setState` — use `Animated.event(..., { useNativeDriver: true })` instead
- no `requestAnimationFrame`/`setInterval` animation loop left running without a cleanup on unmount
- do not mix `Animated` and `Reanimated` driving the same value

### 2. choose the mechanism (critical)

- default to `Animated` with `useNativeDriver: true` for opacity/transform motion — runs on the UI thread, immune to JS thread jank
- use `Reanimated` worklets when an animation must read/react to gesture state without a JS thread round-trip (drag, swipe-to-dismiss)
- `LayoutAnimation` is fine for a one-shot layout change (item add/remove), not for continuous or interactive motion
- JS-driven `Animated` (no native driver) only when animating a prop native driver can't support (e.g. `backgroundColor`, non-transform layout)
- prefer downgrading fidelity (shorter duration, simpler easing) over shipping a JS-thread-blocking approach

### 3. measurement (high)

- do not call `measure()`/`onLayout` repeatedly during an active animation — measure once, cache it, animate via transform (FLIP-style)
- avoid `setState` calls that fire on every animation frame — each one competes with the JS thread for the same frame budget
- batch a component's layout reads before making the state update that triggers the animation

### 4. lists — FlatList/ScrollView (high)

- provide `getItemLayout` when row height is fixed — skips expensive on-the-fly measurement
- tune `removeClippedSubviews`, `windowSize`, `maxToRenderPerBatch`, `initialNumToRender` for long lists
- memoize `renderItem` and `keyExtractor` (`useCallback`) — inline functions break memoization and re-render every row on every scroll frame
- scroll-linked animation (parallax, fade header) must use `Animated.event` with `useNativeDriver: true`, never manual `setState` in `onScroll`

### 5. paint and layers (medium-high)

- avoid animating `elevation`/shadow props continuously on Android — triggers an expensive off-screen render each frame
- avoid animating `backgroundColor`/gradients every frame — these repaint, they don't just recomposite
- keep the animated `View` isolated in its own small subtree so the animation doesn't force large child trees to re-render
- `shouldRasterizeIOS`/`renderToHardwareTextureAndroid` help complex layered animations but cost memory — use surgically, verify with Flipper's UI/JS FPS monitor, not by default

### 6. blur and filters (medium)

- keep `BlurView` regions small — full-screen blur animated every frame is especially expensive on Android
- animate blur as a one-shot fade in/out, never continuously
- prefer opacity/translate transitions before reaching for blur

### 7. screen transitions (low)

- use navigation-level transition APIs (shared-element, `react-navigation` screen options) only for screen-level nav changes, not per-interaction UI motion
- avoid heavy custom screen transitions on flows where the user can rapidly back/forward-navigate mid-transition
- treat a container-size change mid-transition as potentially layout-triggering — measure before animating

### 8. tool boundaries (critical)

- do not migrate `Animated` to `Reanimated` (or the reverse) unless explicitly requested
- apply these rules within the existing animation system already used in the file
- never partially migrate APIs or mix `Animated`/`Reanimated` styles within the same component

## common fixes

```jsx
// layout thrashing: animate transform instead of width, add native driver
// before — animates `width`, no native driver: JS thread + layout pass every frame
Animated.timing(widthAnim, { toValue: 200, duration: 300 }).start()
// after — transform runs on the UI thread, untouched by JS thread load
Animated.timing(scaleAnim, { toValue: 1.5, duration: 300, useNativeDriver: true }).start()

// scroll-linked: use Animated.event with native driver, not manual setState in onScroll
// before — setState on every scroll frame forces a JS-thread re-render
<ScrollView onScroll={(e) => setOpacity(e.nativeEvent.contentOffset.y / 500)} scrollEventThrottle={16} />
// after — value updates entirely on the UI thread
const scrollY = useRef(new Animated.Value(0)).current
<Animated.ScrollView
  onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
  scrollEventThrottle={16}
/>
```

```jsx
// FlatList: memoize renderItem/keyExtractor, add getItemLayout for fixed-height rows
// before — new function identity every render breaks row memoization
<FlatList data={items} renderItem={({ item }) => <Row item={item} />} keyExtractor={(item) => item.id} />
// after
const renderItem = useCallback(({ item }) => <Row item={item} />, [])
const keyExtractor = useCallback((item) => item.id, [])
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={(data, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
/>
```

## review guidance

- enforce critical rules first (never patterns, mechanism choice, tool boundaries)
- choose the least expensive mechanism that matches the intent (native driver > Reanimated worklet > JS-driven `Animated`)
- for any non-default choice, state the constraint that justifies it (prop native driver can't animate, gesture interruption requirement, list row height variability)
- when reviewing, prefer actionable notes and concrete alternatives over theory
