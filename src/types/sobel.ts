export interface TestCaseImage {
  id: string;
  name: string;
  category: string;
  description: string;
  whyItMatters: string;
  width: number;
  height: number;
  generate: () => {
    r: Float32Array;
    g: Float32Array;
    b: Float32Array;
    groundTruth?: boolean[];
  };
}

export type TabId = 'mentor' | 'lab' | 'playground' | 'benchmark' | 'code' | 'docs';

export interface BenchmarkResult {
  datasetId: string;
  datasetName: string;
  category: string;
  traditionalPixels: number;
  multiChannelPixels: number;
  missedPixels: number;
  missedPercentage: number;
  precisionTraditional: number;
  recallTraditional: number;
  f1Traditional: number;
  precisionMulti: number;
  recallMulti: number;
  f1Multi: number;
  timeTraditionalMs: number;
  timeMultiMs: number;
}
