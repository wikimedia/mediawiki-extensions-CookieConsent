function openConsentDialogWithPreferences(consentPreferences) {
	function ConsentDialog( config ) {
		ConsentDialog.super.call( this, config );
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
		this.necessaryCookiesCheckbox = new OO.ui.CheckboxInputWidget( {
			selected: true,
			disabled: true,
		} );

		this.preferenceCookiesCheckbox = new OO.ui.CheckboxInputWidget();
		this.statisticsCookiesCheckbox = new OO.ui.CheckboxInputWidget();
		this.marketingCookiesCheckbox = new OO.ui.CheckboxInputWidget();

		const necessaryCookiesField = new OO.ui.FieldLayout( this.necessaryCookiesCheckbox, {
			label: mw.message( 'cookieconsent-category-name-strictly-necessary' ).text(),
			align: 'inline',
			help: mw.message( 'cookieconsent-category-desc-strictly-necessary' ).text()
		});

		const preferenceCookiesField = new OO.ui.FieldLayout( this.preferenceCookiesCheckbox, {
			label: mw.message( 'cookieconsent-category-name-preference' ).text(),
			align: 'inline',
			help: mw.message( 'cookieconsent-category-desc-preference' ).text()
		});

		const statisticsCookiesField = new OO.ui.FieldLayout( this.statisticsCookiesCheckbox, {
			label: mw.message( 'cookieconsent-category-name-analytical' ).text(),
			align: 'inline',
			help: mw.message( 'cookieconsent-category-desc-analytical' ).text()
		});

		const marketingCookiesField = new OO.ui.FieldLayout( this.marketingCookiesCheckbox, {
			label: mw.message( 'cookieconsent-category-name-advertising' ).text(),
			align: 'inline',
			help: mw.message( 'cookieconsent-category-desc-advertising' ).text()
		});

		this.panel = new OO.ui.PanelLayout( {
			padded: true,
			expanded: false
		} );

		this.content = new OO.ui.FieldsetLayout()
			.addItems( [
				necessaryCookiesField,
				preferenceCookiesField,
				statisticsCookiesField,
				marketingCookiesField
			] );

		this.panel.$element.append( mw.message('cookieconsent-dialog-intro').parse() );
		this.panel.$element.append( '<br/>' );
		this.panel.$element.append( this.content.$element );

		this.$body.append( this.panel.$element );
	}

	// Set which consent preferences have (previously) been given
	ConsentDialog.prototype.setConsentPreferences = function ( consentPreferences) {
		this.necessaryCookiesCheckbox.setSelected( consentPreferences.necessary );
		this.preferenceCookiesCheckbox.setSelected( consentPreferences.preference );
		this.statisticsCookiesCheckbox.setSelected( consentPreferences.statistics );
		this.marketingCookiesCheckbox.setSelected( consentPreferences.marketing );
	}

	// Get the current consent preferences as visible in the dialog
	ConsentDialog.prototype.getConsentPreferences = function () {
		return {
			necessary: this.necessaryCookiesCheckbox.selected,
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

			updateConsentPreferences( this.getConsentPreferences() );
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

function updateConsentPreferences( consentPreferences ) {
	console.log(consentPreferences);

	mw.cookie.set( 'cookieconsent_consent_given' );
}

function currentConsentPreferences() {
	return {
		necessary: true,
		preference: true,
		statistics: true,
		marketing: false,
	}
}

function showConsentDialog() {
	openConsentDialogWithPreferences( currentConsentPreferences() );
}

$.when( $.ready ).then( function () {
	if ( mw.cookie.get( 'cookieconsent_consent_given' ) ) {
		// Consent has already been given
		return;
	}

	showConsentDialog();
} );
