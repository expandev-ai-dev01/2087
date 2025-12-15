import { useRef, useState } from 'react';
import { Upload, FileImage } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Button } from '@/core/components/button';
import type { FileUploadProps } from './types';

function FileUpload({ onFileSelect, disabled = false, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'border-border hover:border-primary/50 flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-transparent p-8 transition-all duration-200',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-destructive bg-destructive/5'
        )}
      >
        <div
          className={cn(
            'bg-muted size-16 flex items-center justify-center rounded-full transition-colors',
            isDragging && 'bg-primary/10',
            error && 'bg-destructive/10'
          )}
        >
          {isDragging ? (
            <FileImage className="text-primary size-8" />
          ) : (
            <Upload
              className={cn('size-8', error ? 'text-destructive' : 'text-muted-foreground')}
            />
          )}
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-foreground text-base font-medium">
            {isDragging ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo JPG ou PNG'}
          </p>
          <p className="text-muted-foreground text-sm">ou</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Selecionar arquivo
          </Button>
        </div>

        <p className="text-muted-foreground text-xs">
          Formatos aceitos: JPG, JPEG, PNG (máx. 10MB)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          aria-label="Selecionar arquivo JPG ou PNG"
        />
      </div>

      {error && (
        <p className="text-destructive text-sm font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { FileUpload };
