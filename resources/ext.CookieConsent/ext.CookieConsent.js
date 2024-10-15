// Value of the above cookies when consent is given
const COOKIECONSENT_CONSENT_GIVEN_COOKIE_VALUE = 'given';

// Cookie that is set when the dialog has been dismissed
const COOKIECONSENT_DIALOG_DISMISSED_COOKIE_NAME = 'cookieconsent_dialog_dismissed';

/**
 * Returns the available cookie categories.
 */
function getCookieCategories() {
	return mw.config.get( 'wgCookieConsentCategories' );
}

/**
 * Returns the name of the cookie that stores the consent of the given category.
 */
function getConsentCookieName( categoryName ) {
	return 'cookieconsent_consent_' + categoryName;
}

/**
 * Returns true if and only if consent is given for the given category.
 */
function isConsentGiven( categoryName ) {
	return mw.cookie.get( getConsentCookieName( categoryName ) ) === COOKIECONSENT_CONSENT_GIVEN_COOKIE_VALUE;
}

/**
 * Returns the consent preferences for all available cookie categories.
 */
function getConsentPreferences() {
	const preferences = {};

	for ( const categoryName of Object.keys( getCookieCategories() ) ) {
		preferences[categoryName] = isConsentGiven(categoryName);
	}

	return preferences;
}

/**
 * Updates the consent preferences with the given preferences.
 */
function updateConsentPreferences(consentPreferences) {
	for ( let [categoryName, preference] of Object.entries(consentPreferences) ) {
		const cookieName = getConsentCookieName( categoryName );
		const cookieValue = preference ? 'given' : null;
		const cookieOptions = preference ?
			{ expires: 60 * 60 * 24 * 365 } : // 1 year
			{};

		mw.cookie.set( cookieName, cookieValue, cookieOptions );
	}

	if ( !mw.cookie.get( COOKIECONSENT_DIALOG_DISMISSED_COOKIE_NAME ) ) {
		// Set the dialog to "dismissed" to disable automatic opening
		mw.cookie.set( COOKIECONSENT_DIALOG_DISMISSED_COOKIE_NAME, 'dismissed' );
	}

	// Reload the page
	location.reload();
}

/**
 * Opens the detailed consent preferences dialog, where the user can select which categories to accept.
 */
function openDetailedCookiePreferencesDialog() {
	function DetailedConsentDialog( config ) {
		DetailedConsentDialog.super.call( this, config );
	}

	// The consent dialog is a process dialog
	// @see https://www.mediawiki.org/wiki/OOUI/Windows/Process_Dialogs
	OO.inheritClass( DetailedConsentDialog, OO.ui.ProcessDialog );

	const windowManager = new OO.ui.WindowManager();
	$( document.body ).append( windowManager.$element );

	const consentDialog = new DetailedConsentDialog( {
		size: 'medium'
	} );

	DetailedConsentDialog.static.name = 'ext.CookieConsent.detailedConsentDialog';
	DetailedConsentDialog.static.title = mw.message( 'cookieconsent-detailed-dialog-title' ).text();
	DetailedConsentDialog.static.actions = [
		{
			action: 'save-preferences',
			label: mw.message( 'cookieconsent-save-preferences' ).text(),
			flags: [ 'primary', 'progressive' ]
		},
	];

	if ( mw.cookie.get( COOKIECONSENT_DIALOG_DISMISSED_COOKIE_NAME ) ) {
		// If the dialog has been dismissed before, add a "Cancel" button
		DetailedConsentDialog.static.actions.push( {
			action: 'cancel',
			label: mw.message( 'cancel' ).text(),
			flags: 'safe'
		} );
	}

	DetailedConsentDialog.prototype.initialize = function () {
		DetailedConsentDialog.super.prototype.initialize.apply( this, arguments );

		// Necessary cookies checkbox
		const necessaryCookiesFieldsetItem = new OO.ui.FieldLayout( new OO.ui.CheckboxInputWidget( { selected: true, disabled: true } ), {
			label: mw.message( 'cookieconsent-category-name-strictly-necessary' ).text(),
			align: 'inline',
			help: mw.message( 'cookieconsent-category-desc-strictly-necessary' ).text()
		});

		// Other categories
		this.preferenceCheckboxes = {};
		this.preferenceFieldsetItems = [necessaryCookiesFieldsetItem];

		for ( const [ categoryName, category ] of Object.entries( getCookieCategories() ) ) {
			this.preferenceCheckboxes[categoryName] = new OO.ui.CheckboxInputWidget();
			console.log(category);
			this.preferenceFieldsetItems.push(new OO.ui.FieldLayout( this.preferenceCheckboxes[categoryName], {
				label: category.namemsg ? mw.message( category.namemsg ).text() : category.name,
				align: 'inline',
				help: category.descriptionmsg ? mw.message( category.descriptionmsg ).text() : category.description
			}));
		}

		this.panel = new OO.ui.PanelLayout( {
			padded: true,
			expanded: false
		} );

		this.content = new OO.ui.FieldsetLayout( { classes: [ 'cookieconsent-dialog-fieldset-layout' ] } )
			.addItems( this.preferenceFieldsetItems );

		this.panel.$element.append( mw.message( 'cookieconsent-detailed-dialog-intro' ).parse() );
		this.panel.$element.append( this.content.$element );
		this.panel.$element.append( mw.message( 'cookieconsent-detailed-dialog-outro' ).parse() );

		this.$body.append( this.panel.$element );
	}

	// Let the dialog know which consent preferences have (previously) been given, so that the checkboxes can be
	// (un)checked accordingly
	DetailedConsentDialog.prototype.setConsentPreferences = function ( consentPreferences ) {
		for ( const categoryName of Object.keys( getCookieCategories() ) ) {
			this.preferenceCheckboxes[categoryName].setSelected( consentPreferences[categoryName] );
		}
	}

	// Get the current consent preferences as visible in the dialog
	DetailedConsentDialog.prototype.getConsentPreferences = function () {
		const consentPreferences = {};

		for ( const categoryName of Object.keys( getCookieCategories() ) ) {
			consentPreferences[categoryName] = this.preferenceCheckboxes[categoryName].isSelected();
		}

		return consentPreferences;
	}

	// The setup process takes data inserted during the initialisation of the window, and updates the presentation
	// accordingly.
	DetailedConsentDialog.prototype.getSetupProcess = function ( data ) {
		return DetailedConsentDialog.super.prototype.getSetupProcess.call( this, data )
			.next( () => this.setConsentPreferences( data.consentPreferences ), this );
	}

	DetailedConsentDialog.prototype.getActionProcess = function ( action ) {
		return new OO.ui.Process( function () {
			if ( action === 'save-preferences' ) {
				updateConsentPreferences( this.getConsentPreferences() );
			} else if ( action === 'cancel' ) {
				windowManager.closeWindow( consentDialog );
			} else {
				// Fallback to parent handler
				return DetailedConsentDialog.super.prototype.getActionProcess.call( this, action );
			}
		}, this );
	}

	DetailedConsentDialog.prototype.getBodyHeight = function () {
		return this.panel.$element.outerHeight( true );
	}

	windowManager.addWindows( [ consentDialog ] );
	windowManager.openWindow( consentDialog, { consentPreferences: getConsentPreferences() } );
}

