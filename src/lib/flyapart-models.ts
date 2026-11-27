// Registry of the interactive 3D fly-apart models shown by FlyApartExplorer.
// Kept free of three.js so server components can read part lists and posters
// without pulling the 3D bundle. Part keys match the node names in each GLB.
// Descriptions are generic engineering, not claims about any one make or model.
export interface FlyApartPart {
  key: string
  name: string
  description: string
  /** Set when the part belongs to only one option of the model's `variants` (e.g. one drive type). */
  variant?: string
}

export interface FlyApartModel {
  /** Title shown in the viewer's info panel when no part is selected. */
  title: string
  modelUrl: string
  poster: { src: string; alt: string; width: number; height: number }
  /** Accessible name for the canvas. */
  canvasLabel: string
  /** Honest caption under the viewer: what the model is and is not. */
  caption: string
  parts: FlyApartPart[]
  /** Node that turns slowly once the model is mostly apart (e.g. the scroll or basket). */
  spin?: { node: string; axis: 'x' | 'y' | 'z' }
  /** Height of the shadow-catching floor in model units (glTF Y-up). */
  floorY: number
  /** Starting camera direction, in degrees. */
  view: { azimuth: number; elevation: number }
  /** 'wide' for horizontal machines, 'tall' for vertical ones (changes the viewer's aspect ratio). */
  layout: 'wide' | 'tall'
  /** Optional either/or configuration the visitor can switch between; the first option is the default. */
  variants?: { label: string; options: { key: string; label: string }[] }
}

/** "Electric drive" style tag for a variant-specific part, or undefined for common parts. */
export function variantTag(model: FlyApartModel, part: FlyApartPart): string | undefined {
  const opt = model.variants?.options.find((o) => o.key === part.variant)
  return opt && model.variants ? `${opt.label} ${model.variants.label.toLowerCase()}` : undefined
}

const DECANTER_PARTS: FlyApartPart[] = [
  { key: 'Bowl_Cylinder', name: 'Bowl, cylindrical section', description: 'The clarifying zone. Solids settle against the bowl wall under centrifugal force.' },
  { key: 'Bowl_Cone_Beach', name: 'Bowl, conical beach', description: 'Solids are conveyed up the beach, out of the liquid pond, and drain before discharge.' },
  { key: 'Solids_Port_Bushing', name: 'Solids discharge bushings', description: 'Replaceable wear bushings lining the solids discharge ports.' },
  { key: 'Bolts_Bowl_Flange', name: 'Bowl flange bolts', description: 'Join the cylindrical and conical bowl sections.' },
  { key: 'Scroll_Hub', name: 'Scroll conveyor', description: 'Turns at a slightly different speed than the bowl to convey settled solids toward the beach.' },
  { key: 'Scroll_Flights', name: 'Scroll flights', description: 'Helical flights that sweep settled solids along the bowl wall.' },
  { key: 'Scroll_Wear_Tiles', name: 'Flight wear tiles', description: 'Carbide tiles that protect the flight tips from abrasive wear.' },
  { key: 'Scroll_Feed_Port_Liners', name: 'Feed port liners', description: 'Wear liners where feed leaves the scroll hub and enters the bowl.' },
  { key: 'Hub_Liquid_End', name: 'Liquid end hub', description: 'Closes the large end of the bowl and carries the liquid discharge ports.' },
  { key: 'Weir_Plates', name: 'Weir (dam) plates', description: 'Adjustable plates that set the pond depth inside the bowl.' },
  { key: 'Weir_Plate_Screws', name: 'Weir plate screws', description: 'Retain the weir plates on the liquid end hub.' },
  { key: 'Bolts_Hub_Liquid_End', name: 'Liquid end hub bolts', description: 'Fasten the liquid end hub to the bowl.' },
  { key: 'Hub_Solids_End', name: 'Solids end hub', description: 'Closes the small end of the bowl.' },
  { key: 'Bolts_Hub_Solids_End', name: 'Solids end hub bolts', description: 'Fasten the solids end hub to the bowl.' },
  { key: 'Conveyor_Bearing_Liquid_End', name: 'Conveyor bearing, liquid end', description: 'Supports the scroll conveyor inside the bowl hub.' },
  { key: 'Conveyor_Bearing_Solids_End', name: 'Conveyor bearing, solids end', description: 'Supports the scroll conveyor inside the bowl hub.' },
  { key: 'Conveyor_Seal_Liquid_End', name: 'Conveyor seal, liquid end', description: 'Keeps process material out of the conveyor bearing.' },
  { key: 'Conveyor_Seal_Solids_End', name: 'Conveyor seal, solids end', description: 'Keeps process material out of the conveyor bearing.' },
  { key: 'Main_Bearing_Liquid_End', name: 'Main bearing, liquid end', description: 'Carries the rotating assembly in the frame.' },
  { key: 'Main_Bearing_Solids_End', name: 'Main bearing, solids end', description: 'Carries the rotating assembly in the frame.' },
  { key: 'Gearbox_Adapter_Flange', name: 'Gearbox adapter flange', description: 'Couples the gearbox housing to the bowl hub.' },
  { key: 'Bolts_Gearbox', name: 'Gearbox bolts', description: 'Fasten the gearbox to its adapter flange.' },
  { key: 'Gearbox_Planetary', name: 'Planetary gearbox', description: 'Sets the differential speed between the bowl and the scroll conveyor.' },
  { key: 'Spline_Shaft', name: 'Spline shaft', description: 'Transmits gearbox output torque to the scroll conveyor.' },
  { key: 'Drive_Sheave', name: 'Drive sheave', description: 'V-belt pulley that drives the bowl from the main motor.' },
  { key: 'Feed_Tube', name: 'Feed tube', description: 'Stationary pipe that delivers feed into the scroll feed chamber.' },
]

