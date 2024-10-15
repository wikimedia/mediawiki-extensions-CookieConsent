/**
 * JavaScript file for the CookieConsent extension.
 */

( function ( $, cc ) {
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

	$.when( $.ready ).then( function () {
		// Add a click handler for managing cookie preferences to #manage-cookie-preferences.
		$("#manage-cookie-preferences").click(function (e) {
			cc.openDetailedDialog();
		});

		// If the dialog has not been dismissed, show it immediately.
		if ( !cc.isDismissed() ) {
			cc.openSimpleDialog();
		}

		const scripts = document.querySelectorAll( 'script[data-cookieconsent]' );
		for ( const script of scripts ) {
			const cookieCategoryName = script.getAttribute( 'data-cookieconsent' );
			if ( cc.isConsentGiven( cookieCategoryName ) ) {
				enableScript( script );
			}
		}
	} );
} )( jQuery, cc );
