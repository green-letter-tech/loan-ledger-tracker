interface TabBarScrollState {
  collapsed: boolean;
  previousY: number;
  currentY: number;
}

const TOP_EXPAND_Y = 12;
const DIRECTION_CHANGE_Y = 8;

export function nextTabBarCollapsedState({
  collapsed,
  previousY,
  currentY,
}: TabBarScrollState): boolean {
  if (currentY <= TOP_EXPAND_Y) {
    return false;
  }

  const delta = currentY - previousY;
  if (delta > DIRECTION_CHANGE_Y) {
    return true;
  }
  if (delta < -DIRECTION_CHANGE_Y) {
    return false;
  }

  return collapsed;
}
