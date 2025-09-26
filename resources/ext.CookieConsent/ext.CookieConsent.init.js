/**
 * JavaScript file for the CookieConsent extension.
 *
 * @param $
 * @param cookieConsent
 */

( function ( $, cookieConsent ) {
	$.when( $.ready ).then( () => {
		cookieConsent.init();
	} );
}( jQuery, cookieConsent ) );
