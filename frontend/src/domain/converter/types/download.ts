export interface DownloadResult {
  success: boolean;
  fileName?: string;
  fileSizeBytes?: number;
  error?: string;
}

export interface DownloadStatus {
  status: 'pending' | 'validating' | 'generating' | 'downloading' | 'completed' | 'error';
  error?: string;
}

export interface DownloadConfig {
  base64Content: string;
  fileName: string;
  fileEncoding: 'UTF-8';
  mimeType: 'text/plain';
  fileSizeBytes: number;
}
