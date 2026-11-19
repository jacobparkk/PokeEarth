import type { RegionGeography } from "@/types/world";

/** Hoenn in a 1000 × 640 map space: a volcanic mainland in the west, open sea and islands to the east. */
export const hoennGeography: RegionGeography = {
  size: { width: 1000, height: 640 },

  landmasses: [
    // Mainland Hoenn
    [
      [140, 60], [200, 46], [260, 40], [330, 34], [400, 30], [460, 34], [520, 40], [580, 44],
      [640, 50], [700, 58], [760, 70], [804, 88], [830, 112], [826, 150], [820, 180], [790, 210],
      [760, 238], [720, 248], [690, 252], [650, 262], [620, 272], [590, 286], [566, 304],
      [548, 334], [534, 368], [528, 400], [522, 430], [510, 462], [500, 482], [474, 500],
      [446, 506], [416, 500], [388, 502], [360, 514], [334, 522], [306, 526], [278, 524],
      [252, 512], [228, 494], [204, 472], [180, 458], [152, 450], [136, 430], [128, 400],
      [122, 360], [120, 330], [114, 290], [110, 250], [112, 200], [114, 160], [124, 110],
    ],
    // Dewford Island
    [[150, 545], [178, 536], [204, 540], [216, 562], [200, 586], [170, 592], [146, 578]],
    // Mt. Pyre island
    [[838, 216], [866, 210], [884, 228], [878, 254], [852, 260], [834, 242]],
    // Mossdeep Island
    [[862, 128], [900, 116], [936, 122], [954, 152], [940, 186], [904, 200], [870, 190], [856, 160]],
    // Sootopolis (crater island)
    [[776, 300], [812, 288], [850, 292], [878, 318], [880, 352], [854, 378], [812, 382], [780, 366], [764, 334]],
    // Ever Grande
    [[900, 380], [934, 368], [964, 376], [978, 408], [962, 440], [930, 452], [904, 436], [894, 408]],
    // Pacifidlog
    [[640, 510], [656, 504], [670, 512], [668, 528], [650, 532], [638, 522]],
    // Sky Pillar islet
    [[742, 452], [762, 444], [776, 456], [772, 476], [750, 480], [738, 468]],
    // Scattered islets
    [[596, 410], [610, 404], [618, 416], [604, 424]],
    [[700, 380], [712, 376], [718, 388], [706, 394]],
    [[560, 580], [578, 574], [584, 590], [566, 596]],
    [[980, 250], [994, 246], [998, 262], [984, 268]],
  ],

  waterBodies: [
    { id: "sootopolis-crater", name: "Sootopolis Crater", points: [[796, 318], [826, 308], [852, 322], [856, 348], [834, 364], [804, 360], [790, 340]] },
    { id: "route-120-lake", points: [[664, 150], [690, 144], [704, 160], [690, 176], [666, 172]] },
    { id: "petalburg-lake", points: [[156, 380], [174, 374], [182, 388], [168, 398], [154, 392]] },
  ],

  biomes: [
    { id: "route-111-desert", kind: "desert", points: [[412, 146], [488, 140], [506, 196], [474, 232], [420, 220], [404, 180]] },
    { id: "route-113-ash", kind: "ash", points: [[310, 44], [452, 40], [464, 84], [404, 98], [320, 96]] },
    { id: "slateport-beach", kind: "beach", points: [[430, 472], [510, 456], [500, 500], [440, 506]] },
    { id: "chimney-slopes", kind: "ash", points: [[340, 96], [420, 92], [430, 140], [396, 172], [346, 160]] },
    { id: "dewford-beach", kind: "beach", points: [[176, 540], [210, 546], [212, 570], [190, 562]] },
    { id: "pacifidlog-reef", kind: "beach", points: [[642, 512], [666, 512], [664, 526], [646, 528]] },
  ],

  forests: [
    { id: "petalburg-woods", name: "Petalburg Woods", density: 9, points: [[130, 300], [206, 296], [214, 360], [176, 372], [128, 352]] },
    { id: "route-119-jungle", name: "Route 119", density: 9, points: [[548, 94], [630, 88], [650, 180], [628, 250], [574, 262], [556, 180]] },
    { id: "route-120-121", density: 5, points: [[640, 110], [760, 120], [790, 190], [740, 236], [660, 230], [646, 190]] },
    { id: "routes-101-103", density: 3, points: [[248, 372], [340, 370], [350, 440], [262, 446]] },
    { id: "route-104-west", density: 4, points: [[118, 220], [168, 220], [170, 290], [122, 292]] },
    { id: "route-116", density: 3.5, points: [[210, 214], [300, 210], [312, 270], [220, 272]] },
    { id: "route-117-flowers", density: 3.2, points: [[372, 270], [436, 268], [440, 296], [376, 300]] },
    { id: "route-118-123", density: 3.5, points: [[470, 240], [560, 234], [554, 300], [480, 310]] },
    { id: "mt-pyre-woods", density: 4, points: [[842, 226], [870, 222], [876, 250], [848, 254]] },
    { id: "mossdeep-palms", density: 3, points: [[870, 140], [930, 132], [942, 176], [880, 186]] },
    { id: "fallarbor-woods", density: 3, points: [[240, 60], [300, 54], [306, 110], [246, 116]] },
  ],

  mountains: [
    { id: "mt-chimney", name: "Mt. Chimney", density: 3.8, snowCapped: false, points: [[330, 104], [410, 100], [420, 150], [384, 176], [334, 170], [318, 136]] },
    { id: "meteor-falls", name: "Meteor Falls", density: 3, snowCapped: false, points: [[150, 76], [236, 70], [242, 130], [170, 140], [140, 110]] },
    { id: "rusturf-hills", density: 2.4, snowCapped: false, points: [[296, 214], [350, 210], [356, 248], [300, 254]] },
    { id: "victory-road-hoenn", name: "Victory Road", density: 3, snowCapped: false, points: [[920, 378], [962, 380], [970, 420], [936, 440], [912, 416]] },
    { id: "sky-pillar-rock", density: 2, snowCapped: false, points: [[748, 452], [770, 450], [772, 472], [750, 476]] },
    { id: "jagged-ridge", density: 2.6, snowCapped: false, points: [[426, 80], [500, 76], [516, 130], [440, 136]] },
  ],

  routes: [
    { id: "route-101", label: "Route 101", kind: "land", points: [[300, 470], [302, 440], [300, 410]] },
    { id: "route-102", label: "Route 102", kind: "land", points: [[300, 410], [250, 414], [210, 420]] },
    { id: "route-103", label: "Route 103", kind: "land", points: [[300, 410], [304, 380], [300, 356]] },
    { id: "route-104", label: "Route 104", kind: "land", points: [[210, 420], [160, 400], [150, 360], [160, 320], [172, 280], [180, 240]] },
    { id: "route-115", label: "Route 115", kind: "land", points: [[180, 240], [176, 180], [196, 118]] },
    { id: "route-116", label: "Route 116", kind: "land", points: [[180, 240], [240, 234], [298, 236]] },
    { id: "rusturf-tunnel", label: "Rusturf Tunnel", kind: "cave", points: [[298, 236], [326, 244], [350, 252]] },
    { id: "route-117", label: "Route 117", kind: "land", points: [[350, 252], [370, 260], [410, 282], [450, 300]] },
    { id: "route-110", label: "Route 110", kind: "land", points: [[450, 300], [456, 360], [462, 420], [468, 468]] },
    { id: "route-111", label: "Route 111", kind: "land", points: [[450, 300], [452, 240], [456, 180], [456, 120], [452, 84]] },
    { id: "route-112", label: "Route 112", kind: "land", points: [[454, 226], [400, 216], [340, 200]] },
    { id: "jagged-pass", label: "Jagged Pass", kind: "cave", points: [[340, 200], [356, 170], [372, 140]] },
    { id: "route-113", label: "Route 113", kind: "land", points: [[452, 84], [400, 66], [346, 70], [300, 80]] },
    { id: "route-114", label: "Route 114", kind: "land", points: [[300, 80], [250, 94], [196, 112]] },
    { id: "route-118", label: "Route 118", kind: "land", points: [[450, 300], [500, 300], [540, 296]] },
    { id: "route-118-river", label: "Route 118", kind: "water", points: [[540, 296], [566, 290]] },
    { id: "route-119", label: "Route 119", kind: "land", points: [[566, 290], [590, 250], [604, 210], [612, 160], [620, 112]] },
    { id: "route-120", label: "Route 120", kind: "land", points: [[620, 112], [670, 124], [712, 170]] },
    { id: "route-121", label: "Route 121", kind: "land", points: [[712, 170], [750, 162], [780, 150]] },
    { id: "route-122", label: "Route 122", kind: "water", points: [[790, 166], [826, 200], [858, 234]] },
    { id: "route-124-125", label: "Routes 124–125", kind: "water", points: [[800, 140], [850, 132], [902, 158]] },
    { id: "route-126-127", label: "Routes 126–127", kind: "water", points: [[904, 168], [884, 240], [846, 300], [822, 334]] },
    { id: "route-128", label: "Route 128", kind: "water", points: [[850, 346], [900, 384], [936, 410]] },
    { id: "routes-129-131", label: "Routes 129–131", kind: "water", points: [[934, 414], [860, 448], [758, 462], [700, 494], [654, 518]] },
    { id: "routes-132-134", label: "Routes 132–134", kind: "water", points: [[654, 518], [590, 504], [520, 490], [474, 474]] },
    { id: "routes-107-109", label: "Routes 107–109", kind: "water", points: [[468, 472], [420, 536], [330, 556], [250, 558], [180, 562]] },
    { id: "routes-105-106", label: "Routes 105–106", kind: "water", points: [[176, 546], [116, 490], [118, 446], [146, 432]] },
  ],

  labels: [
    { text: "Hoenn Sea", position: [680, 330], size: "lg", style: "water" },
    { text: "Mt. Chimney", position: [372, 192], size: "sm", style: "land" },
    { text: "Desert", position: [468, 160], size: "sm", style: "land" },
    { text: "Route 119", position: [596, 276], size: "sm", style: "land" },
    { text: "Abandoned Ship", position: [400, 560], size: "sm", style: "water" },
    { text: "Shoal Cave", position: [920, 104], size: "sm", style: "water" },
  ],
};
