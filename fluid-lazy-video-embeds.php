<?php
/**
 * Plugin Name: Fluid Lazy Video Embeds
 * Plugin URI: https://github.com/thuijssoon/fluid-lazy-video-embeds/
 * Description: Lazy load your YouTube and Vimeo videos and maintain their aspect ratio.
 * Author: Thijs Huijssoon
 * Author URI: https://github.com/thuijssoon/
 * Version: 0.1.0
 * Text Domain: fluid-lazy-video-embeds
 * Domain Path: languages
 *
 * Fluid Lazy Video Embeds is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * Fluid Lazy Video Embeds is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Fluid Lazy Video Embeds. If not, see <http://www.gnu.org/licenses/>.
 *
 * @package FLVE
 * @category Core
 * @author Thijs Huijssoon
 * @version 0.1.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! class_exists( 'Fluid_Lazy_Video_Embeds' ) ) :

	/**
	 * Main Fluid_Lazy_Video_Embeds Class.
	 *
	 * @since 0.1.0
	 */
	final class Fluid_Lazy_Video_Embeds {
	/** Singleton *************************************************************/

	/**
	 * @var Fluid_Lazy_Video_Embeds The one true Fluid_Lazy_Video_Embeds
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
	 * Main Fluid_Lazy_Video_Embeds Instance.
	 *
	 * Ensures that only one instance of Fluid_Lazy_Video_Embeds exists in memory at any one
	 * time. Also prevents needing to define globals all over the place.
	 *
	 * @since 0.1.0
	 * @static
	 * @staticvar array $instance
	 * @uses Fluid_Lazy_Video_Embeds::setup_constants() Setup the constants needed.
	 * @uses Fluid_Lazy_Video_Embeds::includes() Include the required files.
	 * @uses Fluid_Lazy_Video_Embeds::load_textdomain() load the language files.
	 * @see FLVE()
	 * @return The one true Fluid_Lazy_Video_Embeds
	 */
	public static function instance() {
		if ( ! isset( self::$instance ) && ! ( self::$instance instanceof Fluid_Lazy_Video_Embeds ) ) {
			self::$instance = new Fluid_Lazy_Video_Embeds;
			self::$instance->setup_constants();

			add_action( 'plugins_loaded', array( self::$instance, 'load_textdomain' ) );

			self::$instance->includes();

			if ( is_admin() || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
				// FLVE_Admin_Settings::get_instance();
			} else {
				FLVE_Front_End::instance();
			}

		}
		return self::$instance;
	}

	/**
	 * Throw error on object clone.
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @since 0.1.0
	 * @access protected
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'fluid-lazy-video-embeds' ), '0.1.0' );
	}

	/**
	 * Disable unserializing of the class.
	 *
	 * @since 0.1.0
	 * @access protected
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, __( 'Cheatin&#8217; huh?', 'fluid-lazy-video-embeds' ), '0.1.0' );
	}

	/**
	 * Setup plugin constants.
	 *
	 * @access private
	 * @since 0.1.0
	 * @return void
	 */
	private function setup_constants() {

		// Plugin version.
		if ( ! defined( 'FLVE_VERSION' ) ) {
			define( 'FLVE_VERSION', '0.1.0' );
		}

		// Plugin Folder Path.
		if ( ! defined( 'FLVE_PLUGIN_DIR' ) ) {
			define( 'FLVE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
		}

		// Plugin Folder URL.
		if ( ! defined( 'FLVE_PLUGIN_URL' ) ) {
			define( 'FLVE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
		}

		// Plugin Root File.
		if ( ! defined( 'FLVE_PLUGIN_FILE' ) ) {
			define( 'FLVE_PLUGIN_FILE', __FILE__ );
		}
	}

	/**
	 * Include required files.
	 *
	 * @access private
	 * @since 0.1.0
	 * @return void
	 */
	private function includes() {
		if ( file_exists( FLVE_PLUGIN_DIR . 'includes/deprecated-functions.php' ) ) {
			require_once FLVE_PLUGIN_DIR . 'includes/deprecated-functions.php';
		}

		if ( is_admin() || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
			// require_once FLVE_PLUGIN_DIR . 'includes/class-flve-admin-settings.php';
		} else {
			require_once FLVE_PLUGIN_DIR . 'includes/class-flve-front-end.php';			
		}
	}

	/**
	 * Loads the plugin language files.
	 *
	 * @access public
	 * @since 0.1.0
	 * @return void
	 */
	public function load_textdomain() {

		/*
		 * Due to the introduction of language packs through translate.wordpress.org, loading our textdomain is complex.
		 *
		 * We will look for translation files in several places:
		 *
		 * - wp-content/languages/plugins/fluid-lazy-video-embeds (introduced with language packs)
		 * - wp-content/plugins/fluid-lazy-video-embeds/languages/
		 */

		// Set filter for plugin's languages directory.
		$flve_lang_dir = dirname( plugin_basename( FLVE_PLUGIN_FILE ) ) . '/languages/';
		$flve_lang_dir = apply_filters( 'flve_languages_directory', $flve_lang_dir );

		// Traditional WordPress plugin locale filter.
		$locale        = apply_filters( 'plugin_locale',  get_locale(), 'fluid-lazy-video-embeds' );
		$mofile        = sprintf( '%1$s-%2$s.mo', 'fluid-lazy-video-embeds', $locale );

		// Look in wp-content/languages/plugins/fluid-lazy-video-embeds
		$mofile_global = WP_LANG_DIR . '/plugins/fluid-lazy-video-embeds/' . $mofile;

		if ( file_exists( $mofile_global ) ) {

			load_textdomain( 'fluid-lazy-video-embeds', $mofile_global1 );

		} else {

			// Load the default language files.
			load_plugin_textdomain( 'fluid-lazy-video-embeds', false, $flve_lang_dir );

		}

	}

}

endif; // End if class_exists check.


/**
 * The main function for that returns Fluid_Lazy_Video_Embeds
 *
 * The main function responsible for returning the one true Fluid_Lazy_Video_Embeds
 * Instance to functions everywhere.
 *
 * Use this function like you would a global variable, except without needing
 * to declare the global.
 *
 * Example: <?php $flve = FLVE(); ?>
 *
 * @since 0.1.0
 * @return object The one true Fluid_Lazy_Video_Embeds Instance.
 */
function FLVE() {
	return Fluid_Lazy_Video_Embeds::instance();
}

// Get FLVE Running.
FLVE();
