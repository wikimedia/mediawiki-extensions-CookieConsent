<?php

/**
 * This file is loaded by MediaWiki\MediaWikiServices::getInstance() during the
 * bootstrapping of the dependency injection framework.
 *
 * @file
 */

// PHP unit does not understand code coverage for this file
// as the @covers annotation cannot cover a specific file
// This is fully tested in ServiceWiringTest.php
// @codeCoverageIgnoreStart

use MediaWiki\Extension\CookieConsent\CookieConsentServices;
use MediaWiki\Extension\CookieConsent\CookiePreferences;
use MediaWiki\Extension\CookieConsent\Decisions;
use MediaWiki\Extension\CookieConsent\Geolocation\Geolocator;
use MediaWiki\Extension\CookieConsent\Geolocation\HttpGeolocator;
use MediaWiki\MediaWikiServices;

return [
	"CookieConsent.CookiePreferences" => static function (): CookiePreferences {
		return new CookiePreferences( RequestContext::getMain() );
	},
	"CookieConsent.Decisions" => static function ( MediaWikiServices $services ): Decisions {
		return new Decisions(
			$services->getMainConfig(),
			CookieConsentServices::getGeolocator( $services )
		);
	},
	"CookieConsent.Geolocation.Geolocator" => static function ( MediaWikiServices $services ): Geolocator {
		$mainConfig = $services->getMainConfig();

		return new HttpGeolocator(
			$mainConfig->get( 'CookieConsentGeolocationEndpoint' ),
			$mainConfig->get( 'CookieConsentGeolocationField' ),
			$services->getHttpRequestFactory(),
			$services->getMainWANObjectCache(),
		);
	}
];

// @codeCoverageIgnoreEnd
