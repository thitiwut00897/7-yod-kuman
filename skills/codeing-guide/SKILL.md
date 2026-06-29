# Codeing Guide — มาตรฐานการจัดการ State และการตั้งชื่อตัวแปร

> **วัตถุประสงค์:** Knowledge base สำหรับ @senior-full-stack-agent และ @po-agent  
> **อัพเดทล่าสุด:** เมษายน 2026

---

## 1. Naming Conventions

### ตัวแปรและฟังก์ชัน

```javascript
// ✅ camelCase สำหรับตัวแปรและฟังก์ชัน
const userData = {};
const isLoading = false;
const fetchUserData = async () => {};
const handleButtonPress = () => {};

// ✅ PascalCase สำหรับ Component
const UserCard = () => {};
const HomeScreen = () => {};

// ✅ UPPER_SNAKE_CASE สำหรับ Constants
const MAX_RETRY_COUNT = 3;
const API_TIMEOUT = 30000;

// ✅ Prefix ที่ใช้บ่อย
// is/has/can → boolean
const isActive = true;
const hasPermission = false;
const canEdit = true;

// handle → event handler
const handlePress = () => {};
const handleChange = (value) => {};
const handleSubmit = () => {};

// fetch/get/load → async data fetching
const fetchUserList = async () => {};
const getUserById = (id) => {};
const loadMoreData = async () => {};

// set/update/reset → state mutation
const setUserData = (data) => {};
const updateProfile = (profile) => {};
const resetForm = () => {};
```

### Redux Naming

```javascript
// ✅ Action Types: FEATURE_ACTION (UPPER_SNAKE_CASE)
SET_USER_DATA
FETCH_USER_LIST_SUCCESS
FETCH_USER_LIST_FAILURE
SET_LOADING
RESET_STATE
UPDATE_FILTER

// ✅ Action Creators: camelCase
setUserData(data)
fetchUserListSuccess(list)
setLoading(bool)
resetState()

// ✅ Selectors: select + PascalCase
const selectUserData = (state) => state.user.data;
const selectIsLoading = (state) => state.user.loading;
const selectFilteredItems = (state) => state.feature.filteredItems;
```

---

## 2. Redux State Structure

### Standard State Shape

```javascript
// ✅ มาตรฐาน initialState
const initialState = {
  // Data
  data: null,           // single item
  list: [],             // array of items
  
  // Async States
  loading: false,
  loadingMore: false,   // สำหรับ pagination
  refreshing: false,    // สำหรับ pull-to-refresh
  
  // Error
  error: null,
  
  // Pagination
  page: 1,
  totalPages: 1,
  hasMore: true,
  
  // UI State
  selectedId: null,
  filter: 'all',
  searchQuery: '',
};
```

### Reducer Pattern

```javascript
// ✅ Pattern มาตรฐาน
const featureReducer = (state = initialState, action) => {
  switch (action.type) {
    // Loading states
    case FETCH_DATA_REQUEST:
      return { ...state, loading: true, error: null };
    
    // Success
    case FETCH_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    
    // Failure
    case FETCH_DATA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    // Pagination
    case FETCH_MORE_SUCCESS:
      return {
        ...state,
        loadingMore: false,
        list: [...state.list, ...action.payload.items],
        page: action.payload.page,
        hasMore: action.payload.hasMore,
      };
    
    // Reset
    case RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
};
```

---

## 3. API Integration Patterns

### Standard API Call

```javascript
// ✅ Pattern มาตรฐาน
export const fetchFeatureData = (params) => async (dispatch) => {
  dispatch({ type: FETCH_DATA_REQUEST });
  
  try {
    const response = await apiController.getFeatureData(params);
    
    if (response?.status === 200) {
      dispatch({
        type: FETCH_DATA_SUCCESS,
        payload: response.data,
      });
    } else {
      throw new Error(response?.message ?? 'API Error');
    }
  } catch (error) {
    console.error('[FeatureName] fetchFeatureData:', error);
    dispatch({
      type: FETCH_DATA_FAILURE,
      payload: error?.message ?? 'เกิดข้อผิดพลาด',
    });
  }
};
```

### Pagination Pattern

