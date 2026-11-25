// Replaces the polyfills Next bundles for old browsers (see turbopack.resolveAlias in next.config.ts).
// URL.canParse arrived in Chrome 120, Firefox 115 and Safari 17; the rest is supported everywhere Next runs.
if (typeof URL !== "undefined" && !("canParse" in URL)) {
  URL.canParse = (url, base) => {
    try {
      return Boolean(new URL(url, base));
    } catch {
      return false;
    }
  };
}
