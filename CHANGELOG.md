CHANGELOG
=========

All notable changes to the CookieConsent project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [unreleased]

### Added

- Add `$wgCookieConsentGeolocationParameters` to configure additional query parameters to pass to the geolocation API.

### Changed

- Changed the default geolocation API endpoint to `pro.ip-api.com` to ensure that users do not accidentally use the API
  on a commercial website without a subscription. Using the free API (`ip-api.com`) is still supported for non-commercial websites.

## [2.1.0] - 2025-11-25

### Added

- Add region detection to allow administrators of a wiki to only enable the cookie warning for certain countries ([T406031](https://phabricator.wikimedia.org/T406031)).
- Add `$wgCookieConsentEnableGeolocation` to enable or disable region detection.
- Add `$wgCookieConsentEnabledRegions` to configure for which countries/regions the extension should be enabled.
- Add `$wgCookieConsentGeolocationEndpoint` and `$wgCookieConsentGeolocationField` to configure which API to use for geolocation.

## [2.0.0] - 2025-09-16

### Added

- Add bundlesize definition in favor of calling `enableOOUI`. (by [jrobson](https://www.mediawiki.org/wiki/User:Jdlrobson))

### Changed

- BREAKING: Renamed the `data-src` attribute to `data-mw-src` for `iframe` elements
  ([T404475](https://phabricator.wikimedia.org/T404475)).
- BREAKING: Renamed the `data-cookieconsent` attribute to `data-mw-cookieconsent` for `iframe` and `script` elements
  ([T404475](https://phabricator.wikimedia.org/T404475)).
- Localisation updates courtesy of [translatewiki.net](https://translatewiki.net).

### Fixed

- Fix use of the removed `Html` class alias for MediaWiki 1.44. (by [Universal Omega](https://www.mediawiki.org/wiki/User:Universal_Omega))

## [1.0.0] - 2025-08-26

### Changed

- Tweak size of the window for the initial dialog.
- Drop PHP version requirement from Composer.

## [0.2.0] - 2024-11-05

### Added

- Event (`cookie-consent-tags-processed`) that fires after tags have been processed (e.g. after all `iframe` and
  `script` tags that depend on consent have been re-enabled).

### Fixed

- Increase the lifespan of the cookie that remembers that the dialog has been dismissed from 1 week to 1 year.
- Fixed responsiveness issues on mobile.

## [0.1.0] - 2024-10-29

### Added

- Simple consent dialog for accepting all cookies immediately.
- Detailed consent dialog for managing consent preferences.
- Support for disabling `iframe` and `script` elements until cookies are accepted.

[unreleased]: https://github.com/wikimedia/mediawiki-extensions-CookieConsent/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/wikimedia/mediawiki-extensions-CookieConsent/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/wikimedia/mediawiki-extensions-CookieConsent/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/wikimedia/mediawiki-extensions-CookieConsent/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/wikimedia/mediawiki-extensions-CookieConsent/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/wikimedia/mediawiki-extensions-CookieConsent/releases/tag/v0.1.0
