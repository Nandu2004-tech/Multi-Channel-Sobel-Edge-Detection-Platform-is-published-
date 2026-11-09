/**
 * Multi-Channel Sobel Edge Detection Core Engine
 * Implements Grayscale Sobel, Independent RGB Sobel, and Tensor/Vector Fusion
 */

export interface Matrix2D {
  width: number;
  height: number;
  data: Float32Array; // Flattened width * height
}

export function createMatrix(width: number, height: number, initialValue = 0): Matrix2D {
  const data = new Float32Array(width * height);
  if (initialValue !== 0) {
    data.fill(initialValue);
  }
  return { width, height, data };
}

export function getPixel(mat: Matrix2D, x: number, y: number): number {
  if (x < 0) x = 0;
  if (x >= mat.width) x = mat.width - 1;
  if (y < 0) y = 0;
  if (y >= mat.height) y = mat.height - 1;
  return mat.data[y * mat.width + x];
}

export function setPixel(mat: Matrix2D, x: number, y: number, val: number): void {
  if (x >= 0 && x < mat.width && y >= 0 && y < mat.height) {
    mat.data[y * mat.width + x] = val;
  }
}

// 3x3 Standard Sobel Kernels
export const SOBEL_KX = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1]
];

export const SOBEL_KY = [
  [-1, -2, -1],
  [ 0,  0,  0],
  [ 1,  2,  1]
];

/**
 * Standard ITU-R BT.601 Grayscale conversion
 * Y = 0.299 * R + 0.587 * G + 0.114 * B
 */
export function rgbToGrayscaleBT601(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Convolve a single channel matrix with horizontal and vertical Sobel kernels
 */
export function computeSobelGradients(channel: Matrix2D): {
  gx: Matrix2D;
  gy: Matrix2D;
  magnitude: Matrix2D;
  direction: Matrix2D;
} {
  const { width, height } = channel;
  const gx = createMatrix(width, height);
  const gy = createMatrix(width, height);
  const magnitude = createMatrix(width, height);
  const direction = createMatrix(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 3x3 neighborhood convolution
      let sumX = 0;
      let sumY = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const p = getPixel(channel, x + kx, y + ky);
          sumX += p * SOBEL_KX[ky + 1][kx + 1];
          sumY += p * SOBEL_KY[ky + 1][kx + 1];
        }
      }

      setPixel(gx, x, y, sumX);
      setPixel(gy, x, y, sumY);

      const mag = Math.sqrt(sumX * sumX + sumY * sumY);
      setPixel(magnitude, x, y, mag);

      // Gradient direction theta = atan2(Gy, Gx) in radians [-PI, PI]
      const dir = Math.atan2(sumY, sumX);
      setPixel(direction, x, y, dir);
    }
  }

  return { gx, gy, magnitude, direction };
}

export type FusionStrategy = 'dizenzo' | 'euclidean' | 'channel_max';

export interface MultiChannelResult {
  fusedMagnitude: Matrix2D;
  fusedDirection: Matrix2D;
  rMag: Matrix2D;
  gMag: Matrix2D;
  bMag: Matrix2D;
  grayMag: Matrix2D;
  rGrad: { gx: Matrix2D; gy: Matrix2D };
  gGrad: { gx: Matrix2D; gy: Matrix2D };
  bGrad: { gx: Matrix2D; gy: Matrix2D };
  grayGrad: { gx: Matrix2D; gy: Matrix2D };
}

/**
 * Computes both Grayscale Sobel and Multi-Channel Sobel with specified fusion strategy
 */
