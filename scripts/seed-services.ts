// Seeds the 14 service pages (task 2.3) into the Payload `services` collection with
// authored, plain-technical copy. Idempotent: upserts by slug and publishes.
// No fabricated stats/turnaround/testimonials — quantitative claims stay out or are
// framed as ranges. Run: pnpm tsx scripts/seed-services.ts
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
function loadEnv() {
  const file = resolve(root, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!(m[1] in process.env)) process.env[m[1]] = v
  }
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > max - 20 ? cut.slice(0, lastSpace) : cut).replace(/[.,;\s]+$/, '')
}

const cap = (item: string, detail?: string) => ({ item, detail })
const step = (title: string, description?: string) => ({ title, description })
const qa = (question: string, answer: string) => ({ question, answer })
const link = (label: string, href: string) => ({ label, href })

// Common brand + industry links reused across pages (satisfies internal-link rule).
const B = {
  sharples: link('Sharples', '/brands/sharples/'),
  alfaLaval: link('Alfa Laval', '/brands/alfa-laval/'),
  westfalia: link('GEA Westfalia', '/brands/westfalia/'),
  andritz: link('Andritz', '/brands/andritz/'),
  bird: link('Bird', '/brands/bird/'),
  flottweg: link('Flottweg', '/brands/flottweg/'),
  centrisys: link('Centrisys', '/brands/centrisys/'),
  tolhurst: link('Tolhurst', '/brands/tolhurst/'),
  broadbent: link('Broadbent', '/brands/broadbent/'),
}
const I = {
  rendering: link('Rendering', '/industries/rendering/'),
  wastewater: link('Wastewater Treatment', '/industries/wastewater-treatment/'),
  chemical: link('Chemical', '/industries/chemical/'),
  foodBev: link('Food & Beverage', '/industries/food-beverage/'),
  oilGas: link('Oil & Gas', '/industries/oil-gas/'),
  pharma: link('Pharmaceutical', '/industries/pharmaceutical/'),
  mining: link('Mining & Manufacturing', '/industries/mining-manufacturing/'),
}

type FormTypeValue = 'request_quote' | 'emergency_service' | 'free_inspection' | 'contact' | 'send_photos'

interface Svc {
  slug: string
  title: string
  formType?: FormTypeValue
  emergencyVariant?: boolean
  answerBoxQuestion: string
  answerBox: string
  intro: string
  capabilitiesHeading?: string
  capabilities: { item: string; detail?: string }[]
  processHeading?: string
  process?: { title: string; description?: string }[]
  faqs: { question: string; answer: string }[]
  relatedServices: { label: string; href: string }[]
  relatedBrands: { label: string; href: string }[]
  relatedIndustries: { label: string; href: string }[]
  seoDescription: string
}

const REBUILD_PROCESS = [
  step('Inspect', 'Full teardown inspection and failure analysis to find the root cause.'),
  step('Quote', 'A clear, inspection-first scope of work and price — no surprises.'),
  step('Rebuild', 'Repair or rebuild worn components to restore OEM performance.'),
  step('Balance', 'Dynamic hard-bearing balancing of the rotating assembly.'),
  step('Test', 'Run-test to verify vibration and performance before shipment.'),
  step('Return', 'Documented, crated, and returned ready to install.'),
]

