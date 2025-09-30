<?php

namespace MediaWiki\Extension\CookieConsent\Geolocation;

use MediaWiki\Http\HttpRequestFactory;
use WANObjectCache;
use WebRequest;
use Wikimedia\IPUtils;

/**
 * Geolocates using the IP-address in the request.
 */
class HttpGeolocator implements Geolocator {
	private const CACHE_KEY = 'CookieConsentHttpGeolocator';

	/**
	 * @var string|null The API endpoint to use for geolocation
	 */
	private ?string $geolocationEndpoint;

	/**
	 * @var string|null The field to use for geolocation
	 */
	private ?string $geolocationField;

	/**
	 * @var HttpRequestFactory The request factory to use.
	 */
	private HttpRequestFactory $requestFactory;

	/**
	 * @var WANObjectCache The cache to use.
	 */
	private WANObjectCache $objectCache;

	/**
	 * @param string|null $geolocationEndpoint The API endpoint to use for geolocation
	 */
	public function __construct(
		?string $geolocationEndpoint,
		?string $geolocationField,
		HttpRequestFactory $requestFactory,
		WANObjectCache $objectCache,
	) {
		$this->geolocationEndpoint = $geolocationEndpoint;
		$this->geolocationField = $geolocationField;
		$this->requestFactory = $requestFactory;
		$this->objectCache = $objectCache;
	}

	/**
	 * @inheritDoc
	 */
	public function geolocate( WebRequest $request ): ?string {
		if ( !$this->geolocationEndpoint || !$this->geolocationField ) {
			return null;
		}

		try {
			$requestIP = $request->getIP();
		} catch ( \Exception ) {
			return null;
		}

		$cacheKey = $this->objectCache->makeGlobalKey( __CLASS__, self::CACHE_KEY . ':' . $requestIP );
		$cachedResult = $this->objectCache->get( $cacheKey );

		if ( is_string( $cachedResult ) ) {
			return $cachedResult;
		}

		if ( !IPUtils::isValid( $requestIP ) ) {
			return null;
		}

		if ( !IPUtils::isPublic( $requestIP ) ) {
			return null;
		}

		$url = str_replace( '{$IP}', $requestIP, $this->geolocationEndpoint );
		$response = $this->requestFactory->get( $url, [ 'timeout' => '1' ], __METHOD__ );

		if ( !$response ) {
			return null;
		}

		$data = json_decode( $response, true );

		if ( !$data || !isset( $data[$this->geolocationField] ) ) {
			return null;
		}

		$geolocation = $data[$this->geolocationField];

		if ( !is_string( $geolocation ) ) {
			return null;
		}

		// Cache location for two weeks
		$this->objectCache->set( $cacheKey, $geolocation, 14 * 86400 );

		return $geolocation;
	}
}
