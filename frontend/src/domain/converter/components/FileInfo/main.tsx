import { FileImage, X } from 'lucide-react';
import { Button } from '@/core/components/button';
import type { FileInfoProps } from './types';

function FileInfo({ fileName, fileSize, onRemove }: FileInfoProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-muted/50 flex items-center gap-3 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md">
      <div className="bg-primary/10 size-10 flex shrink-0 items-center justify-center rounded-md">
        <FileImage className="text-primary size-5" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-foreground truncate text-sm font-medium">{fileName}</p>
        <p className="text-muted-foreground text-xs">{formatFileSize(fileSize)}</p>
      </div>

      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label="Remover arquivo"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

export { FileInfo };
