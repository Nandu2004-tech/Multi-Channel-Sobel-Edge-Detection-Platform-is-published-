import { TestCaseImage } from '../types/sobel';

const WIDTH = 240;
const HEIGHT = 240;

export const TEST_DATASETS: TestCaseImage[] = [
  {
    id: 'isoluminant-red-green',
    name: '1. Isoluminant Red-Green Boundary',
    category: 'Equal Luminance',
    description: 'A sharp vertical boundary between Pure Red and Pure Green engineered to have identical BT.601 perceived luminance (Y ≈ 76).',
    whyItMatters: 'Standard grayscale Sobel converts this to a flat uniform gray (zero gradient), completely missing the visible edge. Multi-channel Sobel detects the crisp boundary.',
    width: WIDTH,
    height: HEIGHT,
    generate: () => {
      const r = new Float32Array(WIDTH * HEIGHT);
      const g = new Float32Array(WIDTH * HEIGHT);
      const b = new Float32Array(WIDTH * HEIGHT);
      const gt = new Array<boolean>(WIDTH * HEIGHT).fill(false);

      // BT.601: Y = 0.299 * R + 0.587 * G + 0.114 * B
      // Color 1: Red = 255, Green = 0, Blue = 0 -> Y = 76.245
      // Color 2: Red = 0, Green = 130, Blue = 0 -> Y = 0.587 * 130 = 76.31
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const idx = y * WIDTH + x;
          if (x < WIDTH / 2) {
            r[idx] = 255;
            g[idx] = 0;
            b[idx] = 0;
          } else {
            r[idx] = 0;
            g[idx] = 130;
            b[idx] = 0;
          }

          if (Math.abs(x - WIDTH / 2) <= 1 && y > 10 && y < HEIGHT - 10) {
            gt[idx] = true;
          }
        }
      }
      return { r, g, b, groundTruth: gt };
    }
  },
  {
    id: 'chromatic-gradient',
    name: '2. Pure Chromatic Gradient (Red to Blue)',
    category: 'Color Shift',
    description: 'Horizontal gradient transitioning from Red to Magenta to Blue while maintaining near-constant total intensity.',
    whyItMatters: 'Tests how the differential operators handle continuous color frequency shifts without discrete luminance jumps.',
    width: WIDTH,
    height: HEIGHT,
    generate: () => {
      const r = new Float32Array(WIDTH * HEIGHT);
      const g = new Float32Array(WIDTH * HEIGHT);
      const b = new Float32Array(WIDTH * HEIGHT);
      const gt = new Array<boolean>(WIDTH * HEIGHT).fill(false);

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const idx = y * WIDTH + x;
          const t = x / (WIDTH - 1);
          r[idx] = Math.round(255 * (1 - t));
          g[idx] = Math.round(40 * Math.sin(t * Math.PI));
          b[idx] = Math.round(255 * t);

          // Add a central color band separator
          if (x === Math.floor(WIDTH / 2)) {
            gt[idx] = true;
          }
        }
      }
      return { r, g, b, groundTruth: gt };
    }
  },
  {
    id: 'equal-luminance-checkers',
    name: '3. Equal-Luminance Checkerboard',
    category: 'Equal Luminance',
    description: 'Alternating tiles of Cyan, Magenta, Yellow, and Orange calibrated to give identical gray values upon conversion.',
    whyItMatters: 'Demonstrates 2D edge cancellation along both X and Y axes in traditional grayscale processing.',
    width: WIDTH,
    height: HEIGHT,
    generate: () => {
      const r = new Float32Array(WIDTH * HEIGHT);
      const g = new Float32Array(WIDTH * HEIGHT);
      const b = new Float32Array(WIDTH * HEIGHT);
      const gt = new Array<boolean>(WIDTH * HEIGHT).fill(false);

      const tileSize = 40;
      // Target Y ≈ 100
      // Color A: (200, 50, 96) -> 0.299*200 + 0.587*50 + 0.114*96 = 59.8 + 29.35 + 10.94 = 100.09
      // Color B: (50, 130, 77) -> 0.299*50 + 0.587*130 + 0.114*77 = 14.95 + 76.31 + 8.78 = 100.04
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const idx = y * WIDTH + x;
          const tileX = Math.floor(x / tileSize);
          const tileY = Math.floor(y / tileSize);
          const isEven = (tileX + tileY) % 2 === 0;

          if (isEven) {
            r[idx] = 200;
            g[idx] = 50;
            b[idx] = 96;
          } else {
            r[idx] = 50;
            g[idx] = 130;
            b[idx] = 77;
          }

          if ((x % tileSize === 0 || y % tileSize === 0) && x > 0 && y > 0 && x < WIDTH && y < HEIGHT) {
            gt[idx] = true;
          }
        }
      }
      return { r, g, b, groundTruth: gt };
    }
  },
  {
    id: 'high-contrast-geometric',
    name: '4. High-Contrast Geometric Shapes',
    category: 'High Contrast',
    description: 'Crisp geometric circles, squares, and triangles with vibrant RGB colors against dark navy backdrop.',
    whyItMatters: 'Verifies standard edge detection capability and confirms multi-channel does not distort normal high-contrast edges.',
    width: WIDTH,
    height: HEIGHT,
    generate: () => {
      const r = new Float32Array(WIDTH * HEIGHT);
      const g = new Float32Array(WIDTH * HEIGHT);
      const b = new Float32Array(WIDTH * HEIGHT);
      const gt = new Array<boolean>(WIDTH * HEIGHT).fill(false);

      // Background navy: 15, 23, 42
      r.fill(15);
      g.fill(23);
      b.fill(42);

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const idx = y * WIDTH + x;
          // Circle at (70, 80) r=40
          const dist1 = Math.hypot(x - 70, y - 80);
          if (dist1 < 40) {
            r[idx] = 239;
            g[idx] = 68;
            b[idx] = 68; // Vibrant Red
          }
          if (Math.abs(dist1 - 40) < 1.5) gt[idx] = true;

          // Square at (140, 40) size 60x60
          if (x >= 140 && x <= 200 && y >= 40 && y <= 100) {
            r[idx] = 34;
            g[idx] = 197;
            b[idx] = 94; // Emerald Green
            if (x === 140 || x === 200 || y === 40 || y === 100) gt[idx] = true;
          }

          // Triangle at bottom
          if (y >= 130 && y <= 210 && Math.abs(x - 120) <= (y - 130) * 0.9) {
            r[idx] = 59;
            g[idx] = 130;
            b[idx] = 246; // Sky Blue
            if (y === 210 || Math.abs(Math.abs(x - 120) - (y - 130) * 0.9) < 1.5) gt[idx] = true;
          }
        }
      }
      return { r, g, b, groundTruth: gt };
    }
  },
  {
    id: 'low-contrast-pastel',
    name: '5. Low-Contrast Subtle Pastel Palette',
    category: 'Low Contrast',
    description: 'Soft blush rose, muted lavender, and mint pastel color patches with faint transitions.',
    whyItMatters: 'Demonstrates multi-channel sensitivity to low-gradient chromatic nuances that fade into noise in grayscale.',
    width: WIDTH,
    height: HEIGHT,
    generate: () => {
      const r = new Float32Array(WIDTH * HEIGHT);
      const g = new Float32Array(WIDTH * HEIGHT);
      const b = new Float32Array(WIDTH * HEIGHT);
      const gt = new Array<boolean>(WIDTH * HEIGHT).fill(false);

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const idx = y * WIDTH + x;
          const cx = Math.floor(x / 80);
          const cy = Math.floor(y / 80);

          if ((cx + cy) % 3 === 0) {
            r[idx] = 244; g[idx] = 214; b[idx] = 218; // Blush Pink
          } else if ((cx + cy) % 3 === 1) {
            r[idx] = 216; g[idx] = 224; b[idx] = 240; // Soft Lavender
          } else {
            r[idx] = 215; g[idx] = 236; b[idx] = 226; // Mint Pastel
          }

          if ((x % 80 === 0 || y % 80 === 0) && x > 0 && y > 0) {
            gt[idx] = true;
          }
        }
      }
      return { r, g, b, groundTruth: gt };
    }
  },
  {
    id: 'complex-natural-foliage',
    name: '6. Complex Foliage & Floral Texture',
    category: 'Complex Texture',
    description: 'Detailed synthetic botanical simulation of red flower blossoms intertwined with green stems and leaves.',
    whyItMatters: 'Tests algorithm behavior on high-frequency organic contours with overlapping chromatic depths.',
    width: WIDTH,
    height: HEIGHT,
    generate: () => {
      const r = new Float32Array(WIDTH * HEIGHT);
      const g = new Float32Array(WIDTH * HEIGHT);
      const b = new Float32Array(WIDTH * HEIGHT);
      const gt = new Array<boolean>(WIDTH * HEIGHT).fill(false);

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const idx = y * WIDTH + x;
          // Organic cellular texture
          const pattern1 = Math.sin(x * 0.1) * Math.cos(y * 0.1);
          const petalDist = Math.hypot(x - 120, y - 120);
          const petalAngle = Math.atan2(y - 120, x - 120);
          const petalRadius = 60 + 20 * Math.sin(petalAngle * 5);

          if (petalDist < petalRadius) {
            // Blossom
            r[idx] = 220 + 20 * Math.sin(petalDist * 0.2);
            g[idx] = 40 + 20 * pattern1;
            b[idx] = 80;
            if (Math.abs(petalDist - petalRadius) < 1.5) gt[idx] = true;
          } else {
            // Leaf foliage
            r[idx] = 30 + 15 * pattern1;
            g[idx] = 140 + 35 * Math.sin(x * 0.05 + y * 0.05);
            b[idx] = 50 + 10 * pattern1;
          }
        }
      }
      return { r, g, b, groundTruth: gt };
    }
  },
  {
    id: 'medical-histology-he',
    name: '7. Medical Histology (H&E Staining)',
    category: 'Microscopy',
    description: 'Hematoxylin (deep blue/purple cell nuclei) and Eosin (pink/red extracellular cytoplasm and stroma).',
    whyItMatters: 'Critical bio-imaging task where distinguishing cell nucleus boundaries from surrounding cytoplasm relies heavily on chromatic contrast rather than luminance.',
    width: WIDTH,
    height: HEIGHT,
    generate: () => {
      const r = new Float32Array(WIDTH * HEIGHT);
      const g = new Float32Array(WIDTH * HEIGHT);
      const b = new Float32Array(WIDTH * HEIGHT);
      const gt = new Array<boolean>(WIDTH * HEIGHT).fill(false);

      // Background Eosin pink stroma: (235, 170, 195)
      r.fill(235);
      g.fill(170);
      b.fill(195);

      // Nuclei centers (Hematoxylin purple: 70, 45, 130)
      const nuclei = [
        { cx: 50, cy: 60, rx: 16, ry: 12 },
        { cx: 120, cy: 50, rx: 14, ry: 18 },
        { cx: 185, cy: 75, rx: 15, ry: 15 },
        { cx: 70, cy: 150, rx: 18, ry: 14 },
        { cx: 140, cy: 135, rx: 16, ry: 16 },
        { cx: 190, cy: 170, rx: 13, ry: 15 },
        { cx: 100, cy: 200, rx: 15, ry: 12 },
      ];

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const idx = y * WIDTH + x;
          for (const n of nuclei) {
            const d = ((x - n.cx) ** 2) / (n.rx ** 2) + ((y - n.cy) ** 2) / (n.ry ** 2);
            if (d <= 1.0) {
              r[idx] = 75;
              g[idx] = 45;
              b[idx] = 135;
            }
            if (Math.abs(d - 1.0) < 0.15) {
              gt[idx] = true;
            }
          }
        }
      }
      return { r, g, b, groundTruth: gt };
    }
  },
  {
    id: 'traffic-sign-foliage',
    name: '8. Urban Stop Sign Against Green Canopy',
    category: 'Autonomous Driving',
    description: 'An octagonal red traffic stop sign embedded in bright green roadside tree canopy.',
    whyItMatters: 'In sunny or shadowed conditions, red signs and green leaves can have nearly identical camera grayscale responses, making multi-channel detection a safety advantage.',
    width: WIDTH,
    height: HEIGHT,
    generate: () => {
      const r = new Float32Array(WIDTH * HEIGHT);
      const g = new Float32Array(WIDTH * HEIGHT);
      const b = new Float32Array(WIDTH * HEIGHT);
      const gt = new Array<boolean>(WIDTH * HEIGHT).fill(false);

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const idx = y * WIDTH + x;
          // Canopy background: Y ≈ 0.587 * 145 = 85.1
          r[idx] = 30 + (x % 7);
          g[idx] = 145 + (y % 5);
          b[idx] = 45;

          // Octagonal Stop Sign at (120, 110) radius 55
          const dx = Math.abs(x - 120);
          const dy = Math.abs(y - 110);
          const isOctagon = dx <= 55 && dy <= 55 && (dx + dy) <= 78;

          if (isOctagon) {
            // Sign Red: Y ≈ 0.299 * 220 = 65.8 + small white border
            r[idx] = 215;
            g[idx] = 30;
            b[idx] = 35;

            // Border
            if (dx >= 52 || dy >= 52 || (dx + dy) >= 74) {
              r[idx] = 255;
              g[idx] = 255;
              b[idx] = 255;
              gt[idx] = true;
            }
          }
        }
      }
      return { r, g, b, groundTruth: gt };
    }
  },
  {
    id: 'chromatic-aberration',
    name: '9. Lens Chromatic Aberration Fringe',
    category: 'Optical Aberration',
    description: 'Sharp black-and-white high contrast step edge with synthetic 1-2px radial chromatic dispersion fringe (red shift left, blue shift right).',
    whyItMatters: 'Crucial for exploring limitations: multi-channel Sobel can split a single physical edge into double or thickened fringes due to color channel misalignment.',
    width: WIDTH,
    height: HEIGHT,
    generate: () => {
      const r = new Float32Array(WIDTH * HEIGHT);
      const g = new Float32Array(WIDTH * HEIGHT);
      const b = new Float32Array(WIDTH * HEIGHT);
      const gt = new Array<boolean>(WIDTH * HEIGHT).fill(false);

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const idx = y * WIDTH + x;
          // Displaced channel steps
          r[idx] = x >= 118 ? 240 : 15;
          g[idx] = x >= 120 ? 240 : 15;
          b[idx] = x >= 122 ? 240 : 15;

          if (x === 120) gt[idx] = true;
        }
      }
      return { r, g, b, groundTruth: gt };
    }
  },
  {
    id: 'noisy-color-edge',
    name: '10. Low-Light Noisy Color Scene',
    category: 'Noise Resilience',
    description: 'Color targets with added independent Gaussian chromatic sensor noise (SNR ~ 18 dB).',
    whyItMatters: 'Shows the critical trade-off: processing 3 channels independently also accumulates 3x the uncorrelated sensor noise unless properly regularized.',
    width: WIDTH,
    height: HEIGHT,
    generate: () => {
      const r = new Float32Array(WIDTH * HEIGHT);
      const g = new Float32Array(WIDTH * HEIGHT);
      const b = new Float32Array(WIDTH * HEIGHT);
      const gt = new Array<boolean>(WIDTH * HEIGHT).fill(false);

      // Seeded deterministic noise
      let seed = 42;
      const pseudoRandom = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed / 2147483647 - 0.5) * 40;
      };

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const idx = y * WIDTH + x;
          const baseR = x < WIDTH / 2 ? 180 : 40;
          const baseG = y < HEIGHT / 2 ? 140 : 50;
          const baseB = (x + y) < WIDTH ? 160 : 30;

          r[idx] = Math.min(255, Math.max(0, baseR + pseudoRandom()));
          g[idx] = Math.min(255, Math.max(0, baseG + pseudoRandom()));
          b[idx] = Math.min(255, Math.max(0, baseB + pseudoRandom()));

          if (x === Math.floor(WIDTH / 2) || y === Math.floor(HEIGHT / 2)) {
            gt[idx] = true;
          }
        }
      }
      return { r, g, b, groundTruth: gt };
    }
  }
];