export function computeMultiChannelSobel(
  r: Matrix2D,
  g: Matrix2D,
  b: Matrix2D,
  strategy: FusionStrategy = 'dizenzo'
): MultiChannelResult {
  const { width, height } = r;

  // 1. Compute Grayscale representation
  const gray = createMatrix(width, height);
  for (let i = 0; i < width * height; i++) {
    gray.data[i] = rgbToGrayscaleBT601(r.data[i], g.data[i], b.data[i]);
  }

  // 2. Compute gradients for Grayscale, R, G, B channels
  const grayGrad = computeSobelGradients(gray);
  const rGrad = computeSobelGradients(r);
  const gGrad = computeSobelGradients(g);
  const bGrad = computeSobelGradients(b);

  const fusedMag = createMatrix(width, height);
  const fusedDir = createMatrix(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rx = getPixel(rGrad.gx, x, y);
      const ry = getPixel(rGrad.gy, x, y);
      const gx = getPixel(gGrad.gx, x, y);
      const gy = getPixel(gGrad.gy, x, y);
      const bx = getPixel(bGrad.gx, x, y);
      const by = getPixel(bGrad.gy, x, y);

      const mR = getPixel(rGrad.magnitude, x, y);
      const mG = getPixel(gGrad.magnitude, x, y);
      const mB = getPixel(bGrad.magnitude, x, y);

      if (strategy === 'channel_max') {
        // Strategy A: Channel Maximum
        // M_fuse = max(M_R, M_G, M_B)
        const maxVal = Math.max(mR, mG, mB);
        setPixel(fusedMag, x, y, maxVal);

        // Direction from dominant channel
        let dominantDir = 0;
        if (maxVal === mR) dominantDir = getPixel(rGrad.direction, x, y);
        else if (maxVal === mG) dominantDir = getPixel(gGrad.direction, x, y);
        else dominantDir = getPixel(bGrad.direction, x, y);
        setPixel(fusedDir, x, y, dominantDir);

      } else if (strategy === 'euclidean') {
        // Strategy B: Euclidean / Frobenius Norm of Gradient Vector
        // M_fuse = sqrt(M_R^2 + M_G^2 + M_B^2) / sqrt(3) (normalized to single channel scale)
        const euc = Math.sqrt((mR * mR + mG * mG + mB * mB) / 3);
        setPixel(fusedMag, x, y, euc);

        // Average vector angle weighted by channel magnitudes
        const avgGx = (rx * mR + gx * mG + bx * mB) / (mR + mG + mB + 1e-6);
        const avgGy = (ry * mR + gy * mG + by * mB) / (mR + mG + mB + 1e-6);
        setPixel(fusedDir, x, y, Math.atan2(avgGy, avgGx));

      } else {
        // Strategy C: Di Zenzo Tensor Formulation (First Fundamental Form)
        // g_xx = (dRx)^2 + (dGx)^2 + (dBx)^2
        // g_yy = (dRy)^2 + (dGy)^2 + (dBy)^2
        // g_xy = dRx*dRy + dGx*dGy + dBx*dBy
        const gxx = rx * rx + gx * gx + bx * bx;
        const gyy = ry * ry + gy * gy + by * by;
        const gxy = rx * ry + gx * gy + bx * by;

        // Maximum Eigenvalue of the 2x2 metric tensor:
        // lambda_max = 0.5 * ( (gxx + gyy) + sqrt((gxx - gyy)^2 + 4 * gxy^2) )
        const term = Math.sqrt((gxx - gyy) * (gxx - gyy) + 4 * gxy * gxy);
        const lambdaMax = 0.5 * (gxx + gyy + term);

        // Rate of maximal color change is sqrt(lambdaMax)
        // Scaled by 1/sqrt(3) for direct comparison with single-channel dynamic range
        const mag = Math.sqrt(lambdaMax / 3);
        setPixel(fusedMag, x, y, mag);

        // Principal eigenvector direction (orientation of maximal rate of change):
        // theta = 0.5 * atan2(2 * gxy, gxx - gyy)
        const theta = 0.5 * Math.atan2(2 * gxy, gxx - gyy);
        setPixel(fusedDir, x, y, theta);
      }
    }
  }

  return {
    fusedMagnitude: fusedMag,
    fusedDirection: fusedDir,
    rMag: rGrad.magnitude,
    gMag: gGrad.magnitude,
    bMag: bGrad.magnitude,
    grayMag: grayGrad.magnitude,
    rGrad,
    gGrad,
    bGrad,
    grayGrad
  };
}

/**
 * Apply binary threshold to a magnitude matrix
 */
export function applyThreshold(mag: Matrix2D, threshold: number): boolean[][] {
  const binary: boolean[][] = [];
  for (let y = 0; y < mag.height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < mag.width; x++) {
      row.push(getPixel(mag, x, y) >= threshold);
    }
    binary.push(row);
  }
  return binary;
}

/**
 * Counts the number of active edge pixels in a binary edge map
 */
export function countEdgePixels(binaryMap: boolean[][]): number {
  let count = 0;
  for (let y = 0; y < binaryMap.length; y++) {
    for (let x = 0; x < binaryMap[y].length; x++) {
      if (binaryMap[y][x]) count++;
    }
  }
  return count;
}

/**
 * Evaluates binary edge map against a ground truth edge map
 */
export function evaluatePrecisionRecallF1(
  detected: boolean[][],
  groundTruth: boolean[][]
): {
  precision: number;
  recall: number;
  f1: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
} {
  let tp = 0;
  let fp = 0;
  let fn = 0;

  const h = detected.length;
  const w = detected[0].length;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = detected[y][x];
      const g = groundTruth[y][x];

      if (d && g) tp++;
      else if (d && !g) fp++;
      else if (!d && g) fn++;
    }
  }

  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return { precision, recall, f1, truePositives: tp, falsePositives: fp, falseNegatives: fn };
}
