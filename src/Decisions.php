<?php

namespace MediaWiki\Extension\CookieConsent;

use Config;
use IContextSource;
use MediaWiki\Extension\CookieConsent\Geolocation\Geolocator;

class Decisions {
	private Config $config;
	private Geolocator $geolocator;

	public function __construct(
		Config $config,
		Geolocator $geolocator,
	) {
		$this->config = $config;
		$this->geolocator = $geolocator;
	}

	/**
	 * Whether to enable the extension for the given context.
	 *
	 * @param IContextSource $context
	 * @return bool True if the extension should be enabled, false otherwise.
	 */
	public function shouldEnable( IContextSource $context ): bool {
		return ( !$this->config->get( 'CookieConsentEnableGeolocation' ) || $this->inConfiguredRegion( $context ) );
	}

	/**
	 * Whether the user is in an enabled region.
	 *
	 * @param IContextSource $context
	 * @return bool
	 */
	private function inConfiguredRegion( IContextSource $context ): bool {
		$geolocation = $this->geolocator->geolocate( $context->getRequest() );

		if ( $geolocation === null ) {
			return true;
		}

		return in_array( $geolocation, $this->config->get( 'CookieConsentEnabledRegions' ), true );
	}
}
