function showConsentDialog(data) {
	function ConsentDialog( config ) {
		ConsentDialog.super.call( this, config );
	}

	// The consent dialog is a process dialog
	// @see https://www.mediawiki.org/wiki/OOUI/Windows/Process_Dialogs
	OO.inheritClass( ConsentDialog, OO.ui.ProcessDialog );

	ConsentDialog.static.name = 'ext.CookieConsent.consentDialog';
	ConsentDialog.static.title = 'Cookie consent preferences'; // TODO: Localisation
	ConsentDialog.static.actions = [
		{
			action: 'save-preferences',
			label: 'Save preferences', // TODO: Localisation
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
			label: 'Strictly necessary cookies', // TODO: Localisation
			align: 'inline',
			help: 'These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site.' // TODO: Localisation
		});

		const preferenceCookiesField = new OO.ui.FieldLayout( this.preferenceCookiesCheckbox, {
			label: 'Preference cookies', // TODO: Localisation
			align: 'inline',
			help: 'Also known as “functionality cookies,” these cookies allows the website to remember choices you have made in the past, like what language you prefer, what region you would like weather reports for, or what your user name and password are so you can automatically log in.' // TODO: Localisation
		});

		const statisticsCookiesField = new OO.ui.FieldLayout( this.statisticsCookiesCheckbox, {
			label: 'Analytical cookies', // TODO: Localisation
			align: 'inline',
			help: 'Also known as “performance cookies,” these cookies collect information about how you use a website, like which pages you visited and which links you clicked on. None of this information can be used to identify you. It is all aggregated and, therefore, anonymized. Their sole purpose is to improve website functions.' // TODO: Localisation
		});

		const marketingCookiesField = new OO.ui.FieldLayout( this.marketingCookiesCheckbox, {
			label: 'Advertising cookies', // TODO: Localisation
			align: 'inline',
			help: 'These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad. These cookies can share that information with other organizations or advertisers.' // TODO: Localisation
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

		this.panel.$element.append( '<p>We use cookies to personalise content, to provide certain features and to analyse traffic.</p><br/>' );
		this.panel.$element.append( this.content.$element );

		this.$body.append( this.panel.$element );
	}

	// The setup process takes data inserted during the initialisation of the window, and updates the presentation
	// accordingly.
	ConsentDialog.prototype.getSetupProcess = function ( data ) {
		return ConsentDialog.super.prototype.getSetupProcess.call( this, data )
			.next( function () {
				this.necessaryCookiesCheckbox.setSelected( data.consent.necessary );
				this.preferenceCookiesCheckbox.setSelected( data.consent.preference );
				this.statisticsCookiesCheckbox.setSelected( data.consent.statistics );
				this.marketingCookiesCheckbox.setSelected( data.consent.marketing );
			}, this );
	}

	ConsentDialog.prototype.getActionProcess = function ( action ) {
		return new OO.ui.Process( () => console.log( action ) );
	}

	ConsentDialog.prototype.getBodyHeight = function () {
		return this.panel.$element.outerHeight( true );
	}

	const windowManager = new OO.ui.WindowManager();
	$( document.body ).append( windowManager.$element );

	const consentDialog = new ConsentDialog( {
		size: 'large'
	} );

	windowManager.addWindows( [ consentDialog ] );
	windowManager.openWindow( consentDialog, { consent: consentData } );
}

function getConsentData() {
	return {
		necessary: true,
		preference: true,
		statistics: true,
		marketing: false,
	}
}

const consentData = getConsentData();

showConsentDialog(consentData);
