// "Buy & Sell Used Centrifuges" commercial-intent pages (high-ROI SEO/AEO/GEO).
// Rewritten from the legacy /sell-your-centrifuge-2/ "We Buy & Sell Centrifuges"
// concept. No fabricated prices, stats, warranties, or inventory counts — buying
// framing uses ranges and inspection-first language.
const S3 = 'https://centrifuge-im.s3.amazonaws.com/wp-content/uploads'

export interface SalesLink { label: string; href: string }
export interface SalesImage { src: string; alt: string }
export interface SalesSection { heading: string; body: string[] }
export interface SalesFaq { question: string; answer: string }

export interface UsedCentrifugePage {
  slug: string
  h1: string
  seoTitle: string
  seoDescription: string
  answerQuestion: string
  answerBox: string
  intro: string
  hero: SalesImage
  sections: SalesSection[]
  brands: SalesLink[]
  applications: SalesLink[]
  gallery: SalesImage[]
  faqs: SalesFaq[]
}

const INVENTORY = 'https://inventory.centrifuge.com'

export const USED_HUB = {
  slug: '',
  h1: 'Used Industrial Centrifuges for Sale — We Buy & Sell',
  seoTitle: 'Used Centrifuges for Sale | Buy & Sell | Centrifuge World',
  seoDescription:
    'Buy reconditioned used industrial centrifuges or sell your machine to Centrifuge World. Decanters, baskets, disc-stack separators, pushers & peelers — 45+ brands.',
  answerQuestion: 'Where can I buy or sell used industrial centrifuges?',
  answerBox:
    'Centrifuge World buys and sells used industrial centrifuges. Since 1939 we have reconditioned and traded decanter, basket, disc-stack, pusher, and peeler machines across 45+ OEM brands. Buy an inspected, rebuilt machine or sell yours — nationwide, with a 24/7 line for urgent needs.',
  intro:
    'Whether you need to add capacity fast or move a machine you no longer run, Centrifuge World is one source for used industrial centrifuges. We recondition and test the machines we sell, and we buy centrifuges of nearly any type, brand, and condition.',
  hero: {
    src: `${S3}/2020/01/07192807/sanborn-centrifuge-repair-hero-1.jpg.webp`,
    alt: 'Reconditioned industrial centrifuge available from Centrifuge World',
  },
  types: [
    { label: 'Used Decanter Centrifuges', href: '/used-centrifuges/decanter-centrifuges/' },
    { label: 'Used Basket Centrifuges', href: '/used-centrifuges/basket-centrifuges/' },
    { label: 'Used Disc-Stack Separators', href: '/used-centrifuges/disc-stack-separators/' },
    { label: 'Used Pusher & Peeler Centrifuges', href: '/used-centrifuges/pusher-peeler-centrifuges/' },
  ] as SalesLink[],
  buySteps: [
    { title: 'Tell us your process', description: 'Type, throughput, feed, and separation goals.' },
    { title: 'We match a machine', description: 'From reconditioned stock or our buy network.' },
    { title: 'Inspected & rebuilt', description: 'Serviced, balanced, and test-run before it ships.' },
    { title: 'Installed & running', description: 'Field support to commission it at your plant.' },
  ],
  sellSteps: [
    { title: 'Send details & photos', description: 'Machine type, brand, model, and condition.' },
    { title: 'We review', description: 'Our team assesses the machine and its value.' },
    { title: 'Get an offer', description: 'A fair offer based on type, condition, and demand.' },
    { title: 'We handle logistics', description: 'Coordinated pickup and removal.' },
  ],
  faqs: [
    { question: 'Do you buy used centrifuges?', answer: 'Yes. Centrifuge World buys used industrial centrifuges of nearly any type, brand, and condition — running, idle, or for parts. Send details and photos through our Sell Your Centrifuge page for an offer.' },
    { question: 'Are the used centrifuges you sell reconditioned?', answer: 'The machines we sell are inspected and, where needed, rebuilt, balanced, and test-run before they ship, so you receive equipment that is ready to install and run.' },
    { question: 'What does a used centrifuge cost?', answer: 'It depends on type, size, brand, and condition. As framing, a reconditioned used machine typically costs a fraction of a comparable new unit; we quote after understanding your process.' },
    { question: 'Do you buy and sell all brands?', answer: 'Yes — 45+ OEM brands, including Sharples, Alfa Laval, GEA Westfalia, Andritz, Bird, Flottweg, Centrisys, Tolhurst, and more.' },
  ] as SalesFaq[],
  inventoryUrl: INVENTORY,
}

