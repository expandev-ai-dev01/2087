import type { ConversionResult, ConversionStatus } from '../../types/models';

export interface UseConverterReturn {
  file: File | null;
  result: ConversionResult | null;
  status: ConversionStatus;
  copySuccess: boolean;
  handleFileSelect: (file: File | null) => Promise<void>;
  handleConvert: () => Promise<void>;
  handleCopy: () => Promise<void>;
  handleDownload: () => void;
  handleReset: () => void;
}
