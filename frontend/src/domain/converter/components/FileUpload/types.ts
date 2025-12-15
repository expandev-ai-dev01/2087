export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
}
