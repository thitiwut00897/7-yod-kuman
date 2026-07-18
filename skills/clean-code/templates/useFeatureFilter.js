// Filter/search hook template — rename `Feature`/`feature` to the actual feature name.
import {useState, useCallback, useMemo} from 'react';

const FILTER_OPTIONS = ['all', 'active', 'inactive'];

const useFeatureFilter = (data = []) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    let result = data;

    if (activeFilter !== 'all') {
      result = result.filter(item => item.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [data, activeFilter, searchQuery]);

  const handleFilterChange = useCallback(filter => {
    setActiveFilter(filter);
  }, []);

  const handleSearch = useCallback(text => {
    setSearchQuery(text);
  }, []);

  return {
    filteredData,
    activeFilter,
    searchQuery,
    filterOptions: FILTER_OPTIONS,
    handleFilterChange,
    handleSearch,
  };
};

export default useFeatureFilter;
