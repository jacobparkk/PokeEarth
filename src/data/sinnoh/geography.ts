import type { RegionGeography } from "@/types/world";

/** Sinnoh in a 1000 × 640 map space, split down the middle by Mt. Coronet, with snowfields to the north. */
export const sinnohGeography: RegionGeography = {
  size: { width: 1000, height: 640 },

  landmasses: [
    // Mainland Sinnoh
    [
      [140, 120], [190, 86], [260, 60], [320, 40], [380, 30], [440, 22], [500, 20], [570, 28],
      [640, 40], [700, 58], [760, 80], [810, 112], [842, 150], [862, 196], [870, 240], [864, 286],
      [860, 330], [876, 372], [896, 420], [902, 470], [898, 520], [870, 556], [836, 572],
      [796, 566], [760, 560], [722, 576], [680, 590], [630, 584], [580, 570], [530, 584],
      [480, 600], [430, 596], [380, 590], [340, 598], [300, 600], [256, 596], [210, 590],
      [176, 576], [150, 556], [154, 520], [162, 496], [150, 466], [128, 452], [108, 440],
      [96, 410], [90, 380], [94, 340], [100, 300], [108, 260], [120, 220], [126, 170],
    ],
    // Iron Island
    [[38, 300], [62, 292], [82, 298], [88, 324], [72, 348], [48, 350], [34, 330]],
    // Pokémon League island
    [[918, 330], [950, 320], [974, 334], [980, 368], [960, 394], [930, 396], [914, 370]],
    // Battle Zone islands
    [[896, 64], [934, 52], [966, 60], [972, 96], [948, 122], [914, 124], [894, 100]],
    [[958, 140], [976, 136], [984, 154], [968, 164]],
    // Fullmoon Island
    [[176, 610], [196, 604], [206, 618], [190, 628], [174, 622]],
  ],

  waterBodies: [
    { id: "lake-verity", name: "Lake Verity", points: [[176, 540], [196, 534], [210, 546], [204, 562], [184, 566], [172, 554]] },
    { id: "lake-valor", name: "Lake Valor", points: [[738, 366], [770, 358], [794, 370], [796, 396], [770, 412], [742, 404], [730, 386]] },
    { id: "lake-acuity", name: "Lake Acuity", points: [[344, 52], [370, 44], [390, 54], [388, 72], [364, 82], [344, 74]] },
    { id: "canalave-canal", points: [[132, 396], [146, 392], [150, 428], [136, 432]] },
  ],

  biomes: [
    { id: "northern-snowfields", kind: "snow", points: [[220, 70], [320, 40], [440, 24], [560, 28], [680, 56], [700, 96], [620, 122], [540, 140], [440, 136], [340, 126], [250, 118]] },
    { id: "coronet-snow", kind: "snow", points: [[452, 120], [520, 110], [532, 220], [500, 260], [462, 230]] },
    { id: "great-marsh", kind: "marsh", points: [[640, 448], [712, 440], [722, 500], [660, 512], [634, 484]] },
    { id: "sunyshore-beach", kind: "beach", points: [[816, 488], [890, 476], [896, 528], [836, 548]] },
    { id: "floaroma-meadow", kind: "meadow", points: [[180, 290], [262, 284], [270, 344], [196, 350]] },
  ],

  forests: [
    { id: "eterna-forest", name: "Eterna Forest", density: 9, points: [[252, 206], [348, 200], [360, 266], [310, 286], [256, 274]] },
    { id: "route-201-202", density: 3, points: [[196, 452], [300, 446], [306, 520], [216, 528]] },
    { id: "route-209-210", density: 4.5, points: [[566, 214], [640, 210], [650, 330], [590, 336]] },
    { id: "route-212-rainforest", density: 7, points: [[578, 396], [660, 392], [672, 446], [600, 470]] },
    { id: "route-214-215", density: 4, points: [[690, 268], [800, 262], [812, 340], [720, 352]] },
    { id: "snowy-pines", density: 6, points: [[260, 76], [420, 56], [440, 120], [300, 124]] },
    { id: "snowpoint-pines", density: 4.5, points: [[560, 52], [660, 64], [672, 104], [574, 116]] },
    { id: "route-222", density: 3, points: [[780, 430], [850, 420], [860, 470], [790, 476]] },
    { id: "canalave-woods", density: 3.5, points: [[110, 330], [180, 326], [186, 390], [120, 396]] },
    { id: "route-205-woods", density: 3.5, points: [[230, 352], [300, 350], [304, 400], [236, 404]] },
    { id: "lake-valor-woods", density: 3, points: [[720, 410], [800, 404], [800, 440], [730, 446]] },
  ],

  mountains: [
    { id: "mt-coronet", name: "Mt. Coronet", density: 3.6, snowCapped: true, points: [[450, 92], [522, 84], [534, 200], [516, 320], [532, 450], [512, 562], [470, 562], [454, 440], [470, 320], [446, 200]] },
    { id: "oreburgh-hills", name: "Oreburgh Mine", density: 2.6, snowCapped: false, points: [[392, 360], [440, 356], [446, 430], [396, 436]] },
    { id: "wayward-hills", density: 2.2, snowCapped: false, points: [[330, 300], [376, 296], [380, 340], [334, 344]] },
    { id: "iron-island-peak", density: 2, snowCapped: false, points: [[46, 306], [76, 302], [80, 332], [52, 340]] },
    { id: "league-cliffs", name: "Victory Road", density: 2.6, snowCapped: false, points: [[930, 326], [966, 330], [972, 362], [940, 372]] },
    { id: "sunyshore-cliffs", density: 2, snowCapped: false, points: [[836, 400], [880, 396], [886, 440], [846, 446]] },
  ],

  routes: [
    { id: "route-201", label: "Route 201", kind: "land", points: [[230, 526], [246, 512], [262, 500]] },
    { id: "verity-lakefront", label: "Verity Lakefront", kind: "land", points: [[230, 526], [214, 540]] },
    { id: "route-202", label: "Route 202", kind: "land", points: [[262, 500], [262, 460], [260, 420]] },
    { id: "route-218", label: "Route 218", kind: "land", points: [[260, 420], [220, 418], [190, 416]] },
    { id: "route-218-sea", label: "Route 218", kind: "water", points: [[190, 416], [154, 412], [124, 410]] },
    { id: "iron-island-ferry", label: "Ferry", kind: "water", points: [[118, 404], [96, 368], [66, 324]] },
    { id: "route-203", label: "Route 203", kind: "land", points: [[260, 420], [310, 412], [340, 404]] },
    { id: "oreburgh-gate", label: "Oreburgh Gate", kind: "cave", points: [[340, 404], [360, 400]] },
    { id: "route-204", label: "Route 204", kind: "land", points: [[260, 420], [254, 376], [234, 336], [220, 320]] },
    { id: "route-205", label: "Route 205", kind: "land", points: [[220, 320], [260, 306], [290, 300], [302, 262], [340, 236], [390, 220]] },
    { id: "route-206-207", label: "Cycling Road", kind: "land", points: [[390, 220], [402, 290], [380, 360], [360, 400]] },
    { id: "route-211-west", label: "Route 211", kind: "land", points: [[390, 220], [440, 216]] },
    { id: "coronet-pass", label: "Mt. Coronet", kind: "cave", points: [[440, 216], [490, 220], [530, 226]] },
    { id: "route-211-east", label: "Route 211", kind: "land", points: [[530, 226], [556, 232]] },
    { id: "spear-pillar-ascent", label: "Spear Pillar", kind: "cave", points: [[488, 220], [488, 176]] },
    { id: "coronet-north", label: "Mt. Coronet", kind: "cave", points: [[488, 176], [476, 140]] },
    { id: "route-216-217", label: "Routes 216–217", kind: "land", points: [[476, 140], [430, 116], [384, 96], [410, 76], [440, 68]] },
    { id: "route-210", label: "Route 210", kind: "land", points: [[556, 232], [600, 240], [630, 280], [650, 300]] },
    { id: "route-209", label: "Route 209", kind: "land", points: [[650, 300], [620, 340], [580, 380]] },
    { id: "route-208", label: "Route 208", kind: "land", points: [[580, 380], [536, 390]] },
    { id: "coronet-south", label: "Mt. Coronet", kind: "cave", points: [[536, 390], [490, 396], [450, 400]] },
    { id: "route-207", label: "Route 207", kind: "land", points: [[450, 400], [400, 402], [360, 400]] },
    { id: "route-215", label: "Route 215", kind: "land", points: [[650, 300], [700, 276], [740, 250]] },
    { id: "route-214", label: "Route 214", kind: "land", points: [[740, 250], [800, 310], [810, 380], [770, 440], [726, 470]] },
    { id: "route-212", label: "Route 212", kind: "land", points: [[580, 380], [600, 430], [660, 466], [726, 470]] },
    { id: "route-222", label: "Route 222", kind: "land", points: [[806, 410], [830, 460], [852, 504]] },
    { id: "route-223", label: "Route 223", kind: "water", points: [[860, 498], [900, 440], [940, 370]] },
    { id: "battle-zone-ferry", label: "Ferry", kind: "water", points: [[946, 330], [956, 240], [934, 120]] },
  ],

  labels: [
    { text: "Mt. Coronet", position: [492, 300], size: "sm", style: "land" },
    { text: "Great Marsh", position: [676, 520], size: "sm", style: "land" },
    { text: "Snowfields", position: [560, 128], size: "sm", style: "land" },
    { text: "Sinnoh Sea", position: [700, 622], size: "lg", style: "water" },
    { text: "Fullmoon Island", position: [192, 638], size: "sm", style: "water" },
  ],
};
