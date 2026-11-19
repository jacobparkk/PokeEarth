import type { RegionGeography } from "@/types/world";

/** Kanto in a 1000 × 640 map space (+x east, +y south). */
export const kantoGeography: RegionGeography = {
  size: { width: 1000, height: 640 },

  landmasses: [
    // Mainland Kanto
    [
      [60, 44], [130, 34], [200, 30], [280, 38], [350, 34], [430, 28], [500, 24], [570, 30],
      [640, 30], [700, 36], [760, 42], [810, 58], [836, 90], [850, 160], [842, 220], [840, 262],
      [856, 300], [860, 340], [846, 390], [830, 440], [816, 482], [800, 520], [772, 548],
      [740, 570], [690, 578], [640, 586], [600, 596], [560, 600], [515, 596], [470, 592],
      [430, 588], [400, 585], [362, 580], [330, 575], [296, 566], [270, 556], [250, 540],
      [236, 524], [212, 528], [188, 532], [160, 530], [130, 520], [104, 504], [80, 478],
      [62, 440], [52, 400], [48, 360], [44, 300], [40, 250], [42, 190], [48, 140], [52, 90],
    ],
    // Cinnabar Island
    [[168, 574], [204, 566], [232, 578], [236, 604], [212, 620], [178, 616], [162, 596]],
    // Seafoam Islands
    [[322, 584], [346, 578], [362, 592], [354, 610], [328, 612], [316, 598]],
    [[372, 600], [386, 596], [392, 608], [380, 616], [368, 610]],
  ],

  waterBodies: [
    { id: "safari-pond", name: "Safari Zone Pond", points: [[440, 500], [458, 494], [470, 504], [460, 516], [442, 514]] },
    { id: "cerulean-cape-cove", points: [[590, 60], [628, 56], [640, 76], [612, 88], [588, 80]] },
  ],

  biomes: [
    { id: "cinnabar-ash", kind: "ash", points: [[186, 578], [214, 574], [226, 592], [208, 608], [186, 602]] },
    { id: "pallet-beach", kind: "beach", points: [[160, 512], [236, 508], [240, 528], [188, 534], [150, 526]] },
    { id: "route-25-meadow", kind: "meadow", points: [[560, 70], [700, 62], [720, 100], [600, 110]] },
    { id: "fuchsia-beach", kind: "beach", points: [[430, 570], [540, 566], [560, 592], [440, 590]] },
  ],

  forests: [
    { id: "viridian-forest", name: "Viridian Forest", density: 9, points: [[158, 214], [242, 212], [252, 286], [200, 302], [154, 286]] },
    { id: "pallet-woods", density: 4, points: [[140, 420], [176, 414], [182, 496], [142, 500], [120, 470]] },
    { id: "route-22-woods", density: 3.5, points: [[70, 300], [140, 300], [150, 380], [80, 400], [62, 350]] },
    { id: "celadon-woods", density: 4, points: [[290, 250], [350, 248], [358, 340], [300, 350], [278, 300]] },
    { id: "route-24-25-woods", density: 4, points: [[480, 46], [560, 44], [570, 90], [500, 100]] },
    { id: "safari-zone-jungle", density: 7, points: [[408, 460], [530, 456], [540, 518], [420, 524]] },
    { id: "route-12-15-coast", density: 3.5, points: [[742, 340], [810, 336], [800, 500], [730, 520], [720, 440]] },
    { id: "route-9-scrub", density: 3, points: [[580, 110], [680, 108], [690, 140], [590, 150]] },
    { id: "route-16-18-woods", density: 3, points: [[240, 380], [310, 380], [320, 520], [262, 528], [236, 460]] },
    { id: "lavender-pines", density: 3, points: [[760, 260], [826, 262], [830, 330], [770, 330]] },
    { id: "pewter-woods", density: 3, points: [[230, 120], [290, 118], [296, 200], [246, 200]] },
  ],

  mountains: [
    { id: "mt-moon", name: "Mt. Moon", density: 3.6, snowCapped: false, points: [[300, 86], [410, 80], [430, 118], [404, 172], [312, 172], [290, 130]] },
    { id: "indigo-range", name: "Indigo Plateau", density: 3.4, snowCapped: true, points: [[56, 100], [140, 96], [152, 180], [134, 276], [60, 276], [50, 180]] },
    { id: "rock-tunnel", name: "Rock Tunnel", density: 3, snowCapped: false, points: [[672, 112], [764, 110], [770, 196], [700, 210], [666, 170]] },
    { id: "cerulean-cliffs", density: 2.4, snowCapped: false, points: [[420, 60], [470, 54], [482, 84], [436, 90]] },
    { id: "route-3-hills", density: 2.2, snowCapped: false, points: [[226, 60], [290, 54], [292, 96], [232, 104]] },
  ],

  routes: [
    { id: "route-1", label: "Route 1", kind: "land", points: [[200, 470], [196, 430], [200, 390], [200, 360]] },
    { id: "route-2", label: "Route 2", kind: "land", points: [[200, 360], [204, 310], [200, 260], [198, 210], [200, 160]] },
    { id: "route-22", label: "Route 22", kind: "land", points: [[200, 360], [160, 362], [120, 350]] },
    { id: "route-23", label: "Route 23", kind: "land", points: [[120, 350], [104, 300], [96, 244]] },
    { id: "victory-road", label: "Victory Road", kind: "cave", points: [[96, 244], [86, 200], [80, 152]] },
    { id: "route-3", label: "Route 3", kind: "land", points: [[200, 160], [250, 140], [300, 132]] },
    { id: "mt-moon-path", label: "Mt. Moon", kind: "cave", points: [[300, 132], [360, 130], [420, 134]] },
    { id: "route-4", label: "Route 4", kind: "land", points: [[420, 134], [470, 140], [520, 140]] },
    { id: "route-24-25", label: "Routes 24–25", kind: "land", points: [[520, 140], [524, 100], [560, 76], [610, 66], [660, 60]] },
    { id: "route-9", label: "Route 9", kind: "land", points: [[520, 140], [580, 134], [640, 132], [700, 140]] },
    { id: "rock-tunnel-path", label: "Rock Tunnel", kind: "cave", points: [[700, 140], [720, 170], [722, 210]] },
    { id: "route-10", label: "Route 10", kind: "land", points: [[722, 210], [740, 240], [726, 300], [720, 300]] },
    { id: "power-plant-river", label: "Route 10 river", kind: "water", points: [[740, 220], [770, 210], [790, 200]] },
    { id: "route-5", label: "Route 5", kind: "land", points: [[520, 140], [522, 200], [520, 260], [520, 300]] },
    { id: "route-6", label: "Route 6", kind: "land", points: [[520, 300], [526, 360], [540, 420]] },
    { id: "route-7", label: "Route 7", kind: "land", points: [[520, 300], [450, 300], [380, 300]] },
    { id: "route-8", label: "Route 8", kind: "land", points: [[520, 300], [600, 302], [660, 300], [720, 300]] },
    { id: "route-11", label: "Route 11", kind: "land", points: [[540, 420], [610, 428], [680, 430], [756, 424]] },
    { id: "route-12-15", label: "Routes 12–15", kind: "land", points: [[720, 300], [760, 330], [770, 400], [756, 424], [760, 480], [720, 520], [640, 540], [560, 545], [470, 545]] },
    { id: "route-16-18", label: "Cycling Road", kind: "land", points: [[380, 300], [300, 304], [280, 360], [278, 440], [290, 520], [360, 540], [470, 545]] },
    { id: "safari-entrance", label: "Safari Zone", kind: "land", points: [[470, 545], [470, 490]] },
    { id: "route-19-20", label: "Routes 19–20", kind: "water", points: [[470, 548], [470, 600], [420, 610], [360, 598], [280, 600], [204, 594]] },
    { id: "route-21", label: "Route 21", kind: "water", points: [[200, 474], [196, 530], [200, 590]] },
  ],

  labels: [
    { text: "Sea of Kanto", position: [660, 620], size: "lg", style: "water" },
    { text: "Mt. Moon", position: [360, 190], size: "sm", style: "land" },
    { text: "Rock Tunnel", position: [710, 100], size: "sm", style: "land" },
    { text: "Cycling Road", position: [258, 420], size: "sm", style: "land" },
    { text: "← Johto", position: [24, 420], size: "sm", style: "water" },
    { text: "Silence Bridge", position: [700, 545], size: "sm", style: "land" },
  ],
};
