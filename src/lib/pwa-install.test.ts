/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  isChromiumAndroid,
  isIosDevice,
  isSafariBrowser,
  isStandaloneDisplay,
} from "@/lib/pwa-install";

describe("pwa-install helpers", () => {
  it("detects iPhone and iPad (including iPadOS desktop UA)", () => {
    expect(isIosDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "iPhone", 5)).toBe(
      true,
    );
    expect(isIosDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)", "iPad", 5)).toBe(true);
    expect(isIosDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", 5)).toBe(true);
    expect(isIosDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Win32", 0)).toBe(false);
  });

  it("requires real Safari for iOS A2HS (not Chrome/Firefox/Edge)", () => {
    expect(
      isSafariBrowser(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(true);
    expect(
      isSafariBrowser(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(false);
    expect(
      isSafariBrowser(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15",
      ),
    ).toBe(false);
  });

  it("detects standalone / already-installed display modes", () => {
    expect(isStandaloneDisplay(true, false)).toBe(true);
    expect(isStandaloneDisplay(false, true)).toBe(true);
    expect(isStandaloneDisplay(false, false)).toBe(false);
  });

  it("detects Chromium on Android for native install prompt path", () => {
    expect(
      isChromiumAndroid(
        "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      ),
    ).toBe(true);
    expect(
      isChromiumAndroid(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(false);
  });
});