const BASKET_PARTS: FlyApartPart[] = [
  { key: 'Drive_Motor', name: 'Drive motor', description: 'Top-mounted electric motor that powers the basket.', variant: 'electric' },
  { key: 'Drive_Gearbox', name: 'Drive gearbox', description: 'Transmits motor power down to the spindle.', variant: 'electric' },
  { key: 'Hydraulic_Hoses', name: 'Hydraulic lines', description: 'Pressure and return hoses between the motor and a separate hydraulic power unit.', variant: 'hydraulic' },
  { key: 'Hydraulic_Motor', name: 'Hydraulic drive motor', description: 'Low-speed, high-torque hydraulic motor mounted directly above the spindle.', variant: 'hydraulic' },
  { key: 'Drive_Coupling', name: 'Drive coupling', description: 'Flexible coupling between the drive output and the spindle.' },
  { key: 'Drive_Pedestal', name: 'Drive pedestal', description: 'Supports the drive above the bearing housing.' },
  { key: 'Bearing_Housing', name: 'Bearing housing', description: 'Cartridge that holds the spindle bearings and mounts to the lid.' },
  { key: 'Spindle_Bearing_Upper', name: 'Spindle bearing, upper', description: 'Carries the spindle at the top of the bearing housing.' },
  { key: 'Spindle_Bearing_Lower', name: 'Spindle bearing, lower', description: 'Carries the spindle at the bottom of the bearing housing.' },
  { key: 'Spindle_Seal', name: 'Spindle seal', description: 'Keeps process liquid and vapor out of the bearing housing.' },
  { key: 'Spindle', name: 'Spindle', description: 'The shaft that carries the basket and transmits drive torque to it.' },
  { key: 'Lid', name: 'Lid (cover)', description: 'Closes the top of the casing and carries the feed pipe, sight glass, plow, and drive.' },
  { key: 'Lid_Bolts', name: 'Lid bolts', description: 'Fasten the lid to the casing flange.' },
  { key: 'Sight_Glass_Frame', name: 'Sight glass frame', description: 'Clamps and seals the sight glass to the lid.' },
  { key: 'Sight_Glass_Lens', name: 'Sight glass', description: 'Window for watching the cake build and the wash during a cycle.' },
  { key: 'Feed_Pipe', name: 'Feed pipe', description: 'Delivers slurry into the spinning basket.' },
  { key: 'Plow_Assembly', name: 'Plow (scraper)', description: 'Swings into the cake at low speed to cut solids off the basket wall for bottom discharge.' },
  { key: 'Basket', name: 'Perforated basket', description: 'The rotating filter drum. Liquid passes through the perforations while solids build up as a cake on the wall.' },
  { key: 'Basket_Lock_Nut', name: 'Basket lock nut', description: 'Retains the basket hub on the spindle taper.' },
  { key: 'Casing', name: 'Casing (curb)', description: 'Stationary housing around the basket. Collects the filtrate and directs it to the liquid outlet.' },
  { key: 'Discharge_Chute', name: 'Solids discharge chute', description: 'Bottom outlet where plowed solids leave the machine.' },
  { key: 'Base_Frame', name: 'Base frame', description: 'Supports the casing and carries the machine on vibration isolators.' },
]

export const FLYAPART_MODELS = {
  decanter: {
    title: 'Decanter rotating assembly',
    modelUrl: '/models/decanter-rotating-assembly.glb',
    poster: {
      src: '/images/decanter-3d/assembled.webp',
      alt: '3D render of a decanter centrifuge rotating assembly: gearbox, bowl, conical beach, and drive sheave',
      width: 1274,
      height: 350,
    },
    canvasLabel: 'Interactive 3D model of a decanter centrifuge rotating assembly. A text list of the parts follows.',
    caption: 'Representative 14-inch decanter rotating assembly. Layout and details vary by make and model.',
    parts: DECANTER_PARTS,
    spin: { node: 'Scroll_Hub', axis: 'x' },
    floorY: -0.42,
    view: { azimuth: -34, elevation: 17 },
    layout: 'wide',
  },
  basket: {
    title: 'Basket centrifuge',
    modelUrl: '/models/basket-centrifuge.glb',
    poster: {
      src: '/images/basket-3d/assembled.webp',
      alt: '3D render of a vertical basket centrifuge: casing on a base frame, lid with a raised sight glass and feed pipe, and a top-mounted drive',
      width: 672,
      height: 1146,
    },
    canvasLabel: 'Interactive 3D model of a vertical basket centrifuge. A text list of the parts is on this page.',
    caption:
      'Representative 48 x 30 inch top-driven, bottom-discharge basket centrifuge, shown with an electric or a hydraulic drive. Layout and details vary by make and model.',
    parts: BASKET_PARTS,
    spin: { node: 'Basket', axis: 'y' },
    floorY: 0,
    view: { azimuth: -30, elevation: 14 },
    layout: 'tall',
    variants: {
      label: 'Drive',
      options: [
        { key: 'electric', label: 'Electric' },
        { key: 'hydraulic', label: 'Hydraulic' },
      ],
    },
  },
} satisfies Record<string, FlyApartModel>

export type FlyApartModelKey = keyof typeof FLYAPART_MODELS

/** Self-hosted Draco decoder (JS build — the WASM build is blocked by the site CSP). */
export const FLYAPART_DRACO_PATH = '/draco/'
