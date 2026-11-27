// Registry of the interactive 3D fly-apart models shown by FlyApartExplorer.
// Kept free of three.js so server components can read part lists and posters
// without pulling the 3D bundle. Part keys match the node names in each GLB.
// Descriptions are generic engineering, not claims about any one make or model.
export interface FlyApartPart {
  key: string
  name: string
  description: string
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
} satisfies Record<string, FlyApartModel>

export type FlyApartModelKey = keyof typeof FLYAPART_MODELS

/** Self-hosted Draco decoder (JS build — the WASM build is blocked by the site CSP). */
export const FLYAPART_DRACO_PATH = '/draco/'
