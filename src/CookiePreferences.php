<?php

namespace MediaWiki\Extension\CookieConsent;

use RequestContext;

class CookiePreferences {
	public const COOKIES_PREFERENCE = 'preference';
	public const COOKIES_STATISTICS = 'statistics';
	public const COOKIES_MARKETING = 'marketing';

	// TODO: Make the categories configurable
	private const COOKIE_CATEGORIES = [
		self::COOKIES_PREFERENCE => [
			'cookie' => 'cookieconsent_consent_preference',
		],
		self::COOKIES_STATISTICS => [
			'cookie' => 'cookieconsent_consent_statistics',
		],
		self::COOKIES_MARKETING => [
			'cookie' => 'cookieconsent_consent_marketing',
		],
	];

	/**
	 * @var RequestContext
	 */
	private RequestContext $requestContext;

	/**
	 * @param RequestContext $requestContext
	 */
	public function __construct( RequestContext $requestContext ) {
		$this->requestContext = $requestContext;
	}

	/**
	 * Returns true if and only if consent was given for the given cookie category. The category should
	 * be one of the CookiePreferences::COOKIE_* constants.
	 *
	 * @param string $category
	 * @return bool
	 */
	public function isConsentGranted( string $category ): bool {
		$cookieName = self::COOKIE_CATEGORIES[$category]['cookie'] ?? null;

		if ( !$cookieName ) {
			return false;
		}

		return $this->requestContext->getRequest()->getCookie( $cookieName ) === 'given';
	}
}
