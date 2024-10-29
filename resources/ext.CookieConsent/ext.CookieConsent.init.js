/**
 * JavaScript file for the CookieConsent extension.
 */

( function ( $, cookieConsent ) {
	function enableScript( script ) {
		const newScript = document.createElement('script');
		newScript.text = script.text;
		for ( const attributeName of script.getAttributeNames() ) {
			newScript.setAttribute( attributeName, script.getAttribute( attributeName ) );
		}

		newScript.setAttribute('type', 'text/javascript');

		const parent = script.parentElement;

		parent.insertBefore(newScript, script);
		parent.removeChild(script);
	}

	function enableIframe( iframe ) {
		const src = iframe.getAttribute( 'data-src' );
		iframe.setAttribute( 'src', src );
	}

	function enableScripts() {
		const scripts = document.querySelectorAll( 'script[data-cookieconsent]' );
		for ( const script of scripts ) {
			const categories = script.getAttribute( 'data-cookieconsent' ).split(',');
			const consents = categories.map((category) => cookieConsent.isConsentGiven( category ) );
			if ( consents.some( ( p ) => p ) ) {
				enableScript( script );
			}
		}
	}

	function enableIframes() {
		const iframes = document.querySelectorAll( 'iframe[data-cookieconsent]' );
		for ( const iframe of iframes ) {
			const categories = iframe.getAttribute( 'data-cookieconsent' ).split(',');
			const consents = categories.map((category) => cookieConsent.isConsentGiven( category ) );
			if ( consents.some( ( p ) => p ) ) {
				enableIframe( iframe );
			}
		}
	}

	$.when( $.ready ).then( function () {
		// Add a click handler for managing cookie preferences to #manage-cookie-preferences.
		$("#manage-cookie-preferences").click(function (e) {
			cookieConsent.openDetailedDialog();
		});

		// If the dialog has not been dismissed, show it immediately.
		if ( !cookieConsent.isDismissed() ) {
			cookieConsent.openSimpleDialog();
		} else {
			enableScripts();
			enableIframes();
		}
	} );
} )( jQuery, cookieConsent );
