// Synced Nov 21 to the Creative-gated r7c static landings (CW23, CW25, CW30),
// including the CW30 R-3 AFTER image (no lazy load; preload stays on BEFORE).
// Visible copy, alt text, headings, CTAs, phone and form wording match the gated HTML.
export type EmailLandingSection = { h2: string; paras: string[]; items: string[] }
export type EmailLandingPicture = {
  src: string
  webpSrcSet: string
  sizes: string
  width: number
  height: number
  alt: string
  priority?: boolean
  eager?: boolean
}
export type EmailLandingContent = {
  key: string; slug: string; title: string; lede: string; heroCall: string; formButton: string
  sections: EmailLandingSection[]; bodyCall: string
  heroPhotos: EmailLandingPicture[]
  tiles: EmailLandingPicture[]
  gallery: EmailLandingPicture[]
  form: { heading: string; fields: string[]; button: string; under: string }; bandText: string; sticky: string
}
export const emailLandingPages: Record<string, EmailLandingContent> = {
  "centrifuge-balancing": {
    "key": "2026-11-23-cw",
    "slug": "centrifuge-balancing",
    "title": "Centrifuge Vibrating? Ask About Balancing",
    "lede": "Centrifuge World balances, repairs and rebuilds centrifuges. Call 1 (800) 208-6075.",
    "heroCall": "Call Centrifuge World: 1 (800) 208-6075",
    "formButton": "Send Us the Details",
    "sections": [
      {
        "h2": "What You Might Be Noticing",
        "paras": [
          "You may notice more shaking than before, a change in sound, or a machine that runs rougher than it did.",
          "You do not need a diagnosis before you call. Tell us what you are seeing and hearing."
        ],
        "items": []
      },
      {
        "h2": "What Centrifuge World Does",
        "paras": [],
        "items": [
          "Balancing",
          "Repair and rebuild",
          "Centrifuge parts",
          "Field service",
          "24/7 service"
        ]
      },
      {
        "h2": "Centrifuge Types and Brands",
        "paras": [
          "Decanter, basket, disc-stack, pusher and peeler centrifuges.",
          "More than 45 brands, including Alfa Laval, Andritz, Bird, Broadbent, Centrisys, Flottweg, GEA Westfalia, Hutchison Hayes, Sharples, Tolhurst, Aldec and Ametek."
        ],
        "items": []
      },
      {
        "h2": "Industries We Serve",
        "paras": [
          "Oil and gas, food and beverage, chemical, pharmaceutical, wastewater, mining, dairy and rendering."
        ],
        "items": []
      },
      {
        "h2": "Who Calls Us",
        "paras": [],
        "items": [
          "**Maintenance and reliability managers:** one call for balancing, repair, rebuild, parts and field service.",
          "**Plant managers:** plan when the machine comes down.",
          "**Purchasing managers:** one supplier across more than 45 centrifuge brands.",
          "**Engineering managers:** one shop for decanter, basket, disc-stack, pusher and peeler designs."
        ]
      },
      {
        "h2": "Have This Ready When You Call",
        "paras": [],
        "items": [
          "Centrifuge brand and type",
          "Model and serial number from the nameplate",
          "What it is doing, and when it started",
          "Where the machine is (city and state)"
        ]
      }
    ],
    "bodyCall": "Call Centrifuge World: 1 (800) 208-6075",
    "heroPhotos": [
      {
        "src": "/images/email-landing/2026-11-23-cw/lp-hero-r7-1240.jpg",
        "webpSrcSet": "/images/email-landing/2026-11-23-cw/lp-hero-r7-640.webp 640w, /images/email-landing/2026-11-23-cw/lp-hero-r7-1240.webp 1240w",
        "sizes": "(max-width:600px) calc(100vw - 32px), (max-width:1023px) 560px, 520px",
        "width": 1240, "height": 771, "priority": true,
        "alt": "Decanter centrifuge rotating assembly on a shop stand"
      }
    ],
    "tiles": [],
    "gallery": [
      {
        "src": "/images/email-landing/2026-11-23-cw/lp-g0-r7-880.jpg",
        "webpSrcSet": "/images/email-landing/2026-11-23-cw/lp-g0-r7-480.webp 480w, /images/email-landing/2026-11-23-cw/lp-g0-r7-880.webp 880w",
        "sizes": "(max-width:900px) calc(100vw - 32px), 440px",
        "width": 880, "height": 862,
        "alt": "Decanter centrifuge with its casing opened on a blue base"
      }
    ],
    "form": {
      "heading": "Tell Us What You Have",
      "fields": [
        "Name*",
        "Company*",
        "Work email*",
        "Phone*",
        "Machine make and type",
        "What is it doing?*"
      ],
      "button": "Send the Details",
      "under": "For anything urgent, call 1 (800) 208-6075."
    },
    "bandText": "Call now, or send the details.",
    "sticky": "Call Centrifuge World: 1 (800) 208-6075"
  },
  "centrifuge-247-thanksgiving": {
    "key": "2026-11-25-cw",
    "slug": "centrifuge-247-thanksgiving",
    "title": "Centrifuge Down Over Thanksgiving? 24/7 Service",
    "lede": "Centrifuge World offers 24/7 service. Call 1 (800) 208-6075 if a unit goes down.",
    "heroCall": "Call Centrifuge World: 1 (800) 208-6075",
    "formButton": "Send Us the Details",
    "sections": [
      {
        "h2": "One Number for the Holiday Shift",
        "paras": [
          "If a centrifuge goes down while your plant runs through Thanksgiving, call 1 (800) 208-6075. Centrifuge World offers 24/7 service.",
          "For anything urgent, call. The form below is for requests that can wait."
        ],
        "items": []
      },
      {
        "h2": "What to Tell Us When You Call",
        "paras": [],
        "items": [
          "Centrifuge brand and type",
          "What happened, and when",
          "Where the machine is (site, city and state)",
          "The best number to call you back"
        ]
      },
      {
        "h2": "What Centrifuge World Covers",
        "paras": [],
        "items": [
          "24/7 service",
          "Repair and rebuild",
          "Balancing",
          "Centrifuge parts",
          "Field service"
        ]
      },
      {
        "h2": "Centrifuge Types and Brands",
        "paras": [
          "Decanter, basket, disc-stack, pusher and peeler centrifuges, from more than 45 brands, including Alfa Laval, Andritz, Bird, Flottweg, GEA Westfalia, Sharples and Tolhurst."
        ],
        "items": []
      },
      {
        "h2": "Who Should Have This Number",
        "paras": [],
        "items": [
          "**On-call maintenance techs and supervisors** working the holiday",
          "**Plant and operations managers** running through the week",
          "**Purchasing managers** sourcing a part over the holiday week",
          "**Engineering managers** on call for process issues"
        ]
      }
    ],
    "bodyCall": "Call Centrifuge World: 1 (800) 208-6075",
    "heroPhotos": [
      {
        "src": "/images/email-landing/2026-11-25-cw/lp-hero-r7-1240.jpg",
        "webpSrcSet": "/images/email-landing/2026-11-25-cw/lp-hero-r7-640.webp 640w, /images/email-landing/2026-11-25-cw/lp-hero-r7-1240.webp 1240w",
        "sizes": "(max-width:600px) calc(100vw - 32px), (max-width:1023px) 560px, 520px",
        "width": 1240, "height": 930, "priority": true,
        "alt": "Close view of a decanter rotating assembly with an orange cover at the drive end, sitting in a frame"
      }
    ],
    "tiles": [
      {
        "src": "/images/email-landing/2026-11-25-cw/lp-t0-322.jpg",
        "webpSrcSet": "/images/email-landing/2026-11-25-cw/lp-t0-322.webp 322w",
        "sizes": "161px",
        "width": 322, "height": 230,
        "alt": "Three shop photos: a decanter rotating assembly on a green steel stand, a rotating assembly strapped to a wooden pallet, and an opened decanter on a blue frame with its cover raised"
      },
      {
        "src": "/images/email-landing/2026-11-25-cw/lp-t1-322.jpg",
        "webpSrcSet": "/images/email-landing/2026-11-25-cw/lp-t1-322.webp 322w",
        "sizes": "161px",
        "width": 322, "height": 230,
        "alt": ""
      },
      {
        "src": "/images/email-landing/2026-11-25-cw/lp-t2-r7e-322.jpg",
        "webpSrcSet": "/images/email-landing/2026-11-25-cw/lp-t2-r7e-322.webp 322w",
        "sizes": "161px",
        "width": 322, "height": 230,
        "alt": ""
      }
    ],
    "gallery": [],
    "form": {
      "heading": "Tell Us What You Have",
      "fields": [
        "Name*",
        "Company*",
        "Work email*",
        "Phone*",
        "Machine make and type",
        "What is it doing?*"
      ],
      "button": "Send the Details",
      "under": "For anything urgent, call 1 (800) 208-6075."
    },
    "bandText": "Call now, or send the details.",
    "sticky": "Call Centrifuge World: 1 (800) 208-6075"
  },
  "decanter-bowl-rebuild-before-after": {
    "key": "2026-11-30-cw",
    "slug": "decanter-bowl-rebuild-before-after",
    "title": "Decanter Bowls Before and After Rebuild",
    "lede": "Decanter bowl photos, before rebuild and after rebuild. Centrifuge World: 1 (800) 208-6075.",
    "heroCall": "Call Centrifuge World: 1 (800) 208-6075",
    "formButton": "Send Us the Details",
    "sections": [
      {
        "h2": "What Centrifuge World Does for Decanters",
        "paras": [],
        "items": [
          "Repair and rebuild",
          "Balancing and field service",
          "Decanter parts, plus 24/7 service"
        ]
      },
      {
        "h2": "Brands",
        "paras": [
          "More than 45 centrifuge brands, including Alfa Laval, Andritz, Bird, Broadbent, Centrisys, Flottweg, GEA Westfalia, Hutchison Hayes, Sharples, Tolhurst, Aldec and Ametek."
        ],
        "items": []
      },
      {
        "h2": "Industries",
        "paras": [
          "Oil and gas, food and beverage, chemical, pharmaceutical, wastewater, mining, dairy and rendering."
        ],
        "items": []
      },
      {
        "h2": "Who Calls Us",
        "paras": [],
        "items": [
          "**Maintenance managers:** repair or rebuild, plus parts and field service, from one shop.",
          "**Engineering managers:** one shop for decanter, basket, disc-stack, pusher and peeler designs.",
          "**Plant managers:** an independent shop with in-house fabrication behind the rebuild, part of a group operating since 1939.",
          "**Purchasing managers:** one supplier across more than 45 centrifuge brands."
        ]
      },
      {
        "h2": "Have This Ready When You Call",
        "paras": [],
        "items": [
          "Decanter brand and model",
          "Serial number from the nameplate",
          "What it is doing",
          "Where it is (city and state)"
        ]
      }
    ],
    "bodyCall": "Call Centrifuge World: 1 (800) 208-6075",
    "heroPhotos": [
      {
        "src": "/images/email-landing/2026-11-30-cw/lp-pair0-r7-900.jpg",
        "webpSrcSet": "/images/email-landing/2026-11-30-cw/lp-pair0-r7-480.webp 480w, /images/email-landing/2026-11-30-cw/lp-pair0-r7-900.webp 900w",
        "sizes": "(max-width:600px) 46vw, 290px",
        "width": 900, "height": 425, "priority": true,
        "alt": "Decanter bowl with a worn, discolored surface lying in an open wooden crate"
      },
      {
        "src": "/images/email-landing/2026-11-30-cw/lp-pair1-r7d-900.jpg",
        "webpSrcSet": "/images/email-landing/2026-11-30-cw/lp-pair1-r7d-480.webp 480w, /images/email-landing/2026-11-30-cw/lp-pair1-r7d-900.webp 900w",
        "sizes": "(max-width:600px) 46vw, 290px",
        "width": 900, "height": 700, "eager": true,
        "alt": "Decanter bowl with bright machined metal surfaces and an orange drive pulley lying in a wooden crate"
      }
    ],
    "tiles": [],
    "gallery": [
      {
        "src": "/images/email-landing/2026-11-30-cw/lp-g0-r7-880.jpg",
        "webpSrcSet": "/images/email-landing/2026-11-30-cw/lp-g0-r7-480.webp 480w, /images/email-landing/2026-11-30-cw/lp-g0-r7-880.webp 880w",
        "sizes": "(max-width:900px) calc(100vw - 32px), 440px",
        "width": 880, "height": 1173,
        "alt": "Helical decanter scroll conveyor on a shop pallet"
      }
    ],
    "form": {
      "heading": "Tell Us What You Have",
      "fields": [
        "Name*",
        "Company*",
        "Work email*",
        "Phone*",
        "Machine make and type",
        "What is it doing?*"
      ],
      "button": "Send the Details",
      "under": "For anything urgent, call 1 (800) 208-6075."
    },
    "bandText": "Call now, or send the details.",
    "sticky": "Call Centrifuge World: 1 (800) 208-6075"
  }
}
