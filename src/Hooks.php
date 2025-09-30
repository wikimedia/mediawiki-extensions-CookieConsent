<?php

namespace MediaWiki\Extension\CookieConsent;

use Config;
use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Hook\SkinAddFooterLinksHook;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;
use Skin;

class Hooks implements BeforePageDisplayHook, ResourceLoaderGetConfigVarsHook, SkinAddFooterLinksHook {
	/**
	 * @var Decisions
	 */
	private Decisions $decisions;

	/**
	 * @param Decisions $decisions
	 */
	public function __construct( Decisions $decisions ) {
		$this->decisions = $decisions;
	}

	/**
	 * @inheritDoc
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		if ( $this->decisions->shouldEnable( $out->getContext() ) ) {
			$out->addModules( [ 'ext.CookieConsent' ] );
		}
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
		if ( $key === 'places' && $this->decisions->shouldEnable( $skin->getContext() ) ) {
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
