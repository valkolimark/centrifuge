# schema-map.md — JSON-LD implementation map (Deliverable D9)

Build all schema through typed builder functions in `src/lib/schema/` — never hand-write JSON-LD in page files. Every builder pulls NAP from `data/nap.json`. Emit via a single `<JsonLd>` component in the route layout/page.

| Page type | Required types | Notes |
|---|---|---|
| Site-wide (root layout) | `Organization`, `WebSite` + `SearchAction` | Organization: name, url, logo, foundingDate 1939, sameAs cluster (TODO verify URLs, Cycle 4), contactPoint[] = main + emergency (24/7, contactType "emergency service") + chicago + houston |
| Home | `WebPage` | plus site-wide |
| Location pages ×3 | `LocalBusiness` (subtype `HomeAndConstructionBusiness`? NO — use generic `LocalBusiness`) | address from nap.json exactly; openingHoursSpecification Mo–Fr 06:00–18:00; telephone = that location's role phone; geo TODO(verify); areaServed US |
| Service pages | `Service` + `FAQPage` + `BreadcrumbList` | provider = Organization @id; serviceType; areaServed US; offers omitted (no public pricing) |
| OEM brand pages | `Service` + `FAQPage` + `BreadcrumbList` | serviceType "[Brand] centrifuge repair and rebuilding"; do NOT mark the page as the brand's Organization — we are not the OEM |
| Industry pages | `Service` + `BreadcrumbList` (+ `FAQPage` if FAQ block present) | |
| FAQ hub | `FAQPage` | only questions visible on the page |
| Blog posts / case studies | `Article` + `BreadcrumbList` | author = Organization; image required; dateModified real |
| How-it-works pages | `Article` (+ `VideoObject` when video embedded) | VideoObject: name, description, thumbnailUrl, uploadDate, embedUrl (SproutVideo) |
| Contact | `ContactPage` + all three LocalBusiness references | |
| Inventory hand-off page (if built) | `Product` + `Offer` per listing | availability, condition "UsedCondition"; only if listings render on our domain |
| Rebuild galleries | `ImageObject` within parent | descriptive caption incl. model number when known |
| Review schema | **NOT IN SCOPE until legitimate first-party reviews exist** (Cycle 7 backlog) | never synthesize |

Validation: CI step runs schema through a validator on every build; Cycle 4 exit requires 0 errors in Google Rich Results Test on one page of each type.
