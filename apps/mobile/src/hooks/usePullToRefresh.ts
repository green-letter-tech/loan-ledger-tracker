import { useCallback, useState } from 'react';

import { hapticSuccess } from '../utils/haptics';

/**
 * Pull-to-refresh state that reloads data without flipping the screen's
 * initial full-page loading spinner.
 */
export function usePullToRefresh(reload: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    try {
      await reload();
      await hapticSuccess();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, reload]);

  return { refreshing, onRefresh };
}
