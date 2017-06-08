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

  /**
    * Stopwords list taken from http://www.ranks.nl/stopwords, h/t https://www.burakkanber.com/blog/machine-learning-full-text-search-in-javascript-relevance-scoring/
    */
  function wceu_datavis_remove_stop_words( $arr ) {
    $stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"];
    return array_filter( $arr, function( $word ) use ( $stopwords ) {
      return ! in_array( $word, $stopwords );
    } );
  }

  register_rest_route( 'wceu/2017', '/posts/tf-idf', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => function() {

      $term_tfidf_by_post = get_transient( 'wceu_datavis_term_tfidf_by_post' );

      if ( $term_tfidf_by_post ) {
        return rest_ensure_response( $term_tfidf_by_post );
      }

      // If we made it this far, the tf-idf list is not in the cache! Compute afresh.

      $posts = new WP_Query( array(
        // Super expensive API endpoint, this is
        'posts_per_page' => 200,
        'post_status' => 'publish',
        'fields' => 'ids',
      ) );

      $terms_by_post = array_map( function( $post_id ) {
        $content = apply_filters( 'the_content', get_post_field( 'post_content', $post_id ) );
        $content = strtolower( strip_tags( $content ) );

        // De-fancify the fancy apostrophes
        $content = preg_replace( '/’/', "'", html_entity_decode( $content ) );

        // Remove special characters and normalize whitespace
        $content = preg_replace( '/\s+/', ' ', preg_replace( "/[^A-Za-z0-9_']/", ' ', $content ) );
        $terms = wceu_datavis_remove_stop_words( explode( ' ', trim( $content ) ) );

        // TODO: use the Porter Stemmer algorithm to simplify words to their stems
        // (see https://tartarus.org/martin/PorterStemmer/php.txt)

        // Build an associative array of word counts
        $word_frequencies = array_reduce( $terms, function( $carry, $word ) {
          $carry[ $word ] = isset( $carry[ $word ] ) ? $carry[ $word ] + 1 : 1;
          return $carry;
        }, array() );
        return array(
          'id' => $post_id,
          'title' => get_post_field( 'post_title', $post_id ),
          'termcount' => count( $terms ),
          'terms' => $word_frequencies,
        );
      }, $posts->posts );

      // We now have an array of all posts, and the frequency of terms within those posts.
      // Next, we very-inefficiently combine all those arrays.

      // TF(t) = (Number of times term t appears in a document) / (Total number of terms in the document)
      // IDF(t) = log_e(Total number of documents / Number of documents with term t in it).
      // Value = TF * IDF
      $document_count_for_term = function( $term ) use ( $terms_by_post ) {
        return count( array_filter( $terms_by_post, function( $post ) use ( $term ) {
          return isset( $post['terms'][ $term ] );
        } ) );
      };
      $all_terms_document_count = array();

      $get_term_document_count = function( $term ) use ( $document_count_for_term, $all_terms_document_count ) {
        if ( ! isset( $all_terms_document_count[ $term ] ) ) {
          $all_terms_document_count[ $term ] = $document_count_for_term( $term );
        }
        return $all_terms_document_count[ $term ];
      };

      $document_count = $posts->post_count;
      $idf = function( $term ) use ( $get_term_document_count, $document_count ) {
        return log( $document_count / $get_term_document_count( $term ) );
      };

      foreach ( $terms_by_post as $post ) {
        $post['tfidf'] = array();
        foreach ( $post['terms'] as $term => $count ) {
          if ( $count > 2 ) {
            $tf = $count / $post['termcount'];
            $post['tfidf']['term'] = $tf * $idf( $term );
          }
        }
      }

      $term_tfidf_by_post = array_map( function( $post ) use ( $idf ) {
        $term_tfidf = array();

        foreach ( $post['terms'] as $term => $count ) {
          $tf = $count / $post['termcount'];
          $term_tfidf[] = array( 'term' => $term, 'tf-idf' => $tf * $idf( $term ) );
        }

        // Sort term tf-idf list in descending order
        usort( $term_tfidf, function( $a, $b ) {
          if ( $a['tf-idf'] == $b['tf-idf'] ) {
            return 0;
          }
          return ($a['tf-idf'] < $b['tf-idf']) ? 1 : -1;
        });

        // Return the first 20 most-relevant terms for this document
        return array(
          'id' => $post['id'],
          'title' => $post['title'],
          'terms' => array_slice( $term_tfidf, 0, 20)
        );
      }, $terms_by_post );

      set_transient( 'wceu_datavis_term_tfidf_by_post', $term_tfidf_by_post, 12 * HOUR_IN_SECONDS );

      return rest_ensure_response( $term_tfidf_by_post );
    }
  ));
}

add_action( 'rest_api_init', 'wceu_datavis_register_routes' );
