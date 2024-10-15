<?php

namespace MediaWiki\Extension\CookieConsent;

use RequestContext;

class CookiePreferences {
	public const COOKIES_PREFERENCE = 'preference';
	public const COOKIES_STATISTICS = 'statistics';
	public const COOKIES_MARKETING = 'marketing';

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
	 * be one of the CookiePreferences::COOKIE_* constants, or a custom category name.
	 *
	 * @param string $category
	 * @return bool
	 */
	public function isConsentGranted( string $category ): bool {
		return $this->requestContext->getRequest()->getCookie( $this->getCookieName( $category ) ) === 'given';
	}

	private function getCookieName( string $category ): string {
		return "cookieconsent_consent_$category";
	}
}
