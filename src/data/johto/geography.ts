import type { RegionGeography } from "@/types/world";

/**
 * Hand-authored Johto geography in a 1000 × 640 map space (+x east, +y south).
 * Polygons are coarse control points; the renderer smooths them with
 * Catmull-Rom splines and procedurally scatters trees and peaks inside them.
 */
export const johtoGeography: RegionGeography = {
  size: { width: 1000, height: 640 },

  landmasses: [
    // Mainland Johto
    [
      [235, 42], [300, 34], [360, 38], [430, 26], [500, 30], [540, 22], [600, 28], [640, 20],
      [700, 32], [740, 30], [800, 22], [840, 26], [900, 30], [930, 34], [965, 44], [985, 60],
      [992, 180], [988, 320], [992, 450], [986, 520], [982, 560], [960, 585], [930, 592],
      [895, 584], [870, 560], [845, 548], [820, 556], [800, 548], [770, 562], [745, 560],
      [715, 548], [690, 540], [665, 556], [640, 568], [610, 575], [590, 582], [555, 594],
      [520, 592], [485, 598], [450, 586], [420, 596], [390, 592], [355, 588], [330, 580],
      [305, 560], [296, 532], [290, 500], [300, 476], [312, 452], [330, 430], [322, 410],
      [306, 392], [318, 368], [300, 345], [276, 318], [262, 300], [240, 290], [226, 268],
      [205, 256], [198, 244], [190, 222], [186, 200], [192, 176], [196, 150], [205, 122],
      [210, 96], [220, 66],
    ],
    // Cianwood island
    [
      [38, 286], [70, 272], [96, 270], [120, 284], [132, 300], [124, 322], [128, 352],
      [112, 374], [96, 392], [70, 394], [50, 386], [30, 366], [24, 342], [28, 310],
    ],
    // Whirl Islands
    [[176, 452], [198, 446], [206, 466], [186, 476]],
    [[214, 488], [238, 482], [244, 502], [222, 510]],
    [[152, 490], [170, 486], [174, 504], [156, 508]],
  ],

  waterBodies: [
    {
      id: "lake-of-rage",
      name: "Lake of Rage",
      points: [[600, 62], [640, 48], [684, 58], [692, 84], [662, 104], [618, 100], [596, 82]],
    },
  ],

  biomes: [
    { id: "ice-path-snow", kind: "snow", points: [[686, 92], [766, 88], [786, 140], [752, 176], [696, 166]] },
    { id: "mt-silver-snow", kind: "snow", points: [[900, 62], [980, 56], [988, 176], [952, 230], [902, 196]] },
    { id: "cianwood-beach", kind: "beach", points: [[100, 280], [128, 300], [124, 330], [104, 318]] },
  ],

  forests: [
    { id: "ilex-forest", name: "Ilex Forest", density: 9, points: [[330, 462], [376, 452], [424, 468], [430, 506], [398, 528], [350, 526], [322, 500]] },
    { id: "national-park-grove", density: 4.5, points: [[352, 236], [400, 222], [438, 240], [440, 290], [400, 306], [356, 292]] },
    { id: "ecruteak-woods", density: 5, points: [[360, 80], [430, 70], [480, 90], [470, 122], [420, 118], [372, 112]] },
    { id: "lake-of-rage-woods", density: 6, points: [[575, 40], [690, 36], [705, 70], [695, 118], [660, 126], [596, 118], [566, 80]] },
    { id: "route-36-woods", density: 4, points: [[450, 200], [520, 206], [540, 240], [500, 262], [455, 236]] },
    { id: "central-groves", density: 2.2, points: [[440, 300], [520, 300], [540, 360], [480, 410], [430, 360]] },
    { id: "route-33-woods", density: 3, points: [[480, 470], [545, 466], [552, 500], [492, 506]] },
    { id: "kanto-border-woods", density: 3.5, points: [[850, 70], [895, 74], [900, 190], [860, 200], [845, 130]] },
    { id: "new-bark-woods", density: 5, points: [[790, 400], [870, 392], [900, 430], [880, 460], [820, 452]] },
    { id: "route-29-grove", density: 4, points: [[730, 520], [790, 515], [800, 540], [740, 548]] },
    { id: "route-38-woods", density: 4, points: [[280, 170], [340, 166], [350, 200], [300, 214], [270, 200]] },
    { id: "route-32-woods", density: 3, points: [[540, 340], [610, 350], [620, 440], [560, 460], [530, 400]] },
    { id: "route-45-woods", density: 4, points: [[830, 220], [920, 230], [940, 330], [880, 360], [830, 300]] },
    { id: "cianwood-scrub", density: 3, points: [[60, 296], [104, 290], [116, 340], [80, 372], [48, 350]] },
  ],

  mountains: [
    { id: "mt-mortar", name: "Mt. Mortar", density: 3.4, snowCapped: false, points: [[485, 92], [560, 88], [585, 112], [565, 136], [500, 136], [478, 115]] },
    { id: "ice-path", name: "Ice Path", density: 3.2, snowCapped: true, points: [[690, 100], [760, 96], [778, 140], [750, 168], [700, 160]] },
    { id: "mt-silver", name: "Mt. Silver", density: 3.5, snowCapped: true, points: [[905, 70], [975, 64], [982, 170], [950, 220], [908, 190]] },
    { id: "dark-cave", name: "Dark Cave", density: 2.2, snowCapped: false, points: [[700, 250], [780, 240], [790, 300], [730, 320], [690, 290]] },
    { id: "union-cave", name: "Union Cave", density: 2.5, snowCapped: false, points: [[560, 480], [630, 476], [640, 530], [580, 540]] },
    { id: "northern-ridge", density: 2.5, snowCapped: false, points: [[240, 50], [340, 40], [350, 70], [280, 90], [230, 80]] },
    { id: "victory-road", name: "Victory Road", density: 2.5, snowCapped: false, points: [[900, 380], [975, 370], [980, 450], [935, 470], [900, 440]] },
  ],

  routes: [
    { id: "route-29", label: "Route 29", kind: "land", points: [[840, 480], [800, 486], [760, 494], [720, 500], [690, 505]] },
    { id: "route-30", label: "Route 30", kind: "land", points: [[690, 505], [700, 460], [705, 410], [690, 360]] },
    { id: "route-31", label: "Route 31", kind: "land", points: [[690, 360], [660, 330], [620, 320]] },
    { id: "route-32", label: "Route 32", kind: "land", points: [[612, 330], [600, 380], [596, 440], [596, 500], [592, 520]] },
    { id: "union-cave", label: "Union Cave", kind: "cave", points: [[592, 520], [560, 522], [530, 524]] },
    { id: "route-33", label: "Route 33", kind: "land", points: [[530, 524], [500, 526], [472, 526]] },
    { id: "route-34", label: "Ilex Forest · Route 34", kind: "land", points: [[472, 526], [420, 500], [380, 490], [372, 450], [380, 410], [385, 388]] },
    { id: "route-35", label: "Route 35", kind: "land", points: [[385, 385], [390, 330], [398, 268]] },
    { id: "route-36", label: "Route 36", kind: "land", points: [[398, 262], [440, 256], [480, 252], [540, 272], [590, 300], [620, 318]] },
    { id: "route-37", label: "Route 37", kind: "land", points: [[470, 252], [452, 210], [432, 175], [420, 152]] },
    { id: "route-38-39", label: "Routes 38–39", kind: "land", points: [[420, 152], [370, 150], [320, 156], [282, 180], [250, 214], [234, 228]] },
    { id: "route-40-41", label: "Routes 40–41", kind: "water", points: [[234, 228], [190, 248], [150, 280], [112, 312], [84, 328]] },
    { id: "route-41-whirl", label: "Route 41", kind: "water", points: [[170, 266], [176, 340], [186, 420], [196, 470]] },
    { id: "route-42", label: "Route 42", kind: "land", points: [[420, 152], [480, 146], [540, 140], [590, 150], [630, 162]] },
    { id: "route-43", label: "Route 43", kind: "land", points: [[630, 162], [636, 130], [642, 100]] },
    { id: "route-44", label: "Route 44", kind: "land", points: [[630, 162], [680, 160], [720, 148]] },
    { id: "ice-path", label: "Ice Path", kind: "cave", points: [[720, 148], [760, 150], [812, 176]] },
    { id: "route-45-46", label: "Routes 45–46", kind: "land", points: [[812, 182], [820, 240], [810, 320], [790, 390], [770, 450], [765, 494]] },
    { id: "route-27-sea", label: "Route 27", kind: "water", points: [[840, 482], [880, 490], [920, 470]] },
    { id: "route-26", label: "Route 26", kind: "land", points: [[920, 470], [950, 430], [958, 380], [955, 330]] },
    { id: "route-28", label: "Route 28", kind: "land", points: [[955, 330], [950, 280], [944, 210]] },
  ],

  labels: [
    { text: "Western Sea", position: [96, 150], size: "lg", style: "water" },
    { text: "Southern Sea", position: [640, 618], size: "md", style: "water" },
    { text: "Mt. Mortar", position: [532, 178], size: "sm", style: "land" },
    { text: "Ice Path", position: [734, 88], size: "sm", style: "land" },
    { text: "Dark Cave", position: [742, 336], size: "sm", style: "land" },
    { text: "Union Cave", position: [616, 556], size: "sm", style: "land" },
    { text: "Victory Road", position: [940, 486], size: "sm", style: "land" },
    { text: "To Kanto →", position: [962, 540], size: "sm", style: "land" },
  ],
};
