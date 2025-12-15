export interface ConversionResultProps {
  base64String: string;
  onCopy: () => void;
  onDownload: () => void;
  copySuccess: boolean;
}
