/**
 * jsdom gaps that every real browser fills. Without these the mount tests fail
 * on the environment rather than on the app, which hides real bugs.
 */

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

// jsdom throws "Not implemented" rather than no-opping.
window.scrollTo = () => {}

// React 18 wants this flag to silence the act() environment warning.
globalThis.IS_REACT_ACT_ENVIRONMENT = true
