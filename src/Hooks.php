<?php

namespace MediaWiki\Extension\CookieConsent;

use MediaWiki\Hook\BeforePageDisplayHook;

class Hooks implements BeforePageDisplayHook {
	/**
	 * @inheritDoc
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		$modules = [ 'ext.CookieConsent' ];

		$out->addModules( $modules );
		$out->enableOOUI();
	}
}
