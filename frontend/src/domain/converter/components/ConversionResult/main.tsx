import { Copy, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/core/components/button';
import { Textarea } from '@/core/components/textarea';
import type { ConversionResultProps } from './types';

function ConversionResult({
  base64String,
  onCopy,
  onDownload,
  copySuccess,
}: ConversionResultProps) {
  const formatStringSize = (str: string): string => {
    const length = str.length;
    if (length < 1000) return `${length} caracteres`;
    if (length < 1000000) return `${(length / 1000).toFixed(1)}K caracteres`;
    return `${(length / 1000000).toFixed(2)}M caracteres`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-foreground text-lg font-semibold">Resultado da Conversão</h3>
          <p className="text-muted-foreground text-sm">{formatStringSize(base64String)}</p>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCopy} disabled={copySuccess}>
            {copySuccess ? (
              <>
                <CheckCircle className="size-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copiar
              </>
            )}
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={onDownload}>
            <Download className="size-4" />
            Download TXT
          </Button>
        </div>
      </div>

      <Textarea
        value={base64String}
        readOnly
        className="min-h-[300px] resize-none font-mono text-xs"
        aria-label="String Base64 resultante"
      />
    </div>
  );
}

export { ConversionResult };
