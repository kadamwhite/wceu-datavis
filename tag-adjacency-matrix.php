<?php
/**
 * Plugin Name: WCEU Datavis Examples
 * Description: Sample data visualization projects built with the REST API, React & D3.js
 * Author: K Adam White
 */

/**
  * Render the scripts and styles for this plugin, reading in the list of
  * hashed asset filenames to register & enqueue from a `webpack-manifest.json`
  * file that Webpack generates on build. Each script will be registered for
  * the page for which the hook matches the bundle entry name.
  */
add_action( 'admin_init', function() {

  $plugin_dir = trailingslashit( dirname( __FILE__ ) );
  $package_json = file_get_contents( $plugin_dir . 'package.json' );
  $code_version = json_decode( $package_json )->version;

  // If the plugin code has been built for production or the dev server is
  // running, a file manifest for webpack's generated files (which have hashed
  // filenames in some cases) will be available at ./dist/webpack-manifest.json:
  // try to load & parse that file (the @ suppresses load warnings).
  $asset_manifest_file = @file_get_contents( $plugin_dir . 'dist/webpack-manifest.json' );
  $build_manifest = json_decode( $asset_manifest_file );

  if ( ! $build_manifest ) {
    // If the file is not available, display a warning
    add_action( 'admin_notices', function() {
      ?>
      <div class="notice notice-error">
        <p><?php _e( 'The WCEU Datavis plugin asset manifest is not available!', 'wceu_datavis' ); ?></p>
        <p><?php _e( 'Run the plugin build script or start the development server.', 'wceu_datavis' ); ?></p>
      </div>
      <?php
    });

    return;
  }

  // Now that we have the manifest, iterate through the different bundles.
  // Each bundle represents one "entry" in the Webpack configuration.
  $plugin_url = trailingslashit( plugin_dir_url( __FILE__ ) );
  $dist_path = $plugin_dir . 'dist/';
  // Hard-coding the dev paths
  // $build_manifest = (object)array(
  //   'tag_adjacency' => (object)array(
  //     'source' => 'tag_adjacency.js',
  //   ),
  //   'posting_frequency' => (object)array(
  //     'source' => 'posting_frequency.js',
  //   ),
  // );
  foreach ( $build_manifest as $bundle_name => $bundle_assets ) {
    // Add an action callback for each bundle
    add_action( 'admin_enqueue_scripts', function( $hook ) use (
      $bundle_name,
      $bundle_assets,
      $dist_path,
      $code_version
    ) {
      // Each bundle should only be loaded on its corresponding custom admin page
      if ( false === strpos( $hook, 'wceu_datavis_' . $bundle_name ) ) {
        return;
      }

      // If the "devserver" query parameter is present in the URL or the
      // WP_SCRIPT_DEBUG constant is true, look for the assets on the
      // webpack development server instead of the local filesystem
      $default_dev_server_url = 'http://localhost:8080/';
      if ( isset( $_GET[ 'devserver' ] ) ) {
        $dist_path = ! empty( $_GET[ 'devserver' ] ) ?
          trailingslashit( $_GET[ 'devserver' ] ) :
          $default_dev_server_url;
      } else if ( defined( 'WP_SCRIPT_DEBUG' ) && WP_SCRIPT_DEBUG ) {
        $dist_path = $default_dev_server_url;
      }

      // If the entry contains a script, register it
      if ( isset( $bundle_assets->js ) ) {
        wp_register_script(
          $bundle_name,
          $bundle_assets->js,
          array(),
          $code_version,
          true // enqueue in footer
        );

        // Manually rewrite the paths within bundle.js so that e.g. the CSS-
        // loaded images get pointed at the right URL (since relative addresses
        // will not work with JS-injected style tags)
        wp_localize_script(
          $bundle_name,
          'WCEU_DATAVIS_PLUGIN_PATH',
          $dist_path
        );

        // Localize our script to inject a NONCE that can be used to authenticate
        wp_localize_script(
          $bundle_name,
          'WPAPI_SETTINGS',
          array(
            'endpoint' => esc_url_raw( rest_url() ),
            'nonce' => wp_create_nonce( 'wp_rest' )
          )
        );

        wp_enqueue_script( $bundle_name );
      }

      // If the entry contains a stylesheet, enqueue it
      if ( isset( $bundle_assets->css ) ) {
        wp_enqueue_style(
          $bundle_name,
          $dist_path . $bundle_assets->css,
          array(),
          $code_version
        );
      }
    });
  }
});

/** Register the admin screen where we will display our application */
function wceu_datavis_register_admin_screen() {
  function wceu_datavis_render_admin_screen( $title ) {
    return function() use ( $title ) {
      echo '<div class="wrap">';
      echo   '<h1>' . $title . '</h1>';
      echo   '<div id="wceu_datavis_application_root"></div>';
      echo '</div>';
    };
  }
  function wceu_add_menu_page( $page_title, $menu_slug, $menu_icon ) {
    add_menu_page(
      $page_title,                                // Page Title
      $page_title,                                // Menu Title
      'edit_posts',                               // Require this Capability
      $menu_slug,                                 // Menu slug
      wceu_datavis_render_admin_screen( $page_title ), // The function to run to render the page
      $menu_icon,                                 // icon_url
      9                                           // admin menu position
    );
  }
  wceu_add_menu_page(
    __( 'Tag Adjacency', 'wceu_datavis' ),
    'wceu_datavis_tag_adjacency',
    'dashicons-forms'
  );
  wceu_add_menu_page(
    __( 'Posting Frequency', 'wceu_datavis' ),
    'wceu_datavis_posting_frequency',
    'dashicons-chart-area'
  );
}
add_action( 'admin_menu', 'wceu_datavis_register_admin_screen' );

/**
 * Register the routes for our graph endpoint
 */
function wceu_datavis_register_routes() {

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

  function wceu_datavis_format_post_object( $post ) {
    return array(
      'id' => $post->ID,
      'title' => $post->post_title,
      'date' => $post->post_date,
      'guid' => $post->guid,
    );
  }

  register_rest_route( 'wceu/2017', '/posts', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => function() {
      $posts = new WP_Query( array(
        'posts_per_page' => -1,
        'post_status' => 'publish',
      ) );
      return rest_ensure_response( array_map( 'wceu_datavis_format_post_object', $posts->posts ) );
    }
  ));

  register_rest_route( 'wceu/2017', '/posts/(?P<id>\d+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => function( $params ) {
      $post = get_post( $params['id'] );
      return rest_ensure_response( wceu_datavis_format_post_object( $post ) );
    },
    'args' => array(
      'id' => array(
        'validate_callback' => 'is_numeric',
      ),
    ),
  ));

  register_rest_route( 'wceu/2017', '/posts/past_year', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => function() {
      $posts = new WP_Query( array(
        'posts_per_page' => -1,
        'post_status' => 'publish',
        'date_query' => array(
          'after' => '-1 Year',
        ),
      ) );
      return rest_ensure_response( array_map( 'wceu_datavis_format_post_object', $posts->posts ) );
    }
  ));
}

add_action( 'rest_api_init', 'wceu_datavis_register_routes' );
