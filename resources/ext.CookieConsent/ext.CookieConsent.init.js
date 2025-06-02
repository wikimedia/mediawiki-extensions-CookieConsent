/**
 * JavaScript file for the CookieConsent extension.
 */

( function ( $, cookieConsent ) {
	$.when( $.ready ).then( () => {
		cookieConsent.init();
	} );
}( jQuery, cookieConsent ) );