const SERVICES: Svc[] = [
  {
    slug: 'centrifuge-repair',
    title: 'Centrifuge Repair',
    answerBoxQuestion: 'Who repairs industrial centrifuges?',
    answerBox:
      'Centrifuge World repairs and rebuilds industrial centrifuges of every major type and brand. Since 1939, from three US facilities, we handle decanter, basket, disc-stack, pusher, and peeler machines with in-shop repair, field service, balancing, and parts fabrication, backed by a 24/7 emergency line.',
    intro:
      'Whatever the machine and whatever the failure, our shop restores it to reliable service. We diagnose the real cause of a problem, then repair or rebuild to OEM specification and test-run before it ships back.',
    capabilities: [
      cap('All major centrifuge types', 'Decanter, basket, disc-stack, pusher, and peeler centrifuges.'),
      cap('45+ OEM brands', 'We hold experience across the brands you run — not a single manufacturer.'),
      cap('Root-cause diagnosis', 'Inspection-first so you fix the problem, not just the symptom.'),
      cap('In-house machining & fabrication', 'Parts are made and refit in our own shops when originals are unavailable.'),
      cap('Balancing & test-run', 'Every rotating assembly is balanced and verified before return.'),
      cap('24/7 emergency response', 'On-call technicians and expedited turnaround when you are down.'),
    ],
    process: REBUILD_PROCESS,
    faqs: [
      qa('What types of centrifuges do you repair?', 'Decanter, basket (peeler and manual), disc-stack separators, and pusher and peeler centrifuges, across 45+ OEM brands.'),
      qa('Do you work on brands other than the original manufacturer?', 'Yes. We are an independent repair and rebuild specialist and service equipment from many manufacturers.'),
      qa('Can you help if my machine is down right now?', 'Yes — our 24/7 emergency line reaches technicians who mobilize field service and expedite shop work.'),
    ],
    relatedServices: [link('Centrifuge Rebuilds', '/services/centrifuge-rebuilds/'), link('Decanter Repair', '/services/decanter-centrifuge-repair/'), link('Inspections', '/services/centrifuge-inspections/')],
    relatedBrands: [B.sharples, B.alfaLaval, B.westfalia],
    relatedIndustries: [I.rendering, I.wastewater],
    seoDescription: 'Independent industrial centrifuge repair for decanter, basket, disc-stack, pusher, and peeler machines across 45+ OEM brands. Inspection-first, balanced, test-run. 24/7 emergency.',
  },
  {
    slug: 'centrifuge-rebuilds',
    title: 'Centrifuge Rebuilds',
    answerBoxQuestion: 'What does a centrifuge rebuild include?',
    answerBox:
      'A Centrifuge World rebuild is a full restoration: teardown inspection, replacement or refurbishment of worn bowls, scrolls, bearings, and seals, hard-surfacing where needed, dynamic balancing, and a documented test-run. The result performs to OEM specification, typically at a fraction of the cost of a new machine.',
    intro:
      'When wear has accumulated across a machine, a rebuild is the economical path back to reliable production. We restore the components that matter and verify the result on the test stand.',
    capabilities: [
      cap('Bowl & rotor restoration', 'Repair or replace worn bowls, rotors, and shells to spec.'),
      cap('Scroll / conveyor rebuild', 'Rebuild and re-tile scroll conveyors that have lost profile.'),
      cap('Bearing & seal replacement', 'New bearings, seals, and wear components throughout.'),
      cap('Hard-surfacing', 'Carbide tiles and hard-facing on high-wear surfaces.'),
      cap('Dynamic balancing', 'Hard-bearing balancing of the full rotating assembly.'),
      cap('Documented test-run', 'Vibration and performance verified and recorded before return.'),
    ],
    process: REBUILD_PROCESS,
    faqs: [
      qa('How much can a rebuild save versus a new machine?', 'A quality rebuild typically costs a fraction of replacement. Exact savings depend on machine size and condition; we quote after inspection.'),
      qa('Will a rebuilt machine perform like new?', 'Rebuilds are restored to OEM performance specifications and test-run to verify vibration and throughput before shipment.'),
      qa('What gets replaced in a rebuild?', 'Whatever inspection shows is worn — commonly bearings, seals, scroll tiles, and bowl or shell surfaces — plus balancing and testing.'),
    ],
    relatedServices: [link('Centrifuge Repair', '/services/centrifuge-repair/'), link('Balancing & Testing', '/services/balancing-testing/'), link('Parts & Fabrication', '/services/parts-fabrication/')],
    relatedBrands: [B.sharples, B.bird, B.andritz],
    relatedIndustries: [I.rendering, I.oilGas],
    seoDescription: 'Full industrial centrifuge rebuilds: bowl and scroll restoration, bearings, seals, hard-surfacing, dynamic balancing, and documented test-run — restored to OEM performance.',
  },
  {
    slug: 'decanter-centrifuge-repair',
    title: 'Decanter Centrifuge Repair',
    answerBoxQuestion: 'Who repairs and rebuilds decanter centrifuges?',
    answerBox:
      'Centrifuge World repairs and rebuilds decanter (solid-bowl) centrifuges from every major OEM. We service bowls, scroll conveyors, main and gearbox bearings, and drive systems, then hard-bearing balance and test-run the assembly so your decanter returns to reliable separation performance.',
    intro:
      'Decanters take continuous wear on the scroll and bowl. We rebuild the wear path, restore the gearbox and bearings, and balance the assembly so the machine runs smooth and separates cleanly.',
    capabilities: [
      cap('Bowl & shell repair', 'Restore or replace worn bowl surfaces and feed zones.'),
      cap('Scroll conveyor rebuild', 'Re-tile and true scroll flights that have worn down.'),
      cap('Gearbox service', 'Repair or rebuild the decanter gearbox and back-drive.'),
      cap('Bearing replacement', 'Main and pillow-block bearings replaced to spec.'),
      cap('Dynamic balancing', 'Hard-bearing balancing of bowl and scroll.'),
    ],
    process: REBUILD_PROCESS,
    faqs: [
      qa('What are common decanter failure signs?', 'Vibration, bearing noise or heat, reduced separation quality, scroll wear, leaks, and gearbox issues or amperage spikes.'),
      qa('Do you rebuild the scroll conveyor?', 'Yes — we re-tile and true worn scroll flights, or replace the scroll when wear is beyond repair.'),
      qa('Can you service the decanter gearbox too?', 'Yes. Gearbox repair is part of a decanter rebuild, or available on its own.'),
    ],
    relatedServices: [link('Gearbox Repair', '/services/gearbox-repair/'), link('Centrifuge Rebuilds', '/services/centrifuge-rebuilds/'), link('Balancing & Testing', '/services/balancing-testing/')],
    relatedBrands: [B.sharples, B.alfaLaval, B.flottweg],
    relatedIndustries: [I.wastewater, I.oilGas],
    seoDescription: 'Decanter centrifuge repair and rebuilds — bowls, scroll conveyors, gearboxes, and bearings restored, hard-bearing balanced and test-run. All major OEM brands.',
  },
  {
    slug: 'basket-centrifuge-repair',
    title: 'Basket Centrifuge Repair',
    answerBoxQuestion: 'Do you repair basket centrifuges?',
    answerBox:
      'Yes. Centrifuge World repairs and rebuilds basket centrifuges, including peeler and manual-discharge machines. We service baskets, spindles, bearings, plows, and drives, then balance and test-run the assembly so your batch machine returns to dependable, vibration-free operation.',
    intro:
      'Basket machines depend on a true, balanced basket and a sound spindle. We restore the wear path and rotating assembly and verify the result before it ships.',
    capabilities: [
      cap('Basket repair & replacement', 'Restore or replace baskets and liners.'),
      cap('Spindle & bearing service', 'Rebuild spindles and replace bearings.'),
      cap('Plow / peeler mechanism', 'Service discharge plows and peeler assemblies.'),
      cap('Drive & control repair', 'Restore drives and discharge controls.'),
      cap('Balance & test-run', 'Balanced and verified before return.'),
    ],
    process: REBUILD_PROCESS,
    faqs: [
      qa('Do you handle both peeler and manual basket machines?', 'Yes — peeler (automatic-discharge) and manual-discharge basket centrifuges.'),
      qa('Can a worn basket be repaired?', 'Often yes; when wear or damage is beyond repair we replace the basket and restore the surrounding assembly.'),
      qa('Why is my basket machine vibrating?', 'Common causes include basket imbalance, spindle or bearing wear, or uneven cake buildup — inspection pinpoints which.'),
    ],
    relatedServices: [link('Pusher & Peeler Repair', '/services/pusher-peeler-centrifuge-repair/'), link('Balancing & Testing', '/services/balancing-testing/'), link('Centrifuge Inspections', '/services/centrifuge-inspections/')],
    relatedBrands: [B.tolhurst, B.broadbent],
    relatedIndustries: [I.chemical, I.pharma],
    seoDescription: 'Basket centrifuge repair and rebuilds — peeler and manual-discharge machines. Baskets, spindles, bearings, and plows restored, balanced, and test-run.',
  },
  {
    slug: 'disc-stack-centrifuge-repair',
    title: 'Disc Stack Centrifuge Repair',
    answerBoxQuestion: 'Do you repair disc stack centrifuges?',
    answerBox:
      'Yes. Centrifuge World repairs and rebuilds disc-stack (disc separator) centrifuges. We service bowls, disc stacks, distributors, spindles, and drives, replace bearings and seals, then balance and test-run the machine so your separator returns to clean, high-speed separation.',
    intro:
      'Disc-stack separators run at high speed and depend on a clean, balanced bowl. We restore the bowl and disc stack, rebuild the spindle and drive, and verify the result.',
    capabilities: [
      cap('Bowl & disc-stack service', 'Clean, inspect, and restore bowls and disc stacks.'),
      cap('Spindle rebuild', 'Restore high-speed spindles and bearings.'),
      cap('Seal & gasket replacement', 'New seals and gaskets throughout the bowl.'),
      cap('Drive & motor service', 'Restore drives, clutches, and motors.'),
      cap('Balance & test-run', 'High-speed balance and verification.'),
    ],
    process: REBUILD_PROCESS,
    faqs: [
      qa('What separators do you service?', 'Disc-stack separators and clarifiers used for liquid–liquid and liquid–solid separation across many industries.'),
      qa('Do you re-balance high-speed bowls?', 'Yes — disc-stack bowls are balanced for high-speed operation and test-run before return.'),
      qa('Can you source disc-stack parts?', 'Yes; we fabricate or source wear parts and seals as part of the rebuild.'),
    ],
    relatedServices: [link('Centrifuge Rebuilds', '/services/centrifuge-rebuilds/'), link('Parts & Fabrication', '/services/parts-fabrication/'), link('Balancing & Testing', '/services/balancing-testing/')],
    relatedBrands: [B.alfaLaval, B.westfalia],
    relatedIndustries: [I.foodBev, I.pharma],
    seoDescription: 'Disc-stack centrifuge and separator repair — bowls, disc stacks, spindles, seals, and drives restored, high-speed balanced and test-run.',
  },
  {
    slug: 'pusher-peeler-centrifuge-repair',
    title: 'Pusher & Peeler Centrifuge Repair',
    answerBoxQuestion: 'Do you repair pusher and peeler centrifuges?',
    answerBox:
      'Yes. Centrifuge World repairs and rebuilds pusher and peeler centrifuges. We service baskets, pusher mechanisms, peeler plows, hydraulics, bearings, and drives, then balance and test-run the machine so continuous and batch filtration returns to reliable throughput.',
    intro:
      'Pusher and peeler machines have moving discharge mechanisms that wear. We rebuild the pusher and peeler assemblies along with the rotating parts and verify smooth operation.',
    capabilities: [
      cap('Pusher mechanism rebuild', 'Restore pusher plates, rods, and hydraulics.'),
      cap('Peeler plow service', 'Rebuild peeler plows and discharge systems.'),
      cap('Basket & screen repair', 'Restore baskets and filtration screens.'),
      cap('Bearing & drive service', 'Replace bearings and restore drives.'),
      cap('Balance & test-run', 'Balanced and verified before return.'),
    ],
    process: REBUILD_PROCESS,
    faqs: [
      qa('What is the difference between a pusher and a peeler?', 'A pusher discharges cake continuously with a reciprocating plate; a peeler discharges batch cake with a plow. We service both.'),
      qa('Do you rebuild the hydraulics?', 'Yes — pusher hydraulics and controls are part of the rebuild scope.'),
      qa('Can you repair worn filtration screens?', 'Yes; screens and baskets are restored or replaced as needed.'),
    ],
    relatedServices: [link('Basket Centrifuge Repair', '/services/basket-centrifuge-repair/'), link('Parts & Fabrication', '/services/parts-fabrication/'), link('Field Service', '/services/field-service/')],
    relatedBrands: [B.tolhurst, B.broadbent],
    relatedIndustries: [I.chemical, I.mining],
    seoDescription: 'Pusher and peeler centrifuge repair — pusher mechanisms, peeler plows, baskets, screens, hydraulics, and drives restored, balanced, and test-run.',
  },
  {
    slug: 'emergency-centrifuge-service',
    title: 'Emergency Centrifuge Service',
    formType: 'emergency_service',
    emergencyVariant: true,
    answerBoxQuestion: 'Do you offer emergency centrifuge repair?',
    answerBox:
      'Yes. Centrifuge World offers 24/7 emergency centrifuge repair. When your machine is down, our on-call line reaches technicians who mobilize field service and expedite shop turnaround to get you back in production. Call 832-338-4990 any time, day or night.',
    intro:
      'A stopped centrifuge stops production. Our emergency team responds around the clock with field diagnosis, expedited repair, and rapid parts to shorten downtime.',
    capabilities: [
      cap('24/7 on-call line', 'Reach a real technician any hour at 832-338-4990.'),
      cap('Rapid field diagnosis', 'On-site assessment to get you running or plan the fastest fix.'),
      cap('Expedited shop turnaround', 'Emergency jobs move to the front of the shop queue.'),
      cap('Rush parts & fabrication', 'In-house machining to keep a repair moving.'),
    ],
    process: [
      step('Call', 'Reach the 24/7 line and describe what happened.'),
      step('Diagnose', 'Phone triage, then field service if needed.'),
      step('Stabilize or pull', 'Repair on-site where possible, or expedite to the shop.'),
      step('Return to service', 'Get the machine back in production as fast as safely possible.'),
    ],
    faqs: [
      qa('How fast can you respond?', 'Our line is staffed 24/7 and we mobilize field service and expedited shop work immediately; response time depends on location and machine.'),
      qa('What should I have ready when I call?', 'Machine type, brand and model if known, and a short description of what happened — noises, vibration, leaks, or alarms.'),
      qa('Can you get emergency parts made?', 'Yes — our in-house machine shops fabricate rush wear parts to keep a repair moving.'),
    ],
    relatedServices: [link('Field Service', '/services/field-service/'), link('Centrifuge Repair', '/services/centrifuge-repair/'), link('Preventive Maintenance', '/services/preventive-maintenance/')],
    relatedBrands: [B.sharples, B.alfaLaval],
    relatedIndustries: [I.oilGas, I.wastewater],
    seoDescription: '24/7 emergency centrifuge repair. On-call technicians, rapid field diagnosis, expedited shop turnaround, and rush parts. Call 832-338-4990 any time.',
  },
  {
    slug: 'field-service',
    title: 'Field Service',
    formType: 'free_inspection',
    answerBoxQuestion: 'Do you offer on-site centrifuge field service?',
    answerBox:
      'Yes. Centrifuge World provides nationwide on-site field service: inspection, repair, vibration analysis, installation support, and commissioning. Our field technicians diagnose problems where your machine sits and either resolve them on-site or plan the fastest path to a shop repair.',
    intro:
      'Some work is best done where the machine runs. Our field technicians bring shop expertise on-site for diagnosis, repair, alignment, and startup support.',
    capabilities: [
      cap('On-site inspection & repair', 'Diagnose and repair without pulling the machine when possible.'),
      cap('Vibration analysis', 'Measure and interpret vibration to find the cause.'),
      cap('Installation & commissioning', 'Set, align, and start up machines correctly.'),
      cap('Nationwide coverage', 'Technicians travel to your plant across the US.'),
    ],
    faqs: [
      qa('Where do you provide field service?', 'Nationwide across the US. Travel and scheduling are arranged when you contact us.'),
      qa('Can you do vibration analysis on-site?', 'Yes — on-site vibration measurement and analysis is part of our field service.'),
      qa('Do you support new installations?', 'Yes; we provide installation, alignment, and commissioning support.'),
    ],
    relatedServices: [link('Emergency Centrifuge Service', '/services/emergency-centrifuge-service/'), link('Preventive Maintenance', '/services/preventive-maintenance/'), link('Balancing & Testing', '/services/balancing-testing/')],
    relatedBrands: [B.andritz, B.flottweg],
    relatedIndustries: [I.mining, I.rendering],
    seoDescription: 'Nationwide on-site centrifuge field service — inspection, repair, vibration analysis, installation, and commissioning by experienced technicians.',
  },
  {
    slug: 'preventive-maintenance',
    title: 'Preventive Maintenance',
    formType: 'free_inspection',
    answerBoxQuestion: 'Do you offer centrifuge preventive maintenance programs?',
    answerBox:
      'Yes. Centrifuge World builds preventive maintenance programs that catch wear before it becomes downtime. Scheduled inspections, vibration monitoring, wear tracking, and planned rebuilds keep your centrifuges running and let you budget maintenance instead of reacting to failures.',
    intro:
      'Planned maintenance is cheaper than emergency repair. We help you schedule inspections and rebuilds around your production, not around breakdowns.',
    capabilities: [
      cap('Scheduled inspections', 'Regular checks tied to your run hours.'),
      cap('Vibration monitoring', 'Trend vibration to predict wear.'),
      cap('Wear tracking', 'Track scroll, bearing, and seal wear over time.'),
      cap('Planned rebuilds', 'Schedule rebuilds during planned downtime.'),
    ],
    faqs: [
      qa('Why run a preventive maintenance program?', 'It reduces unplanned downtime, extends machine life, and lets you budget maintenance instead of reacting to failures.'),
      qa('How often should a centrifuge be inspected?', 'It depends on duty and material; we set an interval based on your run hours and history.'),
      qa('Can you schedule rebuilds around our shutdowns?', 'Yes — planned rebuilds are timed to your production schedule.'),
    ],
    relatedServices: [link('Centrifuge Inspections', '/services/centrifuge-inspections/'), link('Field Service', '/services/field-service/'), link('Centrifuge Rebuilds', '/services/centrifuge-rebuilds/')],
    relatedBrands: [B.sharples, B.westfalia],
    relatedIndustries: [I.foodBev, I.wastewater],
    seoDescription: 'Centrifuge preventive maintenance programs — scheduled inspections, vibration monitoring, wear tracking, and planned rebuilds to prevent downtime.',
  },
  {
    slug: 'centrifuge-inspections',
    title: 'Centrifuge Inspections',
    formType: 'free_inspection',
    answerBoxQuestion: 'Can you inspect a centrifuge before quoting repairs?',
    answerBox:
      'Yes. Centrifuge World works inspection-first. Before any quote, we tear down and inspect the machine to find the real cause of a problem, then scope the repair or rebuild accurately. You get a clear picture of what is worn and what it will take to fix it.',
    intro:
      'A good repair starts with an honest inspection. We look at the whole machine, not just the obvious symptom, so the quote reflects the actual work.',
    capabilities: [
      cap('Teardown inspection', 'Disassemble and examine bowls, scrolls, bearings, and drives.'),
      cap('Failure analysis', 'Identify the root cause, not just the symptom.'),
      cap('Wear measurement', 'Measure and document component wear.'),
      cap('Accurate scope & quote', 'A repair plan based on what we actually find.'),
    ],
    faqs: [
      qa('Is the inspection free?', 'Inspection terms depend on the machine and whether it comes to the shop or is inspected on-site — ask when you contact us. TODO(verify: free vs. paid inspection terms with client).'),
      qa('What does an inspection cover?', 'A full teardown and examination of bowls, scrolls, bearings, seals, gearbox, and drive, with wear documented.'),
      qa('Do I have to commit to a repair to get an inspection?', 'No — the inspection gives you the information to decide.'),
    ],
    relatedServices: [link('Centrifuge Repair', '/services/centrifuge-repair/'), link('Preventive Maintenance', '/services/preventive-maintenance/'), link('Centrifuge Rebuilds', '/services/centrifuge-rebuilds/')],
    relatedBrands: [B.bird, B.centrisys],
    relatedIndustries: [I.wastewater, I.chemical],
    seoDescription: 'Inspection-first centrifuge service. Teardown inspection, failure analysis, and wear measurement before an accurate repair or rebuild quote.',
  },
  {
    slug: 'balancing-testing',
    title: 'Balancing & Testing',
    answerBoxQuestion: 'Do you balance and test-run centrifuge rotating assemblies?',
    answerBox:
      'Yes. Centrifuge World performs dynamic hard-bearing balancing and full test-runs on centrifuge rotating assemblies. Every bowl, scroll, and basket we rebuild is balanced and verified for vibration and performance before it ships, so the machine runs smooth from the moment it is reinstalled.',
    intro:
      'Balance is what keeps a high-speed machine smooth and long-lived. We balance the rotating assembly on a hard-bearing stand and test-run it to confirm the result.',
    capabilities: [
      cap('Dynamic hard-bearing balancing', 'Precision balancing of bowls, scrolls, and baskets.'),
      cap('Vibration verification', 'Measure and document vibration to spec.'),
      cap('Full test-run', 'Run the assembly to confirm performance before shipment.'),
      cap('Balance-only service', 'Send us an assembly for balancing on its own.'),
    ],
    faqs: [
      qa('Why does balancing matter?', 'An unbalanced rotating assembly causes vibration that damages bearings and seals and shortens machine life; balancing prevents it.'),
      qa('Can I send just a bowl or scroll for balancing?', 'Yes — balance-only service is available for individual rotating assemblies.'),
      qa('Do you document the results?', 'Yes; vibration and balance results are recorded and provided with the machine.'),
    ],
    relatedServices: [link('Centrifuge Rebuilds', '/services/centrifuge-rebuilds/'), link('Decanter Repair', '/services/decanter-centrifuge-repair/'), link('Parts & Fabrication', '/services/parts-fabrication/')],
    relatedBrands: [B.sharples, B.andritz],
    relatedIndustries: [I.oilGas, I.mining],
    seoDescription: 'Dynamic hard-bearing centrifuge balancing and test-run. Bowls, scrolls, and baskets balanced and vibration-verified before shipment.',
  },
  {
    slug: 'parts-fabrication',
    title: 'Parts & Fabrication',
    answerBoxQuestion: 'Can you fabricate custom centrifuge parts?',
    answerBox:
      'Yes. Centrifuge World fabricates custom centrifuge parts in-house, including hard-surfacing and carbide tiles, scroll flights, wear components, and gearbox parts. When original parts are unavailable or lead times are long, our machine shops make what your machine needs to get back to work.',
    intro:
      'Long OEM lead times should not keep your machine down. We machine and fabricate wear parts and hard-surfacing in our own shops, matched to your equipment.',
    capabilities: [
      cap('Hard-surfacing & carbide tiles', 'Wear protection on scrolls and high-wear surfaces.'),
      cap('Scroll flights & wear parts', 'Fabricate replacement flights and components.'),
      cap('Gearbox parts', 'Machine gearbox components and back-drive parts.'),
      cap('Settling tanks & custom work', 'Fabrication for related process equipment.'),
      cap('Reverse engineering', 'Make parts when originals are unavailable.'),
    ],
    faqs: [
      qa('Can you make a part that is no longer available?', 'Often yes — we reverse-engineer and fabricate wear parts when OEM parts are discontinued or backordered.'),
      qa('Do you apply carbide tiles and hard-facing?', 'Yes; hard-surfacing and carbide tiling are core to protecting scroll and wear surfaces.'),
      qa('Can you fabricate gearbox parts?', 'Yes — gearbox components and back-drive parts are machined in-house.'),
    ],
    relatedServices: [link('Gearbox Repair', '/services/gearbox-repair/'), link('Centrifuge Rebuilds', '/services/centrifuge-rebuilds/'), link('Decanter Repair', '/services/decanter-centrifuge-repair/')],
    relatedBrands: [B.sharples, B.bird],
    relatedIndustries: [I.mining, I.chemical],
    seoDescription: 'In-house centrifuge parts fabrication — hard-surfacing, carbide tiles, scroll flights, wear parts, and gearbox components when OEM parts are unavailable.',
  },
  {
    slug: 'gearbox-repair',
    title: 'Gearbox Repair',
    answerBoxQuestion: 'Do you repair decanter centrifuge gearboxes?',
    answerBox:
      'Yes. Centrifuge World repairs and rebuilds centrifuge gearboxes, including decanter back-drive and planetary gearboxes and Sumitomo units. We inspect, replace worn gears, bearings, and seals, fabricate parts when needed, and test the gearbox so differential and torque are restored.',
    intro:
      'The gearbox sets the differential between bowl and scroll. When it wears, separation suffers. We rebuild the gearbox and restore correct differential and torque.',
    capabilities: [
      cap('Decanter back-drive gearboxes', 'Rebuild the gearbox that sets bowl–scroll differential.'),
      cap('Planetary gearboxes', 'Service planetary units and cyclo drives.'),
      cap('Sumitomo units', 'Repair Sumitomo and comparable gearboxes.'),
      cap('Gears, bearings & seals', 'Replace worn internals to spec.'),
      cap('In-house gearbox parts', 'Fabricate components when originals are unavailable.'),
    ],
    faqs: [
      qa('What gearboxes do you repair?', 'Decanter back-drive gearboxes, planetary and cyclo units, and Sumitomo gearboxes, among others.'),
      qa('How do I know the gearbox is the problem?', 'Loss of differential, unusual noise, amperage changes, or metal in the oil often point to the gearbox; inspection confirms it.'),
      qa('Can you make gearbox parts?', 'Yes — internal components and back-drive parts are machined in-house when needed.'),
    ],
    relatedServices: [link('Decanter Repair', '/services/decanter-centrifuge-repair/'), link('Parts & Fabrication', '/services/parts-fabrication/'), link('Centrifuge Rebuilds', '/services/centrifuge-rebuilds/')],
    relatedBrands: [B.sharples, B.flottweg],
    relatedIndustries: [I.wastewater, I.oilGas],
    seoDescription: 'Centrifuge gearbox repair — decanter back-drive, planetary, and Sumitomo gearboxes. Gears, bearings, and seals replaced; differential and torque restored.',
  },
  {
    slug: 'centrifuge-rentals',
    title: 'Centrifuge Rentals',
    formType: 'contact',
    answerBoxQuestion: 'Do you rent industrial centrifuges?',
    answerBox:
      'Centrifuge World can help you keep processing while your machine is being rebuilt. Ask about rental and loaner centrifuge options to bridge planned rebuilds or unexpected downtime, so production keeps moving while your equipment is in our shop.',
    intro:
      'When your machine has to come out of service, a rental can keep product moving. Talk to us about options that fit your process and timeline.',
    capabilities: [
      cap('Bridge planned rebuilds', 'Keep running while your machine is in the shop.'),
      cap('Cover unexpected downtime', 'Options to keep production moving after a failure.'),
      cap('Matched to your process', 'We help identify a suitable machine for your duty.'),
    ],
    faqs: [
      qa('Do you offer rental or loaner centrifuges?', 'Ask our team about rental and loaner options; availability depends on machine type and timing. TODO(verify: current rental fleet and terms with client).'),
      qa('Can a rental bridge a rebuild?', 'That is a common use — a rental keeps you producing while your own machine is rebuilt.'),
      qa('How do I request a rental?', 'Contact us with your machine type and process and we will discuss options.'),
    ],
    relatedServices: [link('Centrifuge Rebuilds', '/services/centrifuge-rebuilds/'), link('Emergency Centrifuge Service', '/services/emergency-centrifuge-service/'), link('Field Service', '/services/field-service/')],
    relatedBrands: [B.sharples, B.alfaLaval],
    relatedIndustries: [I.oilGas, I.rendering],
    seoDescription: 'Centrifuge rental and loaner options to bridge planned rebuilds or unexpected downtime and keep production moving while your machine is serviced.',
  },
]

