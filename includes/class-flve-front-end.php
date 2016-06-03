<?php
/**
 * FLVE Front End class to manipulate the oembed output, enqueue scrips and styles.
 *
 * @package FLVE
 * @category Front
 * @author Thijs Huijssoon
 * @version 0.1.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! class_exists( 'FLVE_Front_End' ) ) :

	/**
	 * Main FLVE_Front_End Class.
	 *
	 * @since 0.1.0
	 */
	final class FLVE_Front_End {
	/** Singleton *************************************************************/

	/**
	 * @var FLVE_Front_End The one true FLVE_Front_End
	 * @since 0.1.0
	 */
	private static $instance;

	/**
	 * FLVE options.
	 *
	 * @var array|false
	 * @since 0.1.0
	 */
	public $options = false;

	/**
	 * FLVE_Front_End Instance.
	 *
	 * Ensures that only one instance of FLVE_Front_End exists in memory at any one
	 * time. Does the following:
	 *
	 * 1. Enqueues style
	 * 2. Changes YouTube and Vimeo embeds to make them fluid and lazy-loadable
	 * 3. Obtains video thumbnail image for videos
	 * 4. Determines video aspect ratio
	 * 5. Will eventually generate JSON-LD for videos
	 * 6. Conditionally enqueues scripts
	 *
	 * @since 0.1.0
	 * @static
	 * @staticvar array $instance
	 * @see FLVE()
	 * @return The one true FLVE_Front_End
	 */
	public static function instance() {
		if ( ! isset( self::$instance ) && ! ( self::$instance instanceof FLVE_Front_End ) ) {
			self::$instance = new FLVE_Front_End;
			self::$instance->add_actions();
		}
		return self::$instance;
	}

	/**
	 * Throw error on object clone.
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access protected
	 * @since  0.1.0
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'fluid-lazy-video-embeds' ), '0.1.0' );
	}

	/**
	 * Disable unserializing of the class.
	 *
	 * @access protected
	 * @since  0.1.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'fluid-lazy-video-embeds' ), '0.1.0' );
	}

	/**
	 * Setup plugin actions.
	 *
	 * @access private
	 * @since  0.1.0
	 * @return void
	 */
	private function add_actions() {
		// Filter the cached oEmbed HTML
		add_filter( 'embed_oembed_html', array( $this, 'filter_oembed' ), 20, 4 );

		// Enqueue CSS
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_style' ) );
	}

	/**
	 * Filter the cached oEmbed HTML.
	 *
	 * @access public
	 * @since  0.1.0
	 * @return filtered oEmbed HTML
	 */
	public function filter_oembed( $html, $url, $attr, $post_id ) {
		if ( is_feed() ) {
			return;
		}

		$provider = $this->get_supported_oembed_providor_from_url( $url );
		if ( $provider === false ) {
			return $html;
		}

		$video_id = $this->get_video_id_from_url( $url, $provider );
		if ( !$video_id ) {
			return $html;
		}

		$meta = $this->get_video_meta( $provider, $video_id );
		if ( !$meta ) {
			return $html;
		}

		$embed_url = '';
		switch ( $provider ) {
		case 'youtube':
			$embed_url = '//www.youtube.com/embed/' . $video_id . '?modestbranding=1&autohide=1&showinfo=0&rel=0';
			break;

		case 'vimeo':
			$embed_url = '//player.vimeo.com/video/' . $video_id . '?badge=0&portrait=0&byline=0&title=0';
			break;
		}

		$thumbnail_url = $meta['thumbnail_url'];
		$proportions   = $meta['proportions'] < 70 ? '16x9' : '3x4';
		$title         = $meta['title'];

		wp_enqueue_script( 'flve-script' );

		ob_start();

		include $this->locate_video_template();

		return ob_get_clean();
	}

	public function enqueue_style() {
		if ( is_feed() ) {
			return;
		}

		$suffix = '';
		if ( SCRIPT_DEBUG ) {
			$suffix = '.min';
		}

		wp_enqueue_style( 'flve-style', FLVE_PLUGIN_URL . '/assets/css/flve-front-end' . $suffix . '.css' );
		wp_register_script( 'flve-script', FLVE_PLUGIN_URL . '/assets/js/flve-front-end-vanilla-js' . $suffix . '.js', array(), '', true );
	}

	/**
	 * Extract a supported oEmbed provider from a given URL.
	 *
	 * @access private
	 * @since  0.1.0
	 * @param  string $url      The URL from which to extract the provider
	 * @return youtube|vimeo|false
	 */
	private function get_supported_oembed_providor_from_url( $url ) {
		// Ensure the url is lowercase
		$url = strtolower( $url );

		// Detect the providers
		preg_match( '/((youtu\.be|youtube|vimeo)\.com)/i', $url, $matches );

		// If nothing was detected...
		if ( !isset( $matches[2] ) )
			return false;

		// Remove the '.' from youtu.be if present
		$provider = str_replace( '.', '', (string) $matches[2] );
		return $provider;
	}

	/**
	 * Extract a video id from a url
	 *
	 * @access private
	 * @since  0.1.0
	 * @param  string $url      The URL from which to extract the id
	 * @param  string $provider youtube|vimeo
	 * @return string           The video id
	 */
	private function get_video_id_from_url( $url, $provider ) {
		switch ( $provider ) {
		case 'youtube': // Credits: https://gist.github.com/simplethemes/7591414
			if ( preg_match( '%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})%i', $url, $matches ) ) {
				return $matches[1];
			}
			break;

		case 'vimeo': // Credits: https://github.com/lingtalfi/video-ids-and-thumbnails/blob/master/function.video.php#L29
			if ( preg_match( '#(?:https?://)?(?:www.)?(?:player.)?vimeo.com/(?:[a-z]*/)*([0-9]{6,11})[?]?.*#', $url, $matches ) ) {
				return $matches[1];
			}
			break;

		}
		return false;
	}

	/**
	 * [get_video_meta description]
	 *
	 * @access private
	 * @since  0.1.0
	 * @param  [type] $provider [description]
	 * @param  [type] $video_id [description]
	 * @return [type]           [description]
	 */
	private function get_video_meta( $provider, $video_id ) {
		$cached_meta = $this->get_video_meta_from_cache( $provider, $video_id );

		if ( $cached_meta ) {
			return $cached_meta;
		}

		$remote_meta = $this->get_remote_meta_for_video( $provider, $video_id );

		if ( $remote_meta ) {
			$this->add_video_meta_to_cache( $provider, $video_id, $remote_meta );
			return $remote_meta;
		}

		return false;
	}

	private function get_remote_meta_for_video( $provider, $video_id ) {
		$json = false;
		switch ( $provider ) {
		case 'youtube':
			$response = wp_remote_get( 'https://www.youtube.com/oembed?url=https%3A//www.youtube.com/watch?v=' . $video_id );
			try {
				$json = json_decode( $response['body'] );
			} catch ( Exception $ex ) {
				$json = false;
			}
			break;

		case 'vimeo':
			$response = wp_remote_get( 'https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/' . $video_id );
			try {
				$json = json_decode( $response['body'] );
			} catch ( Exception $ex ) {
				$json = false;
			}
			break;
		}
		if ( $json ) {
			$proportions = round( intval( $json->height ) / intval( $json->width ) * 100 );
			$thumbnail_url = $json->thumbnail_url;
			$title = $json->title;
			return compact( 'proportions', 'thumbnail_url', 'title' );
		}
		return false;
	}

	private function add_video_meta_to_cache( $provider, $video_id, $meta ) {
		$cache = get_transient( 'flve-video-cache' );

		if ( !$cache ) {
			$cache = [];
		}

		$cache[ md5( $provider . '-' . $video_id ) ] = $meta;

		return set_transient( 'flve-video-cache', $cache );
	}

	private function get_video_meta_from_cache( $provider, $video_id ) {
		$cache = get_transient( 'flve-video-cache' );

		if ( !$cache ) {
			return false;
		}

		$key = md5( $provider . '-' . $video_id );

		if ( isset( $cache[$key] ) ) {
			return $cache[$key];
		}

		return false;
	}

	/**
	 * Locate a template part
	 *
	 * Looks in the following places (in order)
	 * 1. Child theme
	 * 2. Parent theme
	 * 3. Plugin
	 *
	 * @since 0.1.0
	 *
	 * @param string  $slug The slug name for the generic template.
	 * @param string  $name The name of the specialised template.
	 * @return string
	 */
	private function locate_video_template() {
		$templates = apply_filters( "flve_locate_video_template", array( 'flve-video.php' ) );

		$video_template = locate_template( $templates, false, false );

		if ( !empty( $video_template ) ) {
			return $video_template;
		}

		if ( file_exists( FLVE_PLUGIN_DIR . "templates/flve-video.php" ) ) {
			return FLVE_PLUGIN_DIR . "templates/flve-video.php";
		}
	}

}

endif; // End if class_exists check.
