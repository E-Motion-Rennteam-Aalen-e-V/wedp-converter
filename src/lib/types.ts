export type OutputFormat = "webp" | "png" | "jpeg";

export type ItemStatus = "queued" | "processing" | "done" | "error";

export interface ResizeSettings {
  enabled: boolean;
  width: number | null;
  height: number | null;
  maintainAspect: boolean;
}

export interface ConversionSettings {
  outputFormat: OutputFormat;
  quality: number; // 1-100
  resize: ResizeSettings;
}

export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  status: ItemStatus;
  error?: string;
  originalSize: number;
  resultBlob?: Blob;
  resultSize?: number;
  resultWidth?: number;
  resultHeight?: number;
}

export interface WorkerRequest {
  id: string;
  buffer: ArrayBuffer;
  mimeType: string;
  fileName: string;
  outputFormat: OutputFormat;
  quality: number;
  resize: ResizeSettings;
}

export type WorkerResponse =
  | {
      id: string;
      ok: true;
      blob: Blob;
      width: number;
      height: number;
    }
  | {
      id: string;
      ok: false;
      error: string;
    };

export const ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const ACCEPTED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".svg",
  ".webp",
  ".heic",
  ".heif",
];