async function main() {
  loadEnv()
  const { default: config } = await import('../src/payload.config.ts')
  const payload = await getPayload({ config })

  for (const s of SERVICES) {
    const existing = await payload.find({ collection: 'services', where: { slug: { equals: s.slug } }, limit: 1 })
    const data = {
      title: s.title,
      slug: s.slug,
      h1: s.title,
      formType: s.formType || 'request_quote',
      emergencyVariant: !!s.emergencyVariant,
      answerBoxQuestion: s.answerBoxQuestion,
      answerBox: s.answerBox,
      intro: s.intro,
      capabilitiesHeading: 'What we do',
      capabilities: s.capabilities,
      processHeading: 'How it works',
      process: s.process ?? REBUILD_PROCESS,
      faqs: s.faqs,
      relatedServices: s.relatedServices,
      relatedBrands: s.relatedBrands,
      relatedIndustries: s.relatedIndustries,
      seo: { title: `${s.title} | Centrifuge World`.slice(0, 60), description: truncate(s.seoDescription, 155) },
      _status: 'published' as const,
    }
    if (existing.docs.length) {
      await payload.update({ collection: 'services', id: existing.docs[0].id, data })
      console.log(`updated: ${s.slug}`)
    } else {
      await payload.create({ collection: 'services', data })
      console.log(`created: ${s.slug}`)
    }
  }
  console.log(`\nSeeded ${SERVICES.length} services.`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
