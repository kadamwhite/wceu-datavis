/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* global __webpack_public_path__:true */

// Allow WordPress to inject the full URI to the plugin path from which the
// bundled plugin files will be served: this value cannot be hard-coded in the
// JS because the plugin may be run on different sites with different directory
// structures, so we use WP's script "localization" to inject it instead
const { WP_TAG_ADJACENCY_PLUGIN_PATH } = global;
if (WP_TAG_ADJACENCY_PLUGIN_PATH) {
  __webpack_public_path__ = WP_TAG_ADJACENCY_PLUGIN_PATH;
}
