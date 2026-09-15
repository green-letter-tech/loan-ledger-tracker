import { describe, expect, it } from 'vitest';

import { nextTabBarCollapsedState } from '../tabBarCollapse';

describe('nextTabBarCollapsedState', () => {
  it('collapses after a meaningful downward scroll', () => {
    expect(
      nextTabBarCollapsedState({
        collapsed: false,
        previousY: 40,
        currentY: 58,
      }),
    ).toBe(true);
  });

  it('expands after a meaningful upward scroll', () => {
    expect(
      nextTabBarCollapsedState({
        collapsed: true,
        previousY: 90,
        currentY: 72,
      }),
    ).toBe(false);
  });

  it('stays expanded near the top', () => {
    expect(
      nextTabBarCollapsedState({
        collapsed: true,
        previousY: 20,
        currentY: 8,
      }),
    ).toBe(false);
  });

  it('ignores small scroll jitter', () => {
    expect(
      nextTabBarCollapsedState({
        collapsed: true,
        previousY: 60,
        currentY: 63,
      }),
    ).toBe(true);
  });
});
