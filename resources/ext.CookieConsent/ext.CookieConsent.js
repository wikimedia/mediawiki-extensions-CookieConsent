// Names of the cookies to store consent
const COOKIECONSENT_COOKIES = {
	preference: 'cookieconsent_preference_consent',
	statistics: 'cookieconsent_statistics_consent',
	marketing: 'cookieconsent_marketing_consent',
}

// Value of the above cookies when consent is given
const COOKIECONSENT_CONSENT_GIVEN = 'given';

// Cookie that is set when the dialog has been dismissed
const COOKIECONSENT_DIALOG_DISMISSED = 'cookieconsent_dialog_dismissed';

function openConsentDialogWithPreferences(consentPreferences) {
	function ConsentDialog( config ) {
		ConsentDialog.super.call( this, config );
	}

	function UpdateConsentPreference( category, preference ) {
		const cookieName = COOKIECONSENT_COOKIES[category];

		if ( preference ) {
			mw.cookie.set( cookieName, 'given', { expires: 60 * 60 * 24 * 365 } );
		} else {
			// Unset the cookie
			mw.cookie.set( cookieName, null );
		}
	}

	// The consent dialog is a process dialog
	// @see https://www.mediawiki.org/wiki/OOUI/Windows/Process_Dialogs
	OO.inheritClass( ConsentDialog, OO.ui.ProcessDialog );

	const windowManager = new OO.ui.WindowManager();
	$( document.body ).append( windowManager.$element );

	ConsentDialog.static.name = 'ext.CookieConsent.consentDialog';
	ConsentDialog.static.title = mw.message( 'cookieconsent-dialog-title' ).text();
	ConsentDialog.static.actions = [
		{
			action: 'save-preferences',
			label: mw.message( 'cookieconsent-save-preferences' ).text(),
			flags: [ 'primary', 'progressive' ]
		}
	];

	ConsentDialog.prototype.initialize = function () {
		ConsentDialog.super.prototype.initialize.apply( this, arguments );

		// Necessary cookies checkbox
		this.necessaryCookiesCheckbox = new OO.ui.CheckboxInputWidget( { selected: true, disabled: true } );
		const necessaryCookiesField = new OO.ui.FieldLayout( this.necessaryCookiesCheckbox, {
			label: mw.message( 'cookieconsent-category-name-strictly-necessary' ).text(),
			align: 'inline',
			help: mw.message( 'cookieconsent-category-desc-strictly-necessary' ).text()
		});

		this.preferenceCookiesCheckbox = new OO.ui.CheckboxInputWidget();
		const preferenceCookiesField = new OO.ui.FieldLayout( this.preferenceCookiesCheckbox, {
			label: mw.message( 'cookieconsent-category-name-preference' ).text(),
			align: 'inline',
			help: mw.message( 'cookieconsent-category-desc-preference' ).text()
		});

		this.statisticsCookiesCheckbox = new OO.ui.CheckboxInputWidget();
		const statisticsCookiesField = new OO.ui.FieldLayout( this.statisticsCookiesCheckbox, {
			label: mw.message( 'cookieconsent-category-name-analytical' ).text(),
			align: 'inline',
			help: mw.message( 'cookieconsent-category-desc-analytical' ).text()
		});

		this.marketingCookiesCheckbox = new OO.ui.CheckboxInputWidget();
		const marketingCookiesField = new OO.ui.FieldLayout( this.marketingCookiesCheckbox, {
			label: mw.message( 'cookieconsent-category-name-advertising' ).text(),
			align: 'inline',
			help: mw.message( 'cookieconsent-category-desc-advertising' ).text()
		});

		this.panel = new OO.ui.PanelLayout( {
			padded: true,
			expanded: false
		} );

		const fieldsetItems = [
			necessaryCookiesField,
			preferenceCookiesField,
			statisticsCookiesField,
			marketingCookiesField
		];

		this.content = new OO.ui.FieldsetLayout( { classes: [ 'cookieconsent-dialog-fieldset-layout' ] } )
			.addItems( fieldsetItems );

		this.panel.$element.append( mw.message( 'cookieconsent-dialog-intro' ).parse() );
		this.panel.$element.append( this.content.$element );
		this.panel.$element.append( mw.message( 'cookieconsent-dialog-outro' ).parse() );

		this.$body.append( this.panel.$element );
	}

	// Let the dialog know which consent preferences have (previously) been given, so that the checkboxes can be
	// (un)checked accordingly
	ConsentDialog.prototype.setConsentPreferences = function ( consentPreferences ) {
		this.preferenceCookiesCheckbox.setSelected( consentPreferences.preference );
		this.statisticsCookiesCheckbox.setSelected( consentPreferences.statistics );
		this.marketingCookiesCheckbox.setSelected( consentPreferences.marketing );
	}

	// Get the current consent preferences as visible in the dialog
	ConsentDialog.prototype.getConsentPreferences = function () {
		return {
			preference: this.preferenceCookiesCheckbox.selected,
			statistics: this.statisticsCookiesCheckbox.selected,
			marketing: this.marketingCookiesCheckbox.selected
		};
	}

	// The setup process takes data inserted during the initialisation of the window, and updates the presentation
	// accordingly.
	ConsentDialog.prototype.getSetupProcess = function ( data ) {
		return ConsentDialog.super.prototype.getSetupProcess.call( this, data )
			.next( () => this.setConsentPreferences( data.consentPreferences ), this );
	}

	ConsentDialog.prototype.getActionProcess = function ( action ) {
		return new OO.ui.Process( function () {
			if ( action !== 'save-preferences' ) {
				// Fallback to parent handler
				return ConsentDialog.super.prototype.getActionProcess.call( this, action );
			}

			const consentPreferences = this.getConsentPreferences();

			for ( let [category, preference] of Object.entries(consentPreferences) ) {
				UpdateConsentPreference( category, preference );
			}

			if ( !mw.cookie.get( COOKIECONSENT_DIALOG_DISMISSED ) ) {
				// Set the dialog to "dismissed" to disable automatic opening
				mw.cookie.set( COOKIECONSENT_DIALOG_DISMISSED, 'dismissed' );
			}

			windowManager.closeWindow( this );
		}, this );
	}

	ConsentDialog.prototype.getBodyHeight = function () {
		return this.panel.$element.outerHeight( true );
	}

	const consentDialog = new ConsentDialog( {
		size: 'large'
	} );

	windowManager.addWindows( [ consentDialog ] );
	windowManager.openWindow( consentDialog, { consentPreferences: consentPreferences } );
}

function getCurrentConsentPreferences() {
	const consentPreferences = {};

	for ( const [category, cookieName] of Object.entries( COOKIECONSENT_COOKIES ) ) {
		consentPreferences[category] = mw.cookie.get( cookieName ) === COOKIECONSENT_CONSENT_GIVEN;
	}

	return consentPreferences;
}

function showConsentDialog() {
	const currentConsentPreferences = getCurrentConsentPreferences();

	openConsentDialogWithPreferences( currentConsentPreferences );
}

$.when( $.ready ).then( function () {
	// Add a click handler for managing cookie preferences
	$("#manage-cookie-preferences").click(function (e) {
		e.preventDefault();
		showConsentDialog();
	});

	if ( !mw.cookie.get( COOKIECONSENT_DIALOG_DISMISSED ) ) {
		showConsentDialog();
	}
} );
