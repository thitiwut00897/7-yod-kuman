// Section component template — rename `Feature` to the actual feature name.
import React, {useCallback} from 'react';
import {FlatList} from 'react-native';
import {ListEmpty, Skeleton} from '../../../components';
import i18n from '../../../utils/i18n';
import FeatureCard from './FeatureCard';
import FooterSection from './FooterSection';

const SKELETON_COUNT = 5;

const ListSection = ({
  data,
  loading,
  error,
  onItemPress,
  onLoadMore,
  hasMore,
  onRefresh,
}) => {
  const renderItem = useCallback(
    ({item}) => <FeatureCard item={item} onPress={onItemPress} />,
    [onItemPress],
  );

  const keyExtractor = useCallback(item => String(item.id), []);

  const renderFooter = useCallback(
    () => <FooterSection hasMore={hasMore} />,
    [hasMore],
  );

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return <ListEmpty message={i18n.t('feature.empty')} />;
  }, [loading]);

  if (loading && (!data || data.length === 0)) {
    return (
      <>
        {Array.from({length: SKELETON_COUNT}).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} type="line" height={80} />
        ))}
      </>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
    />
  );
};

export default ListSection;
