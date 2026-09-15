import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { nextTabBarCollapsedState } from '../utils/tabBarCollapse';

interface TabBarMotionContextValue {
  collapsed: boolean;
  expand: () => void;
  reportScroll: (offsetY: number) => void;
}

const TabBarMotionContext = createContext<TabBarMotionContextValue | null>(null);

export function TabBarMotionProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const collapsedRef = useRef(false);
  const anchorYRef = useRef(0);

  const expand = useCallback(() => {
    collapsedRef.current = false;
    anchorYRef.current = 0;
    setCollapsed(false);
  }, []);

  const reportScroll = useCallback((offsetY: number) => {
    const currentY = Math.max(0, offsetY);
    const nextCollapsed = nextTabBarCollapsedState({
      collapsed: collapsedRef.current,
      previousY: anchorYRef.current,
      currentY,
    });
    const changed = nextCollapsed !== collapsedRef.current;

    if (changed) {
      collapsedRef.current = nextCollapsed;
      setCollapsed(nextCollapsed);
    }

    if (changed || Math.abs(currentY - anchorYRef.current) > 8 || currentY === 0) {
      anchorYRef.current = currentY;
    }
  }, []);

  const value = useMemo(
    () => ({ collapsed, expand, reportScroll }),
    [collapsed, expand, reportScroll],
  );

  return <TabBarMotionContext.Provider value={value}>{children}</TabBarMotionContext.Provider>;
}

export function useTabBarMotion(): TabBarMotionContextValue {
  const context = useContext(TabBarMotionContext);
  if (!context) {
    throw new Error('useTabBarMotion must be used within TabBarMotionProvider');
  }
  return context;
}
