<?php

namespace MediaWiki\Extension\CookieConsent\Geolocation;

use MediaWiki\Http\HttpRequestFactory;
// FIXME: Change to Wikimedia\ObjectCache\WANObjectCache once we drop support for MediaWiki 1.39
use WANObjectCache;
// FIXME: Change to MediaWiki\Request\WebRequest once we drop support for MediaWiki 1.39
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
	 * @var array|null The query parameters to pass to the geolocation endpoint
	 */
	private ?array $geolocationParameters;

	/**
	 * @var string|null The field to use for geolocation
	 */
	private ?string $geolocationField;

	/**
	 * @var HttpRequestFactory The request factory to use.
	 */
	private HttpRequestFactory $requestFactory;

	/**
	 * @var mixed The cache to use.
	 */
	private mixed $objectCache;

	/**
	 * @param string|null $geolocationEndpoint The API endpoint to use for geolocation
	 */
	public function __construct(
		?string $geolocationEndpoint,
		?array $geolocationParameters,
		?string $geolocationField,
		HttpRequestFactory $requestFactory,
		WANObjectCache $objectCache,
	) {
		$this->geolocationEndpoint = $geolocationEndpoint;
		$this->geolocationParameters = $geolocationParameters;
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

		$cacheKey = $this->buildCacheKey( $requestIP );
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

		$requestParams = $this->geolocationParameters ?? [];
		$baseUrl = str_replace( '{$IP}', $requestIP, $this->geolocationEndpoint );

		$url = wfAppendQuery( $baseUrl, $requestParams );

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

	/**
	 * Builds a cache key for the specified IP-address.
	 *
	 * @param string $requestIP
	 * @return string
	 */
	private function buildCacheKey( string $requestIP ): string {
		$parts = [
			self::CACHE_KEY,
			$requestIP,
			$this->geolocationEndpoint,
			$this->geolocationField,
			json_encode( $this->geolocationParameters ?? [] )
		];

		$cacheKey = implode( ':', $parts );

		return $this->objectCache->makeGlobalKey( __CLASS__, $cacheKey );
	}
}
