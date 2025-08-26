CHANGELOG
=========

All notable changes to the CookieConsent project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [unreleased]

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

[unreleased]: https://github.com/wikimedia/mediawiki-extensions-CookieConsent/compare/1.0.0...HEAD
[1.0.0]: https://github.com/wikimedia/mediawiki-extensions-CookieConsent/compare/0.2.0...1.0.0
[0.2.0]: https://github.com/wikimedia/mediawiki-extensions-CookieConsent/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/wikimedia/mediawiki-extensions-CookieConsent/releases/tag/0.1.0
