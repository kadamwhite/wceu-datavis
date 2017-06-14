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

  $dist_path = $plugin_dir . 'dist/';
  $plugin_url = trailingslashit( plugin_dir_url( __FILE__ ) );
  $dist_url = $plugin_url . 'dist/';

  function getAssetURI( $dist_url, $asset_filename ) {
    // If asset was output with a URL, e.g. `//localhost:8080/...`, use as-is
    if ( strpos( $asset_filename, '//' ) === 0 ) {
      return $asset_filename;
    }
    // In all other cases, append to the plugin dist directory URL
    return $dist_url . $asset_filename;
  }

  // Now that we have the manifest, iterate through the different bundles.
  // Each bundle represents one "entry" in the Webpack configuration.
  foreach ( $build_manifest as $bundle_name => $bundle_assets ) {
    // Add an action callback for each bundle
    add_action( 'admin_enqueue_scripts', function( $hook ) use (
      $bundle_name,
      $bundle_assets,
      $dist_path,
      $dist_url,
      $code_version
    ) {
      // Each bundle should only be loaded on its corresponding custom admin page
      if ( false === strpos( $hook, 'wceu_datavis_' . $bundle_name ) ) {
        return;
      }

      // If the entry contains a script, register it
      if ( isset( $bundle_assets->js ) ) {
        wp_register_script(
          $bundle_name,
          getAssetURI( $dist_url, $bundle_assets->js ),
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
          getAssetURI( $dist_url, $bundle_assets->css ),
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
    'dashicons-chart-bar'
  );
  wceu_add_menu_page(
    __( 'TF-IDF Analysis', 'wceu_datavis' ),
    'wceu_datavis_term_frequency',
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
    $stopwords = ["a","about","above","after","again","against","all","am","an","and","any","are","aren","as","at","be","because","been","before","being","below","between","both","but","by","can","cannot","could","couldn","did","didn","do","does","doesn","doing","don","down","during","each","few","for","from","further","had","hadn","has","hasn","have","haven","having","he","her","here","hers","herself","him","himself","his","how","i","if","in","into","is","isn","it","its","itself","let","me","more","most","mustn","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","shan","she","should","shouldn","so","some","such","than","that","the","their","theirs","them","themselves","then","there","these","they","this","those","through","to","too","under","until","up","very","was","wasn","we","were","weren","what","when","where","which","while","who","whom","why","with","won","would","wouldn","you","your","yours","yourself","yourselves","t","d","ll","m","re","s","t","ve"];
    return array_filter( $arr, function( $word ) use ( $stopwords ) {
      return ! in_array( $word, $stopwords );
    } );
  }

  function wceu_datavis_sort_descending_order( $a, $b ) {
    if ( $a['tfidf'] == $b['tfidf'] ) {
      return 0;
    }
    return ( $a['tfidf'] < $b['tfidf'] ) ? 1 : -1;
  }

  function wceu_datavis_get_term_frequencies() {
    // We maintain a transient cache of the response of this method, so check for
    // that and short-circuit if it's found
    $term_frequency = get_transient( 'wceu_datavis_term_frequency' );
    if ( $term_frequency ) {
      return $term_frequency;
    }

    // We're going to need all posts.
    $posts = new WP_Query( array(
      // Super expensive API endpoint, this is
      'posts_per_page' => -1,
      'post_status' => 'publish',
      'fields' => 'ids',
    ) );

    // Now we compute the count of words for each post. We will log the total
    // number of documents in which each word appears as we go, so we do not
    // have to iterate back through all the posts.
    $term_frequency_by_post = array();
    $document_frequency = array();

    foreach ( $posts->posts as $post_id ) {
      // Add this post to the dictionary
      $term_frequency_by_post[ $post_id ] = array(
        'id' => $post_id,
        'title' => get_post_field( 'post_title', $post_id ),
        'date' => get_post_field( 'post_date', $post_id ),
        'categories' => wp_get_post_categories( $post_id ),
        'termcount' => 0
      );

      // Get the content for this post
      $content = apply_filters( 'the_content', get_post_field( 'post_content', $post_id ) );

      // Clean up the content: lower-case, break into words, remove punctuation, etc.
      $content = strtolower( strip_tags( $content ) );
      // De-fancify the fancy apostrophes
      $content = preg_replace( '/’/', "'", html_entity_decode( $content ) );
      // Remove special characters and normalize whitespace, remove pluralization suffixes
      $content = preg_replace( "/[^A-Za-z0-9_]|\s+/", ' ', $content );
      $terms = wceu_datavis_remove_stop_words( explode( ' ', trim( $content ) ) );

      // TODO: use the Porter Stemmer algorithm to simplify words to their stems
      // (see https://tartarus.org/martin/PorterStemmer/php.txt)

      // Count the terms
      $term_counts = array();
      foreach ( $terms as $term ) {
        // Omit empty strings, numeric strings and single-letter strings
        if ( $term === "" || preg_match( '/^\d+$/', $term ) || preg_match( '/^\w$/', $term ) ) {
          continue;
        }
        $term_frequency_by_post[ $post_id ]['termcount'] = $term_frequency_by_post[ $post_id ]['termcount'] + 1;

        // Increment term's total post count the first time we encounter it in each post
        if ( ! isset( $term_counts[ $term ] ) ) {
          $document_frequency[ $term ] = isset( $document_frequency[ $term ] ) ?
            $document_frequency[ $term ] + 1 :
            1;
        }
        // Now, regardless of whether we've seen this word before in this post,
        // keep track of how many times it has shown up
        $term_counts[ $term ] = isset( $term_counts[ $term ] ) ?
          $term_counts[ $term ] + 1 :
          1;
      }
      $term_frequency_by_post[ $post_id ]['terms'] = $term_counts;
    }

    $term_frequency = array(
      'by_post' => $term_frequency_by_post,
      'document_frequency' => $document_frequency,
      'document_count' => $posts->post_count
    );

    set_transient( 'wceu_datavis_term_frequency', $term_frequency, 12 * HOUR_IN_SECONDS );

    return $term_frequency;
  }

  register_rest_route( 'wceu/2017', '/posts/term_frequencies', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => function() {
      return rest_ensure_response( wceu_datavis_get_term_frequencies() );
    }
  ) );

  register_rest_route( 'wceu/2017', '/posts/tf-idf', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => function() {

      // Check transients for an existing response: this is an expensive
      // endpoint so we avoid computing it when we don't have to
      $term_tfidf_by_post = get_transient( 'wceu_datavis_term_tfidf_by_post' );

      // If we have a cache hit, we're all set: return it directly
      if ( $term_tfidf_by_post ) {
        return rest_ensure_response( $term_tfidf_by_post );
      }

      // If we made it this far, the tf-idf list is not in the cache! Compute afresh.
      // Start by getting the term frequency data
      $term_frequency_data = wceu_datavis_get_term_frequencies();

      // now we walk through that array, and for each post we compute the TF-IDF
      // value for that term within that post within the entire corpus of post documents

      // TF(t) = (Number of times term t appears in a document) / (Total number of terms in the document)
      // IDF(t) = log_e(Total number of documents / Number of documents with term t in it).
      // TF-IDF value = TF * IDF

      $document_frequency = $term_frequency_data['document_frequency'];
      $document_count = $term_frequency_data['document_count'];

      $idf = function( $term ) use ( $document_frequency, $document_count ) {
        return log( $document_count / $document_frequency[ $term ] );
      };

      $term_tfidf_by_post = array_map( function( $post ) use ( $idf ) {
        $term_tfidf = array();

        foreach ( $post['terms'] as $term => $count ) {
          if ( $count < 2 ) {
            // do not compute TF-IDF for terms w/ only one occurrence, to save time
            continue;
          }

          $tf = $count / $post['termcount'];
          $tfidf = $tf * $idf( $term );
          $term_tfidf[] = array(
            'term' => $term,
            'count' => $count,
            'tfidf' => $tfidf
          );
        }

        usort( $term_tfidf, 'wceu_datavis_sort_descending_order' );

        // Return the first 20 most-relevant terms for this document
        return array(
          'id' => $post['id'],
          'title' => $post['title'],
          'date' => $post['date'],
          'categories' => $post['categories'],
          'termcount' => $post['termcount'],
          'terms' => $term_tfidf // array_slice( $term_tfidf, 0, 20)
        );
      }, $term_frequency_data['by_post'] );

      set_transient( 'wceu_datavis_term_tfidf_by_post', $term_tfidf_by_post, 12 * HOUR_IN_SECONDS );

      return rest_ensure_response( $term_tfidf_by_post );
    }
  ));

  // Choose your route names more carefully & consistently than I do!
  register_rest_route( 'wceu/2017', '/categories/tf-idf', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => function() {

      // Check transients for an existing response: this is an expensive
      // endpoint so we avoid computing it when we don't have to
      $term_tfidf_by_category = get_transient( 'wceu_datavis_term_tfidf_by_category' );

      // If we have a cache hit, we're all set: return it directly
      if ( $term_tfidf_by_category ) {
        return rest_ensure_response( $term_tfidf_by_category );
      }

      // If we made it this far, the tf-idf list is not in the cache! Compute afresh.
      // Start by getting the term frequency data
      $term_frequency_data = wceu_datavis_get_term_frequencies();

      // Get our list of categories (and map them into simpler objects)
      $categories = array_map( function( $category ) {
        return array(
          'id' => $category->term_id,
          'name' => $category->name,
          'parent' => $category->parent
        );
      }, get_terms( 'category' ) );

      // now we walk through that array, and sum the word frequencies for each category
      // to calculate TF-IDF scores on the category level
      // There is almost certainly a cleaner way to compute this but WCEU is in two days
      $cats_by_term = array();
      $frequency_by_category = array_reduce( $term_frequency_data['by_post'],
        function( $carry, $post ) use ( $cats_by_term ) {
          foreach ( $post['terms'] as $term => $count ) {
            foreach ( $post['categories'] as $cat_id ) {
              // First time seeing this category?
              if ( ! isset( $carry[ $cat_id ] ) ) {
                // Initialize the category record
                $carry[ $cat_id ] = array( 'terms' => array(), 'termcount' => 0 );
                // Increment the document count
                $carry['document_count'] = $carry['document_count'] + 1;
              }
              // First time seeing this term in this category?
              if ( ! isset( $carry[ $cat_id ]['terms'][ $term ] ) ) {
                // initialize the per-category count for this term
                $carry[ $cat_id ]['terms'][ $term ] = 0;
                // Increment the document count for this term
                $carry['document_freq'][ $term ] = isset( $carry['document_freq'][ $term ] ) ?
                  $carry['document_freq'][ $term ] + 1 :
                  1;
              }
              // Increment the per-category count for this term
              $carry[ $cat_id ]['terms'][ $term ] = $carry[ $cat_id ]['terms'][ $term ] + $count;
              // Increment the termcount for this category
              $carry[ $cat_id ]['termcount'] = $carry[ $cat_id ]['termcount'] + $count;
            }
          }
          return $carry;
        },
        array( 'document_freq' => array(), 'document_count' => 0 )
      );

      $document_frequency = $frequency_by_category['document_freq'];
      $document_count = $frequency_by_category['document_count'];

      $idf = function( $term ) use ( $document_frequency, $document_count ) {
        return log( $document_count / $document_frequency[ $term ] );
      };

      $term_tfidf_by_category = array_values( array_map( function( $category ) use ( $idf, $frequency_by_category ) {
        $term_tfidf = array();

        $cat_frequencies = isset( $frequency_by_category[ $category['id'] ] ) ?
          $frequency_by_category[ $category['id'] ] :
          null;

        if ( $cat_frequencies && count( $cat_frequencies['terms'] ) ) {
          $terms = $frequency_by_category[ $category['id'] ]['terms'];
          $termcount = $frequency_by_category[ $category['id'] ]['termcount'];
          foreach ( $terms as $term => $count ) {
            if ( $count < 2 || ($term !== 'js' && strlen( $term ) < 3) ) {
              // do not compute TF-IDF for terms w/ only one occurrence, to save time
              continue;
            }

            $tf = $count / $termcount;
            $tfidf = $tf * $idf( $term );
            $term_tfidf[] = array(
              'term' => $term,
              'count' => $count,
              'tfidf' => $tfidf
            );
          }

          usort( $term_tfidf, 'wceu_datavis_sort_descending_order' );
        }

        // Return the first 20 most-relevant terms for this document
        return array(
          'id' => $category['id'],
          'title' => $category['name'],
          'parent' => $category['parent'],
          'terms' => $term_tfidf // array_slice( $term_tfidf, 0, 20)
        );
      }, $categories ) );

      set_transient( 'wceu_datavis_term_tfidf_by_category', $term_tfidf_by_category, 12 * HOUR_IN_SECONDS );

      return rest_ensure_response( $term_tfidf_by_category );
    }
  ));
}

add_action( 'rest_api_init', 'wceu_datavis_register_routes' );
