// Side-effect module that replaces Next's polyfill-module in the browser bundle.
// Chrome 111, Edge 111, Firefox 111, and Safari 16.4 already implement the
// features that file installs. Production Next does not call URL.canParse.
