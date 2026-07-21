---
'@roadiehq/catalog-backend-module-okta': patch
---

fix: preserve custom Okta group profile attributes after the `@okta/okta-sdk-nodejs` v8 upgrade

The generated `GroupProfile` model is not marked extensible, unlike `UserProfile`. As a result, custom Okta group profile attributes (e.g. fields added via a group profile schema extension, such as `manager`) were silently dropped during deserialization, making them unavailable to `customAttributesToAnnotationAllowlist` and to custom group transformers.

`GroupProfile` is now marked extensible at module load, matching the existing behavior of `UserProfile`, so custom group attributes are preserved.