```javascript
// ✅ Load More Pattern
export const loadMoreData = () => async (dispatch, getState) => {
  const { page, hasMore, loadingMore } = getState().feature;
  
  if (!hasMore || loadingMore) return;  // ✅ Guard clause
  
  dispatch({ type: LOAD_MORE_REQUEST });
  
  try {
    const nextPage = page + 1;
    const response = await apiController.getList({ page: nextPage });
    
    if (response?.status === 200) {
      dispatch({
        type: LOAD_MORE_SUCCESS,
        payload: {
          items: response.data?.items ?? [],
          page: nextPage,
          hasMore: nextPage < (response.data?.totalPages ?? 1),
        },
      });
    }
  } catch (error) {
    dispatch({ type: LOAD_MORE_FAILURE, payload: error?.message });
  }
};
```

---

## 4. Data Validation & Transformation

### Input Validation

```javascript
// ✅ Validate ก่อนส่ง API
const validateForm = (data) => {
  const errors = {};
  
  if (!data?.name?.trim()) {
    errors.name = t('validation.nameRequired');
  }
  
  if (!data?.email?.includes('@')) {
    errors.email = t('validation.emailInvalid');
  }
  
  if (data?.phone && !/^[0-9]{10}$/.test(data.phone)) {
    errors.phone = t('validation.phoneInvalid');
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
```

### Data Transformation

```javascript
// ✅ Transform API response → UI data
const transformUserData = (apiData) => ({
  id: apiData?.id ?? '',
  name: apiData?.fullName ?? apiData?.name ?? '',
  avatar: apiData?.profileImage ?? apiData?.avatar ?? null,
  isActive: apiData?.status === 'active',
  createdAt: apiData?.createdAt ? new Date(apiData.createdAt) : null,
});

// ✅ Transform list
const transformUserList = (apiList) =>
  Array.isArray(apiList) ? apiList.map(transformUserData) : [];
```

---

## 5. useSelector & useDispatch Patterns

```javascript
// ✅ Pattern มาตรฐาน
import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  // ✅ Destructure จาก selector
  const { data, loading, error } = useSelector((state) => state.feature);
  
  // ✅ useCallback สำหรับ dispatch functions
  const handleFetch = useCallback(() => {
    dispatch(fetchFeatureData());
  }, [dispatch]);
  
  const handleReset = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);
  
  return (/* ... */);
};
```

---

## 6. Async/Await Error Handling

### Try/Catch Template

```javascript
// ✅ Template มาตรฐาน
const asyncOperation = async () => {
  try {
    // Main logic
    const result = await someAsyncCall();
    return result;
  } catch (error) {
    // Log สำหรับ debug
    console.error('[ComponentName] asyncOperation:', error);
    
    // Handle specific errors
    if (error?.code === 'NETWORK_ERROR') {
      // handle network error
    } else if (error?.status === 401) {
      // handle unauthorized
    } else {
      // generic error
    }
    
    throw error;  // re-throw ถ้าต้องการให้ caller จัดการ
  } finally {
    // Cleanup (เช่น setLoading(false))
  }
};
```

---

## 7. Performance Patterns

### Memoization

```javascript
// ✅ useMemo — computed values ที่ cost สูง
const expensiveValue = useMemo(() => {
  return items
    .filter(item => item.isActive)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}, [items]);

// ✅ useCallback — functions ที่ส่งเป็น props
const handleItemPress = useCallback((id) => {
  navigation.navigate(ROUTE_PATH.DETAIL, { id });
}, [navigation]);

// ✅ React.memo — components ที่ re-render บ่อย
const ItemCard = React.memo(({ item, onPress }) => {
  return (/* ... */);
});
```

---

## 8. Mock Data Standards

```javascript
// ✅ Mock data structure ต้องตรงกับ API จริง
// TODO: Replace with real API — [ENDPOINT: GET /api/v1/feature/list]
const MOCK_FEATURE_LIST = {
  status: 200,
  message: 'success',
  data: {
    items: [
      {
        id: '1',
        name: 'Item Name',
        description: 'Item Description',
        imageUrl: 'https://placeholder.com/100',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        metadata: {
          category: 'type_a',
          score: 85,
        },
      },
    ],
    total: 1,
    page: 1,
    totalPages: 1,
    hasMore: false,
  },
};

// ✅ Mock function ต้องมี TODO comment ครบ
const fetchFeatureList = async (params) => {
  // TODO: Replace mock with real API call
  // Endpoint: GET /api/v1/feature/list
  // Params: { page, limit, filter }
  return Promise.resolve(MOCK_FEATURE_LIST);
};
```

---

## 9. Lessons Learned (บทเรียนจากการแก้ไขจริง)

> ส่วนนี้จะถูกอัพเดทโดย @po-agent เมื่อมีบทเรียนใหม่

```
[เพิ่มบทเรียนที่นี่เมื่อมีการ Refinement]
```
