export interface ConversionResult {
  base64String: string;
  fileName: string;
  fileSize: number;
  timestamp: Date;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

export interface ConversionStatus {
  status: 'idle' | 'validating' | 'converting' | 'completed' | 'error';
  progress?: number;
  error?: string;
}