/**
 * Opens the simple cookie preferences dialog, where the user can click "Accept all" or "Manage preferences".
 */
function openSimpleCookiePreferencesDialog() {
	function SimpleConsentDialog( config ) {
		SimpleConsentDialog.super.call( this, config );
	}

	// The consent dialog is a process dialog
	// @see https://www.mediawiki.org/wiki/OOUI/Windows/Process_Dialogs
	OO.inheritClass( SimpleConsentDialog, OO.ui.ProcessDialog );

	const windowManager = new OO.ui.WindowManager();
	$( document.body ).append( windowManager.$element );

	const consentDialog = new SimpleConsentDialog( {
		size: 'medium'
	} );

	SimpleConsentDialog.static.name = 'ext.CookieConsent.simpleConsentDialog';
	SimpleConsentDialog.static.title = mw.message( 'cookieconsent-simple-dialog-title' ).text();
	SimpleConsentDialog.static.actions = [
		{
			action: 'accept-all',
			label: mw.message( 'cookieconsent-accept-all' ).text(),
			flags: [ 'primary', 'progressive' ]
		},
		{
			action: 'manage-preferences',
			label: mw.message( 'cookieconsent-manage-preferences-short' ).text(),
			flags: 'safe'
		}
	];

	SimpleConsentDialog.prototype.initialize = function () {
		SimpleConsentDialog.super.prototype.initialize.apply( this, arguments );

		this.panel = new OO.ui.PanelLayout( {
			padded: true,
			expanded: false
		} );

		this.panel.$element.append( mw.message( 'cookieconsent-simple-dialog-content' ).parse() );

		this.$body.append( this.panel.$element );
	}

	SimpleConsentDialog.prototype.getActionProcess = function ( action ) {
		return new OO.ui.Process( function () {
			if ( action === 'accept-all' ) {
				const consentPreferences = {};

				for ( const categoryName of Object.keys( getCookieCategories() ) ) {
					consentPreferences[categoryName] = true;
				}

				updateConsentPreferences( consentPreferences );
				windowManager.closeWindow( consentDialog );
			} else if ( action === 'manage-preferences' ) {
				openDetailedCookiePreferencesDialog();
				windowManager.closeWindow( consentDialog );
			} else {
				// Fallback to parent handler
				return SimpleConsentDialog.super.prototype.getActionProcess.call( this, action );
			}
		}, this );
	}

	SimpleConsentDialog.prototype.getBodyHeight = function () {
		return this.panel.$element.outerHeight( true );
	}

	windowManager.addWindows( [ consentDialog ] );
	windowManager.openWindow( consentDialog, { consentPreferences: getConsentPreferences() } );
}

$.when( $.ready ).then( function () {
	// Add a click handler for managing cookie preferences
	$("#manage-cookie-preferences").click(function (e) {
		e.preventDefault();
		openDetailedCookiePreferencesDialog();
	});

	if ( !mw.cookie.get( COOKIECONSENT_DIALOG_DISMISSED_COOKIE_NAME ) ) {
		openSimpleCookiePreferencesDialog();
	}
} );
