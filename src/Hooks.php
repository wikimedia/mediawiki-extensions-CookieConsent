<?php

namespace MediaWiki\Extension\CookieConsent;

use Config;
use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Hook\SkinAddFooterLinksHook;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;
use Skin;

class Hooks implements BeforePageDisplayHook, ResourceLoaderGetConfigVarsHook, SkinAddFooterLinksHook {
	/**
	 * @inheritDoc
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		$modules = [ 'ext.CookieConsent' ];

		$out->addModules( $modules );
	}

	/**
	 * @inheritDoc
	 */
	public function onResourceLoaderGetConfigVars( array &$vars, $skin, Config $config ): void {
		$vars['wgCookieConsentCategories'] = $config->get( 'CookieConsentCategories' );
	}

	/**
	 * @inheritDoc
	 */
	public function onSkinAddFooterLinks( Skin $skin, string $key, array &$footerItems ) {
		if ( $key === 'places' ) {
			if ( class_exists( 'MediaWiki\\Html\\Html' ) ) {
				// MW 1.40+
				$htmlClass = \MediaWiki\Html\Html::class;
			} else {
				$htmlClass = \Html::class;
			}

			$footerItems['manage-cookie-preferences'] = $htmlClass::rawElement( 'a', [
				'href' => '#',
				'id' => 'manage-cookie-preferences'
			], $skin->msg( 'cookieconsent-manage-preferences' ) );
		}
	}
}
