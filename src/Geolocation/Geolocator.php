<?php

namespace MediaWiki\Extension\CookieConsent\Geolocation;

use WebRequest;

interface Geolocator {
	/**
	 * Geolocate the specified WebRequest.
	 *
	 * @param WebRequest $request The request to geolocate.
	 * @return string|null The geolocation (often as a country code) if successful, null otherwise.
	 */
	public function geolocate( WebRequest $request ): ?string;
}
