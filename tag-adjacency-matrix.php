<?php
/**
 * Plugin Name: Tag Adjacency Matrix
 * Description: Visualization of co-occurring taxonomy terms
 */

/**
 * Render the scripts and styles for this plugin, optionally loading the bundle
 * from webpack-dev-server if WP_DEBUG and WP_SCRIPT_DEBUG are both true.
 *
 * If WP_DEBUG is false, webpack-manifest.json (generated on prod build) is
 * digested to get the list of hashed JS and CSS filenames to enqueue.
 */
function tag_adjacency_register_scripts($hook) {
  // Our JS is only needed on our custom admin page
  if (strpos($hook, 'tag_adjacency_admin_screen') === false) {
    return;
  }

  $plugin_dir = plugin_dir_url( __FILE__ );
  $dist_path = $plugin_dir . 'dist/';
  $package_json = file_get_contents( $plugin_dir . '/package.json' );
  $code_version = json_decode( $package_json )->version;

  // If the plugin code has been built for production, there will be a file
  // manifest for webpack's generated files (which have hashed filenames)
  // available at ./dist/webpack-manifest.json: try to load & parse that
  // file (the @ suppresses load warnings)
  $build_json = @file_get_contents( $plugin_dir . '/dist/webpack-manifest.json' );

  if ( ( ! defined( 'WP_DEBUG' ) || WP_DEBUG === false ) && $build_json !== false ) {
    // Not in debug mode, and manifest file exists: parse it and load those assets
    $build_manifest = json_decode( $build_json );
    wp_register_script(
      'tag-adjacency-matrix',
      $dist_path . $build_manifest->main->source,
      array(),
      $code_version,
      true // enqueue in footer
    );
    wp_register_style(
      'tag-adjacency-matrix',
      $dist_path . $build_manifest->main->css,
      array(),
      $code_version
    );
  } else if ( defined( 'WP_SCRIPT_DEBUG' ) && WP_SCRIPT_DEBUG ) {
    // WP_SCRIPT_DEBUG mode means "use webpack-dev-server"
    wp_register_script(
      'tag-adjacency-matrix',
      // Note: if multiple webpack dev servers are running, this port may be incorrect!
      'http://localhost:8080/bundle.js',
      array(),
      $code_version,
      true // enqueue in footer
    );
  } else {
    // In all other cases expect a built dist/bundle.js file to exist;
    // this requires `npm run build` to be executed at least once in a
    // development environment
    wp_register_script(
      'tag-adjacency-matrix',
      $dist_path . 'bundle.js',
      array(),
      $code_version,
      true // enqueue in footer
    );
    // Manually rewrite the paths within bundle.js so that e.g. the CSS-
    // loaded images get pointed at the right URL (since relative addresses
    // will not work with JS-injected style tags)
    wp_localize_script(
      'tag-adjacency-matrix',
      'WP_TAG_ADJACENCY_PLUGIN_PATH',
      $dist_path
    );
  }

  // Localize our script to inject a NONCE that can be used to auth
  wp_localize_script(
    'tag-adjacency-matrix',
    'WPAPI_SETTINGS',
    array(
      'endpoint' => esc_url_raw( rest_url() ),
      'nonce' => wp_create_nonce( 'wp_rest' )
    )
  );

  // Enqueue our script
  wp_enqueue_script( 'tag-adjacency-matrix' );
  // Enqueue our style (if present)
  wp_enqueue_style( 'tag-adjacency-matrix' );
}
add_action( 'admin_enqueue_scripts', 'tag_adjacency_register_scripts' );

/** Register the admin screen where we will display our application */
function tag_adjacency_register_admin_screen() {
  $plugin_dir = plugin_dir_url( __FILE__ );
  $package_json = file_get_contents( $plugin_dir . '/package.json' );
  $package_info = json_decode( $package_json );

  add_menu_page(
    __( 'Tag Adjacency', 'tag_adjacency' ), // Page Title
    __( 'Tag Adjacency', 'tag_adjacency' ), // Menu Title
    'edit_posts',                           // Require this Capability
    'tag_adjacency_admin_screen',           // Menu slug
    'tag_adjacency_render_admin_screen',    // The function to run
    'dashicons-forms',                      // icon_url
    9                                       // position
  );
}
add_action( 'admin_menu', 'tag_adjacency_register_admin_screen' );

/** Render the HTML container for the react application */
function tag_adjacency_render_admin_screen() {
  echo '<div id="tag_adjacency_application_root"></div>';
}

/**
 * Register the routes for our graph endpoint
 */
function tag_adjacency_register_routes() {

  // register_rest_route() handles more arguments but we are going to stick to the basics for now.
  register_rest_route( 'wceu/2017', '/posts/by_tag', array(
    // By using this constant we ensure that when the WP_REST_Server changes,
    // our readable endpoints will work as intended.
    'methods' => WP_REST_Server::READABLE,
    // Register the callback fired when WP_REST_Server matches this endpoint
    'callback' => function() {
      $tags = get_tags();
      return rest_ensure_response( array_values( array_map( function( $tag ) {
        $post_ids_for_tag = new WP_Query( array(
          'posts_per_page' => -1,
          'fields' => 'ids',
          'tag_id' => $tag->term_id,
        ) );
        return array(
          'id' => $tag->term_id,
          'name' => $tag->name,
          'count' => $tag->count,
          'taxonomy' => 'post_tag',
          'description' => $tag->description,
          'posts' => $post_ids_for_tag->posts,
        );
      }, $tags ) ) );
    },
  ) );

  register_rest_route( 'wceu/2017', '/posts/by_category', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => function() {
      $categories = get_categories();
      return rest_ensure_response( array_values( array_map( function( $cat ) {
        $post_ids_for_cat = new WP_Query( array(
          'posts_per_page' => -1,
          'fields' => 'ids',
          'cat' => $cat->term_id,
        ) );
        return array(
          'id' => $cat->term_id,
          'name' => $cat->name,
          'count' => $cat->count,
          'parent' => $cat->parent,
          'taxonomy' => 'category',
          'description' => $cat->description,
          'posts' => $post_ids_for_cat->posts,
        );
      }, $categories ) ) );
    },
  ) );
}

add_action( 'rest_api_init', 'tag_adjacency_register_routes' );
