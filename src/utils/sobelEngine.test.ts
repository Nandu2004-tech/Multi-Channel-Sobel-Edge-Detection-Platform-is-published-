import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMatrix,
  setPixel,
  getPixel,
  rgbToGrayscaleBT601,
  computeSobelGradients,
  computeMultiChannelSobel,
  applyThreshold,
  countEdgePixels,
  evaluatePrecisionRecallF1
} from './sobelEngine';

test('rgbToGrayscaleBT601 correctly applies NTSC/ITU-R BT.601 weights', () => {
  // Pure Red: 0.299 * 255 = 76.245
  assert.ok(Math.abs(rgbToGrayscaleBT601(255, 0, 0) - 76.245) < 0.01);
  // Pure Green: 0.587 * 255 = 149.685
  assert.ok(Math.abs(rgbToGrayscaleBT601(0, 255, 0) - 149.685) < 0.01);
  // Pure Blue: 0.114 * 255 = 29.07
  assert.ok(Math.abs(rgbToGrayscaleBT601(0, 0, 255) - 29.07) < 0.01);
  // Neutral Gray: 128, 128, 128
  assert.ok(Math.abs(rgbToGrayscaleBT601(128, 128, 128) - 128) < 0.01);
});

test('computeSobelGradients detects vertical step edge with Gx', () => {
  // Create 5x5 image with vertical edge down the middle: left side 0, right side 100
  const mat = createMatrix(5, 5);
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      setPixel(mat, x, y, x >= 2 ? 100 : 0);
    }
  }

  const { gx, gy, magnitude, direction } = computeSobelGradients(mat);

  // At column 1 (just before edge) or column 2 (edge), Gx should be strongly positive
  const edgeGx = getPixel(gx, 2, 2);
  const edgeGy = getPixel(gy, 2, 2);
  const edgeMag = getPixel(magnitude, 2, 2);

  assert.ok(edgeGx > 0, `Expected positive Gx on vertical edge, got ${edgeGx}`);
  // Since edge is purely vertical, Gy should be zero
  assert.equal(edgeGy, 0, `Expected Gy = 0 on vertical edge, got ${edgeGy}`);
  assert.ok(edgeMag > 50, `Expected strong magnitude on step edge, got ${edgeMag}`);
  // Direction theta = atan2(Gy, Gx) = atan2(0, positive) = 0
  assert.equal(getPixel(direction, 2, 2), 0);
});

test('ISOLUMINANT COLOR EDGE EXPERIMENT: Grayscale fails while Multi-Channel succeeds', () => {
  // Let Left side be Red (149, 0, 0) -> BT.601 Y = 0.299 * 149 = 44.551
  // Let Right side be Green (0, 76, 0) -> BT.601 Y = 0.587 * 76 = 44.612
  // Luminance difference across the boundary: |44.551 - 44.612| = 0.061 (virtually zero!)
  const width = 6;
  const height = 6;
  const rMat = createMatrix(width, height);
  const gMat = createMatrix(width, height);
  const bMat = createMatrix(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < 3) {
        // Red pixel
        setPixel(rMat, x, y, 149);
        setPixel(gMat, x, y, 0);
        setPixel(bMat, x, y, 0);
      } else {
        // Green pixel with equal perceived luminance
        setPixel(rMat, x, y, 0);
        setPixel(gMat, x, y, 76);
        setPixel(bMat, x, y, 0);
      }
    }
  }

  // Compute multi-channel Sobel with Di Zenzo tensor fusion
  const resultDiZenzo = computeMultiChannelSobel(rMat, gMat, bMat, 'dizenzo');
  const resultEuclidean = computeMultiChannelSobel(rMat, gMat, bMat, 'euclidean');
  const resultMax = computeMultiChannelSobel(rMat, gMat, bMat, 'channel_max');

  // Check edge center at x=3, y=3
  const grayMagAtEdge = getPixel(resultDiZenzo.grayMag, 3, 3);
  const diZenzoMagAtEdge = getPixel(resultDiZenzo.fusedMagnitude, 3, 3);
  const eucMagAtEdge = getPixel(resultEuclidean.fusedMagnitude, 3, 3);
  const maxMagAtEdge = getPixel(resultMax.fusedMagnitude, 3, 3);

  // In grayscale, the magnitude is negligible (less than 1)
  assert.ok(
    grayMagAtEdge < 1.0,
    `Grayscale magnitude should be near zero on isoluminant edge, got ${grayMagAtEdge}`
  );

  // In Multi-channel, the magnitude is very high (> 100) because R and G channels have huge gradients
  assert.ok(
    diZenzoMagAtEdge > 100,
    `Di Zenzo magnitude should be high on isoluminant edge, got ${diZenzoMagAtEdge}`
  );
  assert.ok(
    eucMagAtEdge > 100,
    `Euclidean magnitude should be high on isoluminant edge, got ${eucMagAtEdge}`
  );
  assert.ok(
    maxMagAtEdge > 100,
    `Channel-Max magnitude should be high on isoluminant edge, got ${maxMagAtEdge}`
  );
});

test('evaluatePrecisionRecallF1 computes exact statistics', () => {
  const detected = [
    [true, true, false],
    [false, true, false],
    [false, false, false]
  ];
  const groundTruth = [
    [true, false, false],
    [false, true, false],
    [false, true, false]
  ];

  // tp: (0,0) and (1,1) -> 2
  // fp: (0,1) -> 1
  // fn: (2,1) -> 1
  const metrics = evaluatePrecisionRecallF1(detected, groundTruth);

  assert.equal(metrics.truePositives, 2);
  assert.equal(metrics.falsePositives, 1);
  assert.equal(metrics.falseNegatives, 1);
  // Precision = 2 / (2 + 1) = 0.6666...
  assert.ok(Math.abs(metrics.precision - 2 / 3) < 0.001);
  // Recall = 2 / (2 + 1) = 0.6666...
  assert.ok(Math.abs(metrics.recall - 2 / 3) < 0.001);
  // F1 = 2 * (2/3 * 2/3) / (4/3) = 2/3
  assert.ok(Math.abs(metrics.f1 - 2 / 3) < 0.001);
});

test('applyThreshold and countEdgePixels correctly binarize matrix', () => {
  const mat = createMatrix(3, 3);
  setPixel(mat, 0, 0, 50);
  setPixel(mat, 1, 1, 120);
  setPixel(mat, 2, 2, 200);

  const bin50 = applyThreshold(mat, 50);
  assert.equal(countEdgePixels(bin50), 3);

  const bin100 = applyThreshold(mat, 100);
  assert.equal(countEdgePixels(bin100), 2);

  const bin150 = applyThreshold(mat, 150);
  assert.equal(countEdgePixels(bin150), 1);
});