export const USED_CATEGORIES: UsedCentrifugePage[] = [
  {
    slug: 'decanter-centrifuges',
    h1: 'Used Decanter Centrifuges for Sale',
    seoTitle: 'Used Decanter Centrifuges for Sale | Centrifuge World',
    seoDescription:
      'Buy reconditioned used decanter centrifuges or sell yours to Centrifuge World. Solid-bowl decanters from Sharples, Alfa Laval, GEA Westfalia, Andritz, Bird, and more.',
    answerQuestion: 'Where can I buy a used decanter centrifuge?',
    answerBox:
      'Centrifuge World buys and sells used decanter (solid-bowl) centrifuges. We recondition — rebuilding bowls, scrolls, gearboxes, and bearings, then balancing and test-running — so a used decanter arrives ready to separate. We also buy decanters of most brands and conditions across the US.',
    intro:
      'Decanter centrifuges handle continuous solid–liquid separation across wastewater, oil & gas, rendering, and chemical processing. Buying a reconditioned decanter is a fast, cost-effective way to add capacity, and we buy machines you no longer run.',
    hero: { src: `${S3}/2021/12/07192721/Custom-decanter.jpg.webp`, alt: 'Reconditioned decanter centrifuge for sale' },
    sections: [
      { heading: 'Why buy a reconditioned decanter', body: ['A reconditioned decanter typically costs a fraction of a new machine and ships faster. Before it leaves our shop, the bowl, scroll conveyor, gearbox, and bearings are inspected and restored as needed, the rotating assembly is dynamically balanced, and the machine is test-run — so you install a known-good unit, not an unknown risk.'] },
      { heading: 'Brands and sizes we handle', body: ['We buy and sell decanters across the major manufacturers and a wide range of bowl sizes and G-forces. If you know the throughput, feed solids, and separation target, we can match a machine to your duty; if you are not sure, our team helps you spec it.'] },
    ],
    brands: [
      { label: 'Sharples', href: '/brands/sharples/' },
      { label: 'Alfa Laval', href: '/brands/alfa-laval/' },
      { label: 'GEA Westfalia', href: '/brands/westfalia/' },
      { label: 'Andritz', href: '/brands/andritz/' },
      { label: 'Bird', href: '/brands/bird/' },
      { label: 'Flottweg', href: '/brands/flottweg/' },
    ],
    applications: [
      { label: 'Wastewater Treatment', href: '/industries/wastewater-treatment/' },
      { label: 'Oil & Gas', href: '/industries/oil-gas/' },
      { label: 'Rendering', href: '/industries/rendering/' },
    ],
    gallery: [
      { src: `${S3}/2020/02/07193227/large-decanter.jpg`, alt: 'Large decanter centrifuge bowl and rotor' },
      { src: `${S3}/2021/12/07192723/BIRD-HB-2500-RA-Rebuild-scaled.jpg`, alt: 'Bird HB-2500 decanter rebuild' },
    ],
    faqs: [
      { question: 'Do you sell reconditioned decanter centrifuges?', answer: 'Yes — inspected, rebuilt where needed, balanced, and test-run before shipment so the machine is ready to install.' },
      { question: 'Will you buy my used decanter centrifuge?', answer: 'Yes. Send the brand, model, and condition with photos and we will review it for purchase, running or not.' },
      { question: 'Which decanter brands do you carry?', answer: 'Sharples, Alfa Laval, GEA Westfalia, Andritz, Bird, Flottweg, and others across a range of sizes.' },
      { question: 'How do I choose the right decanter size?', answer: 'Share your throughput, feed solids, and separation goal; we match a reconditioned machine to your duty or help you spec one.' },
    ],
  },
  {
    slug: 'basket-centrifuges',
    h1: 'Used Basket Centrifuges for Sale',
    seoTitle: 'Used Basket Centrifuges for Sale | Centrifuge World',
    seoDescription:
      'Buy reconditioned used basket centrifuges or sell yours to Centrifuge World. Peeler and manual-discharge basket machines from Tolhurst, Ametek, Sanborn, and more.',
    answerQuestion: 'Where can I buy a used basket centrifuge?',
    answerBox:
      'Centrifuge World buys and sells used basket centrifuges, including peeler and manual-discharge machines. We recondition baskets, spindles, bearings, and drives, then balance and test-run the machine so a used basket centrifuge is ready for dependable batch separation. We buy machines of most brands and conditions.',
    intro:
      'Basket centrifuges are workhorses for batch filtration and dewatering in chemical, pharmaceutical, and food processing. A reconditioned basket machine is an economical way to add batch capacity, and we buy machines you are ready to retire.',
    hero: { src: `${S3}/2020/01/07192609/Ametek-Tolhurst-24-Centerslung_42925001_ac.jpg.webp`, alt: 'Ametek/Tolhurst 24" center-slung basket centrifuge for sale' },
    sections: [
      { heading: 'Peeler and manual-discharge machines', body: ['We handle both peeler (automatic-discharge) and manual-discharge basket centrifuges. Each machine we sell is inspected and restored where needed — basket, spindle, bearings, plow, and drive — then balanced and test-run so it runs smooth and discharges cleanly.'] },
      { heading: 'Brands and configurations', body: ['We buy and sell top-discharge, bottom-discharge, and center-slung basket machines across the common manufacturers. Tell us your batch size, cake handling, and duty and we will match a machine, or help you spec the right one.'] },
    ],
    brands: [
      { label: 'Tolhurst', href: '/brands/tolhurst/' },
      { label: 'Ametek', href: '/brands/ametek/' },
      { label: 'Sanborn', href: '/brands/sanborn/' },
      { label: 'Broadbent', href: '/brands/broadbent/' },
      { label: 'Western States', href: '/brands/western-states/' },
      { label: 'Heinkel', href: '/brands/heinkel/' },
    ],
    applications: [
      { label: 'Chemical', href: '/industries/chemical/' },
      { label: 'Pharmaceutical', href: '/industries/pharmaceutical/' },
      { label: 'Food & Beverage', href: '/industries/food-beverage/' },
    ],
    gallery: [
      { src: `${S3}/2020/01/07192807/sanborn-centrifuge-repair-hero-1.jpg.webp`, alt: 'Sanborn basket centrifuge' },
      { src: `${S3}/2019/02/07193216/IMG_1548.jpeg`, alt: 'Basket centrifuge in the shop' },
    ],
    faqs: [
      { question: 'Do you sell used peeler centrifuges?', answer: 'Yes — peeler (automatic-discharge) and manual-discharge basket machines, reconditioned and test-run before shipment.' },
      { question: 'Will you buy my basket centrifuge?', answer: 'Yes. Send brand, model, size, and condition with photos and we will review it for purchase.' },
      { question: 'Which basket brands do you handle?', answer: 'Tolhurst, Ametek, Sanborn, Broadbent, Western States, Heinkel, and others.' },
      { question: 'Top-discharge or bottom-discharge?', answer: 'We handle top-, bottom-, and center-slung configurations; tell us your cake handling and we will match the right machine.' },
    ],
  },
  {
    slug: 'disc-stack-separators',
    h1: 'Used Disc-Stack Separators for Sale',
    seoTitle: 'Used Disc-Stack Separators for Sale | Centrifuge World',
    seoDescription:
      'Buy reconditioned used disc-stack centrifuge separators or sell yours to Centrifuge World. High-speed separators from GEA Westfalia, Alfa Laval, and more.',
    answerQuestion: 'Where can I buy a used disc-stack separator?',
    answerBox:
      'Centrifuge World buys and sells used disc-stack (disc separator) centrifuges. We recondition bowls, disc stacks, spindles, seals, and drives, then high-speed balance and test-run the machine so a used separator is ready for clean liquid–liquid or liquid–solid separation. We buy most brands and conditions.',
    intro:
      'Disc-stack separators run at high speed for fine clarification and separation in dairy, food & beverage, pharmaceutical, and chemical processing. A reconditioned separator is a cost-effective route to that performance, and we buy machines you no longer run.',
    hero: { src: `${S3}/2020/02/07193253/westfalia-separator-Centrifuge.jpg.webp`, alt: 'GEA Westfalia disc-stack separator centrifuge for sale' },
    sections: [
      { heading: 'High-speed machines, reconditioned', body: ['Disc-stack separators depend on a clean, precisely balanced bowl. Machines we sell are inspected and restored where needed — bowl, disc stack, spindle, seals, and drive — then balanced for high-speed operation and test-run, so you install a separator that runs smooth and separates cleanly.'] },
      { heading: 'Clarifiers, purifiers, and concentrators', body: ['We buy and sell disc-stack clarifiers, purifiers, and self-cleaning (solids-ejecting) separators. Share your product, flow rate, and separation target and we will match a machine or help you spec one.'] },
    ],
    brands: [
      { label: 'GEA Westfalia', href: '/brands/westfalia/' },
      { label: 'Alfa Laval', href: '/brands/alfa-laval/' },
      { label: 'Centrisys', href: '/brands/centrisys/' },
      { label: 'Aldec (Alfa Laval)', href: '/brands/aldec/' },
    ],
    applications: [
      { label: 'Dairy', href: '/industries/dairy/' },
      { label: 'Food & Beverage', href: '/industries/food-beverage/' },
      { label: 'Pharmaceutical', href: '/industries/pharmaceutical/' },
    ],
    gallery: [
      { src: `${S3}/2020/01/07193349/image-46.png.webp`, alt: 'Disc-stack separator centrifuge' },
      { src: `${S3}/2019/10/07193552/centrifuge-repair-1024x771-2.jpg`, alt: 'Separator centrifuge in the shop' },
    ],
    faqs: [
      { question: 'Do you sell used disc-stack separators?', answer: 'Yes — reconditioned, high-speed balanced, and test-run before shipment.' },
      { question: 'Will you buy my separator?', answer: 'Yes. Send brand, model, and condition with photos and we will review it for purchase.' },
      { question: 'Which separator brands do you handle?', answer: 'GEA Westfalia, Alfa Laval, Centrisys, and others.' },
      { question: 'Clarifier or purifier?', answer: 'We handle clarifiers, purifiers, and self-cleaning separators; tell us your separation goal and we will match the right machine.' },
    ],
  },
  {
    slug: 'pusher-peeler-centrifuges',
    h1: 'Used Pusher & Peeler Centrifuges for Sale',
    seoTitle: 'Used Pusher & Peeler Centrifuges for Sale | Centrifuge World',
    seoDescription:
      'Buy reconditioned used pusher and peeler centrifuges or sell yours to Centrifuge World. Continuous and batch filtration machines from Siebtechnik, Krauss-Maffei, and more.',
    answerQuestion: 'Where can I buy a used pusher or peeler centrifuge?',
    answerBox:
      'Centrifuge World buys and sells used pusher and peeler centrifuges. We recondition pusher mechanisms, peeler plows, baskets, screens, hydraulics, and drives, then balance and test-run the machine so continuous or batch filtration returns to reliable throughput. We buy most brands and conditions.',
    intro:
      'Pusher and peeler centrifuges handle continuous and batch filtration of free-draining solids in chemical, mining, and manufacturing processes. A reconditioned machine is an economical way to add filtration capacity, and we buy machines you are ready to move.',
    hero: { src: `${S3}/2020/01/07192808/Siebtechnik-centrifuge-repair-hero-1-1980x1485.jpg.webp`, alt: 'Siebtechnik pusher/peeler centrifuge for sale' },
    sections: [
      { heading: 'Pusher and peeler machines, reconditioned', body: ['Pusher and peeler centrifuges have moving discharge mechanisms that wear. Machines we sell are inspected and restored where needed — pusher plates and hydraulics, peeler plows, baskets, and screens — then balanced and test-run so they run smooth and discharge reliably.'] },
      { heading: 'Single- and multi-stage machines', body: ['We buy and sell single- and multi-stage pushers and peeler machines across the common manufacturers. Tell us your feed, cake handling, and throughput and we will match a machine or help you spec one.'] },
    ],
    brands: [
      { label: 'Siebtechnik', href: '/brands/siebtechnik/' },
      { label: 'Krauss-Maffei', href: '/brands/krauss-maffei/' },
      { label: 'Tolhurst', href: '/brands/tolhurst/' },
      { label: 'Escher Wyss', href: '/brands/escher-wyss/' },
    ],
    applications: [
      { label: 'Chemical', href: '/industries/chemical/' },
      { label: 'Mining & Manufacturing', href: '/industries/mining-manufacturing/' },
      { label: 'Pharmaceutical', href: '/industries/pharmaceutical/' },
    ],
    gallery: [
      { src: `${S3}/2021/12/07192739/IMG_8060-1.jpg`, alt: 'Centrifuge repair on the shop floor' },
      { src: `${S3}/2022/01/07192642/parts-refitting.jpg`, alt: 'Centrifuge parts refitting' },
    ],
    faqs: [
      { question: 'Do you sell used pusher and peeler centrifuges?', answer: 'Yes — reconditioned, balanced, and test-run before shipment.' },
      { question: 'Will you buy my pusher or peeler machine?', answer: 'Yes. Send brand, model, and condition with photos and we will review it for purchase.' },
      { question: 'What is the difference between a pusher and a peeler?', answer: 'A pusher discharges cake continuously with a reciprocating plate; a peeler discharges batch cake with a plow. We handle both.' },
      { question: 'Which brands do you handle?', answer: 'Siebtechnik, Krauss-Maffei, Tolhurst, Escher Wyss, and others.' },
    ],
  },
]

export function getUsedCategory(slug: string): UsedCentrifugePage | undefined {
  return USED_CATEGORIES.find((c) => c.slug === slug)
}
