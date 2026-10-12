# Rodnya / hotdog

## Implemented first release

- TypeScript UI and serverless Worker backend; one small D1 text database and R2 for photos/private pedigree files. No queues or permanent processes.
- Russian, Kazakh and Uzbek routes, with language switches that preserve the page.
- Friendly homepage, indexable species hubs, filtered catalog, pet profiles and server-rendered parentage text.
- Three-step registration with a browser-local text/photo draft and a local IndexedDB document draft that survives OAuth redirects; optional parents and pedigree document.
- Private dashboard, favorites, meeting proposals, recipient confirmation, cancellation and SQL-protected resource reservations.
- Explicit demo accounts/fictional examples; simulated counterpart replies work only in demo mode.
- VK ID OAuth code + PKCE adapter (VK/Mail/OK accounts), and Telegram OIDC code + PKCE with RS256 signature/issuer/audience/expiry verification. Real app credentials and end-to-end testing are required.
- Read-only public API, OpenAPI, llms.txt, localized canonical/hreflang, metadata, robots and sitemap.

## Data and trust

Stable animal IDs identify records. Parent names/links are owner-reported claims, not verified parentage. Unknown branches remain unknown. Uploaded documents are not automatically verified. No COI or breeding-success claims are invented.

Public API serialization excludes ownership and private-document IDs. Documents and unpublished uploads require owner authorization. File signatures and an 8 MiB limit are checked. Browser photo processing re-encodes to WebP, removes original metadata and reduces dimensions. Public photos are served only after a consented profile links them.

Meeting confirmation reserves all animal/owner intervals in a single D1 batch. Triggers reject overlapping reservations and reservations for unconfirmed meetings. Cancellation removes reservations. Cached availability cannot confirm a booking. Meeting purpose means an appointment/discussion, not veterinary clearance or permission to breed.

## Authentication

Session cookies are HMAC-signed, HttpOnly, Secure and SameSite=Lax. A deployment secret is required; no public fallback secret exists. Browser writes require same-origin requests. `DEMO_MODE=true` is required for demo account creation. Provider + provider-user-ID identifies real accounts; email is not used to silently merge identities.

VK ID requires app ID and registered `/api/auth/vk/callback`. Telegram requires BotFather client ID/secret, `/api/auth/telegram/callback` and its default RS256 signing algorithm. Phone login stays unavailable until an actual OTP provider is configured. WhatsApp is a possible OTP channel, not generic OAuth; no fake OTP verification exists.

## SEO and agents

Core facts, parentage and links are server-rendered HTML. Each locale has a self-canonical and reciprocal hreflang. Arbitrary filtered pages and private onboarding/account pages are noindex. Species hubs are available for indexed discovery. Demo deployments are deliberately noindex/robots-disallowed, and dummy animals are omitted from sitemaps.

```
GET /api/v1/public/animals?q=&species=&city=&locale=
GET /api/v1/public/animals/{id}
GET /api/v1/public/animals/{id}/lineage
GET /api/v1/public/species
GET /openapi.json
GET /llms.txt
```

The low-traffic API returns up to 30 records from a bounded scan of 200 recent stored records. General pagination is not implemented yet; sitemap animal lookup is bounded to 60. Add pagination if inventory grows. OpenAPI and llms.txt aid access; they do not guarantee AI/search ranking or automatic tool integration.

## Before public launch

1. Verify full-page/media/API access on real Russian mobile/fixed networks and in Kazakhstan/Uzbekistan. Cloudflare's April 2026 support guidance documents Russian ISP throttling. A .ru domain does not bypass this.
2. Confirm operator, permitted species, document-review policy and data-location requirements. D1 location hints are not country guarantees. Choose a regional serverless provider first if Cloudflare is unsuitable.
3. Configure the .ru domain, Cloudflare account, D1/R2, a real session secret and OAuth apps. Remove fictional examples and disable demo mode for the actual launch.
4. Have native speakers review localization and replace the short draft privacy/rules pages with operator-specific terms. Add reporting/deletion, specialist species eligibility and abuse controls before unrestricted registration.
5. Submit sitemaps to Yandex/Google/Bing and measure crawl health, mobile performance and conversion. There is no measured SEO advantage yet.

## Later features

Record editing and moderation, ownership transfer, registry/issuer confirmation, richer messaging, deep ancestry/COI analysis, additional species, native mobile apps and payments. First release prioritizes easy registration, useful records and actual meeting coordination.

## Research sources

- Good Dog: https://www.gooddog.com/ and https://www.gooddog.com/standards-and-screening
- MorphMarket: https://support.morphmarket.com/article/262-pro-search
- Breed Archive: https://breedarchive.com/blog/view/4/the-joy-of-completing-a-dogs-pedigree
- Google multilingual guidance: https://developers.google.com/search/docs/specialty/international/localized-versions
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
- VK SDK: https://github.com/VKCOM/vkid-web-sdk
- Telegram: https://core.telegram.org/bots/telegram-login
- Cloudflare regional access: https://developers.cloudflare.com/support/troubleshooting/general-troubleshooting/service-disruption/

## Verification

`pnpm typecheck`, `pnpm test`, `pnpm build`. Tests cover signed-session tampering, CSRF, uploads/private files, ownership/redaction, date validation, real D1 transactional conflict behavior in Miniflare, cancellation authorization, timezone conversion and server-rendered home facts/metadata in three languages.

Tests do not cover actual OAuth-provider flows or interactive browser/visual QA. The Sites browser-control skill was unavailable in this environment, so no browser preview server was used. Review the private demo on desktop/mobile before public launch.
