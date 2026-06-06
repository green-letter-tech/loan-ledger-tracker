const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Required for expo-sqlite on web (WASM).
config.resolver.assetExts.push('wasm');

// SharedArrayBuffer needs cross-origin isolation on the dev server.
const priorEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware) => {
  const chain = priorEnhanceMiddleware ? priorEnhanceMiddleware(middleware) : middleware;
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return chain(req, res, next);
  };
};

module.exports = config;
