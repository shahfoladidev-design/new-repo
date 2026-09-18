/** Shared PWA install helpers — kept free of React for unit testing. */

export function isIosDevice(userAgent: string, platform: string, maxTouchPoints: number) {
  return (
    /iphone|ipad|ipod/i.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
}

export function isSafariBrowser(userAgent: string) {
  // iOS Chrome/Firefox/Edge use CriOS/FxiOS/EdgiOS — A2HS needs real Safari
  return /safari/i.test(userAgent) && !/crios|fxios|edgios|android/i.test(userAgent);
}

export function isStandaloneDisplay(
  displayModeStandalone: boolean,
  navigatorStandalone: boolean | undefined,
) {
  return displayModeStandalone || Boolean(navigatorStandalone);
}

export function isChromiumAndroid(userAgent: string) {
  return /android/i.test(userAgent) && /chrome|crios|edg/i.test(userAgent);
}
