( function ( $, cc ) {
	$.when( $.ready ).then( function () {
		// Add a click handler for managing cookie preferences to #manage-cookie-preferences.
		$("#manage-cookie-preferences").click(function (e) {
			cc.openDetailedDialog();
		});

		// If the dialog has not been dismissed, show it immediately.
		if ( !cc.isDismissed() ) {
			cc.openSimpleDialog();
		}

		// Update any tags that contain code for which specific consent is required.
		for ( let categoryName of cc.getConsentedCategories() ) {
			$(`script[data-cookieconsent="${categoryName}"]`).each(function () {
				// Update the script's type
				$(this).attr("type", "text/javascript");
				// Evaluate its content
				eval($(this).text());
			});
		}
	} );
} )( jQuery, cc );
