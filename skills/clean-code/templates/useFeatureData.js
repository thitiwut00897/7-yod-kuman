// Data hook template — rename `Feature`/`feature` to the actual feature name.
import {useState, useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchFeatureList} from '../../../store/actions/FeatureActions';

const useFeatureData = () => {
  const dispatch = useDispatch();
  const {list, loading, error} = useSelector(state => state.feature);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchData = useCallback(
    async (currentPage = 1) => {
      try {
        const result = await dispatch(fetchFeatureList({page: currentPage}));
        if (currentPage === 1) {
          setPage(1);
          setHasMore(true);
        }
        if (result?.pageInfo) {
          setHasMore((result.pageInfo.to ?? 0) < (result.pageInfo.total ?? 0));
        }
      } catch (err) {
        console.log('[useFeatureData] fetchData error:', err);
      }
    },
    [dispatch],
  );

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      await fetchData(nextPage);
      setPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, fetchData]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  return {
    data: list,
    loading,
    error,
    isLoadingMore,
    hasMore,
    fetchData,
    loadMore,
  };
};

export default useFeatureData;
