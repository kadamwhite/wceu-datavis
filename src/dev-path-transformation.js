/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* global __webpack_public_path__:true */

// Allow WordPress to inject the full URI to the plugin path from which the
// bundled plugin files will be served: this value cannot be hard-coded in the
// JS because the plugin may be run on different sites with different directory
// structures, so we use WP's script "localization" to inject it instead
const { WCEU_DATAVIS_PLUGIN_PATH } = global;
if (WCEU_DATAVIS_PLUGIN_PATH) {
  __webpack_public_path__ = WCEU_DATAVIS_PLUGIN_PATH;
}
