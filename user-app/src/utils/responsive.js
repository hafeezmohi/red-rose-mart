import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 / standard Android phone)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Width percentage — returns a value as a percentage of screen width.
 * e.g. wp(50) on a 375px-wide screen = 187.5
 */
export const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;

/**
 * Height percentage — returns a value as a percentage of screen height.
 * e.g. hp(50) on an 812px-tall screen = 406
 */
export const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

/**
 * Moderate scale — scales a fixed value relative to the base width.
 * factor controls how aggressively the value scales (0 = no scaling, 1 = linear).
 * Default factor of 0.5 provides a balanced scale.
 *
 * e.g. moderateScale(16) on a 320px phone ≈ 14.8, on a 428px phone ≈ 17.1
 */
export const moderateScale = (size, factor = 0.5) => {
  return size + (SCREEN_WIDTH / BASE_WIDTH - 1) * size * factor;
};

/**
 * Returns the status bar height for use in headers.
 */
export const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

/**
 * Bottom nav constant height (the BottomNav component uses 64 + insets)
 */
export const BOTTOM_NAV_HEIGHT = 72;

/**
 * Re-export screen dimensions for convenience.
 */
export { SCREEN_WIDTH, SCREEN_HEIGHT };
