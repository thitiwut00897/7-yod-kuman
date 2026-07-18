// Constants file template — rename `feature`/`FEATURE` to the actual feature name.

export const PER_PAGE = 10;

export const TAB_OPTIONS = [
  {key: 'all', labelKey: 'feature.tab_all'},
  {key: 'active', labelKey: 'feature.tab_active'},
  {key: 'inactive', labelKey: 'feature.tab_inactive'},
];

export const SORT_OPTIONS = [
  {key: 'newest', labelKey: 'feature.sort_newest'},
  {key: 'oldest', labelKey: 'feature.sort_oldest'},
  {key: 'name', labelKey: 'feature.sort_name'},
];

// TODO: Remove when API integrated — GET /api/v1/feature/list
export const MOCK_FEATURE_LIST = [
  {id: '1', name: 'Item 1', status: 'active', score: 100},
  {id: '2', name: 'Item 2', status: 'inactive', score: 80},
];
