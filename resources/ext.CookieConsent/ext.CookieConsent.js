// TODO: Make the categories configurable
const COOKIECONSENT_CATEGORIES = {
	preference: {
		cookie: 'cookieconsent_consent_preference',
		name: mw.message( 'cookieconsent-category-name-preference' ).text(),
		description: mw.message( 'cookieconsent-category-desc-preference' ).text(),
	},
	statistics: {
		cookie: 'cookieconsent_consent_statistics',
		name: mw.message( 'cookieconsent-category-name-statistics' ).text(),
		description: mw.message( 'cookieconsent-category-desc-statistics' ).text(),
	},
	marketing: {
		cookie: 'cookieconsent_consent_marketing',
		name: mw.message( 'cookieconsent-category-name-marketing' ).text(),
		description: mw.message( 'cookieconsent-category-desc-marketing' ).text()
	},
}

// Value of the above cookies when consent is given
const COOKIECONSENT_CONSENT_GIVEN = 'given';

// Cookie that is set when the dialog has been dismissed
const COOKIECONSENT_DIALOG_DISMISSED_COOKIE = 'cookieconsent_dialog_dismissed';

function openConsentDialogWithPreferences(consentPreferences) {
	function ConsentDialog( config ) {
		ConsentDialog.super.call( this, config );
	}

	// The consent dialog is a process dialog
	// @see https://www.mediawiki.org/wiki/OOUI/Windows/Process_Dialogs
	OO.inheritClass( ConsentDialog, OO.ui.ProcessDialog );

	const windowManager = new OO.ui.WindowManager();
	$( document.body ).append( windowManager.$element );

	const consentDialog = new ConsentDialog( {
		size: 'large'
	} );

	ConsentDialog.static.name = 'ext.CookieConsent.consentDialog';
	ConsentDialog.static.title = mw.message( 'cookieconsent-dialog-title' ).text();
	ConsentDialog.static.actions = [
		{
			action: 'save-preferences',
			label: mw.message( 'cookieconsent-save-preferences' ).text(),
			flags: [ 'primary', 'progressive' ]
		},
	];

	if ( mw.cookie.get( COOKIECONSENT_DIALOG_DISMISSED_COOKIE ) ) {
		// If the dialog has been dismissed before, add a "Cancel" button
		ConsentDialog.static.actions.push( {
			action: 'cancel',
			label: mw.message( 'cancel' ).text(),
			flags: 'safe'
		} );
	}

	ConsentDialog.prototype.initialize = function () {
		ConsentDialog.super.prototype.initialize.apply( this, arguments );

		// Necessary cookies checkbox
		const necessaryCookiesFieldsetItem = new OO.ui.FieldLayout( new OO.ui.CheckboxInputWidget( { selected: true, disabled: true } ), {
			label: mw.message( 'cookieconsent-category-name-strictly-necessary' ).text(),
			align: 'inline',
			help: mw.message( 'cookieconsent-category-desc-strictly-necessary' ).text()
		});

		// Other categories
		this.preferenceCheckboxes = {};
		this.preferenceFieldsetItems = [necessaryCookiesFieldsetItem];

		for ( const [ categoryName, category ] of Object.entries( COOKIECONSENT_CATEGORIES ) ) {
			this.preferenceCheckboxes[categoryName] = new OO.ui.CheckboxInputWidget();
			this.preferenceFieldsetItems.push(new OO.ui.FieldLayout( this.preferenceCheckboxes[categoryName], {
				label: category.name,
				align: 'inline',
				help: category.description
			}));
		}

		this.panel = new OO.ui.PanelLayout( {
			padded: true,
			expanded: false
		} );

		this.content = new OO.ui.FieldsetLayout( { classes: [ 'cookieconsent-dialog-fieldset-layout' ] } )
			.addItems( this.preferenceFieldsetItems );

		this.panel.$element.append( mw.message( 'cookieconsent-dialog-intro' ).parse() );
		this.panel.$element.append( this.content.$element );
		this.panel.$element.append( mw.message( 'cookieconsent-dialog-outro' ).parse() );

		this.$body.append( this.panel.$element );
	}

	// Let the dialog know which consent preferences have (previously) been given, so that the checkboxes can be
	// (un)checked accordingly
	ConsentDialog.prototype.setConsentPreferences = function ( consentPreferences ) {
		for ( const [ categoryName, category ] of Object.entries( COOKIECONSENT_CATEGORIES ) ) {
			this.preferenceCheckboxes[categoryName].setSelected( consentPreferences[categoryName] );
		}
	}

	// Get the current consent preferences as visible in the dialog
	ConsentDialog.prototype.getConsentPreferences = function () {
		const consentPreferences = {};

		for ( const [categoryName, category] of Object.entries( COOKIECONSENT_CATEGORIES ) ) {
			consentPreferences[categoryName] = this.preferenceCheckboxes[categoryName].isSelected();
		}

		return consentPreferences;
	}

	// The setup process takes data inserted during the initialisation of the window, and updates the presentation
	// accordingly.
	ConsentDialog.prototype.getSetupProcess = function ( data ) {
		return ConsentDialog.super.prototype.getSetupProcess.call( this, data )
			.next( () => this.setConsentPreferences( data.consentPreferences ), this );
	}

	ConsentDialog.prototype.getActionProcess = function ( action ) {
		return new OO.ui.Process( function () {
			if ( action === 'save-preferences' ) {
				const consentPreferences = this.getConsentPreferences();

				for ( let [categoryName, preference] of Object.entries(consentPreferences) ) {
					const cookieName = COOKIECONSENT_CATEGORIES[categoryName].cookie;
					const cookieValue = preference ? 'given' : null;
					const cookieOptions = preference ?
						{ expires: 60 * 60 * 24 * 365 } : // 1 year
						{};

					mw.cookie.set( cookieName, cookieValue, cookieOptions );
				}

				if ( !mw.cookie.get( COOKIECONSENT_DIALOG_DISMISSED_COOKIE ) ) {
					// Set the dialog to "dismissed" to disable automatic opening
					mw.cookie.set( COOKIECONSENT_DIALOG_DISMISSED_COOKIE, 'dismissed' );
				}

				// Reload the page
				location.reload();
			} else if ( action === 'cancel' ) {
				windowManager.closeWindow( consentDialog );
			} else {
				// Fallback to parent handler
				return ConsentDialog.super.prototype.getActionProcess.call( this, action );
			}
		}, this );
	}

	ConsentDialog.prototype.getBodyHeight = function () {
		return this.panel.$element.outerHeight( true );
	}

	windowManager.addWindows( [ consentDialog ] );
	windowManager.openWindow( consentDialog, { consentPreferences: consentPreferences } );
}

function getCurrentConsentPreferences() {
	const consentPreferences = {};

	for ( const [categoryName, category] of Object.entries( COOKIECONSENT_CATEGORIES ) ) {
		consentPreferences[categoryName] = mw.cookie.get( category.cookie ) === COOKIECONSENT_CONSENT_GIVEN;
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

	if ( !mw.cookie.get( COOKIECONSENT_DIALOG_DISMISSED_COOKIE ) ) {
		showConsentDialog();
	}
} );
