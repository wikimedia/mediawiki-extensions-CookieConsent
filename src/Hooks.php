<?php

namespace MediaWiki\Extension\CookieConsent;

use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Hook\SkinAddFooterLinksHook;
use Skin;

class Hooks implements BeforePageDisplayHook, SkinAddFooterLinksHook {
	/**
	 * @inheritDoc
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		$modules = [ 'ext.CookieConsent' ];

		$out->addModules( $modules );
		$out->enableOOUI();
	}

	/**
	 * @inheritDoc
	 */
	public function onSkinAddFooterLinks( Skin $skin, string $key, array &$footerItems ) {
		if ( $key === 'places' ) {
			$footerItems['manage-cookie-preferences'] = \Html::rawElement( 'a', [
				'href' => '#',
				'id' => 'manage-cookie-preferences'
			], $skin->msg( 'cookieconsent-manage-preferences' ) );
		}
	}
}
