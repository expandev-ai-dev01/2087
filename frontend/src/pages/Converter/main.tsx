import { useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/core/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/components/card';
import { Alert, AlertDescription } from '@/core/components/alert';
import { useConverter } from '@/domain/converter/hooks/useConverter';
import { FileUpload } from '@/domain/converter/components/FileUpload';
import { FileInfo } from '@/domain/converter/components/FileInfo';
import { ConversionResult } from '@/domain/converter/components/ConversionResult';

function ConverterPage() {
  const {
    file,
    result,
    status,
    copySuccess,
    handleFileSelect,
    handleConvert,
    handleCopy,
    handleDownload,
    handleReset,
  } = useConverter();

  useEffect(() => {
    document.title = 'Convert64 - Conversor JPG/PNG para Base64';
  }, []);

  const isProcessing = status.status === 'validating' || status.status === 'converting';
  const hasError = status.status === 'error';
  const isCompleted = status.status === 'completed';
  const canConvert = file && !isProcessing && !hasError && !isCompleted;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 py-8">
      <header className="space-y-2 text-center">
        <h1 className="text-primary text-4xl font-bold tracking-tight">Convert64</h1>
        <p className="text-muted-foreground text-lg">Conversor de JPG/PNG para Base64</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
          <CardDescription>
            Selecione ou arraste um arquivo JPG ou PNG para converter em Base64
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!file && (
            <FileUpload
              onFileSelect={handleFileSelect}
              disabled={isProcessing}
              error={hasError ? status.error : undefined}
            />
          )}

          {file && !isCompleted && (
            <div className="space-y-4">
              <FileInfo fileName={file.name} fileSize={file.size} onRemove={handleReset} />

              {hasError && status.error && (
                <Alert variant="destructive">
                  <AlertDescription>{status.error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button onClick={handleConvert} disabled={!canConvert} className="flex-1">
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {status.status === 'validating' ? 'Validando...' : 'Convertendo...'}
                    </>
                  ) : (
                    'Converter para Base64'
                  )}
                </Button>

                <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                  <RefreshCw className="size-4" />
                  Limpar
                </Button>
              </div>
            </div>
          )}

          {isCompleted && result && (
            <div className="space-y-4">
              <FileInfo fileName={result.fileName} fileSize={result.fileSize} />

              <ConversionResult
                base64String={result.base64String}
                onCopy={handleCopy}
                onDownload={handleDownload}
                copySuccess={copySuccess}
              />

              <Button variant="outline" onClick={handleReset} className="w-full">
                <RefreshCw className="size-4" />
                Converter Outro Arquivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="text-muted-foreground text-center text-sm">
        <p>
          Conversão realizada localmente no seu navegador. Seus arquivos não são enviados para
          nenhum servidor.
        </p>
      </footer>
    </div>
  );
}

export { ConverterPage };
