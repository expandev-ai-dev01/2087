import { useState } from 'react';
import { converterService } from '../../services/converterService';
import { useConverterStore } from '../../stores/converterStore';
import type { ConversionResult } from '../../types/models';
import { toast } from 'sonner';

export const useConverter = () => {
  const { file, result, status, setFile, setResult, setStatus, reset } = useConverterStore();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      setResult(null);
      setStatus({ status: 'idle' });
      return;
    }

    setFile(selectedFile);
    setStatus({ status: 'validating' });

    const validation = await converterService.validateFile(selectedFile);

    if (!validation.isValid) {
      setStatus({ status: 'error', error: validation.error });
      return;
    }

    setStatus({ status: 'idle' });
  };

  const handleConvert = async () => {
    if (!file) {
      setStatus({ status: 'error', error: 'Nenhum arquivo selecionado' });
      return;
    }

    setStatus({ status: 'converting' });

    try {
      const conversionResult: ConversionResult = await converterService.convertToBase64(file);
      setResult(conversionResult);
      setStatus({ status: 'completed' });
      toast.success('Conversão concluída com sucesso!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Falha ao processar o arquivo. Tente novamente';
      setStatus({ status: 'error', error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleCopy = async () => {
    if (!result?.base64String) return;

    const success = await converterService.copyToClipboard(result.base64String);

    if (success) {
      setCopySuccess(true);
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      toast.error('Não foi possível copiar para a área de transferência');
    }
  };

  const handleDownload = async () => {
    if (!result?.base64String) return;

    try {
      await converterService.downloadAsTxt(result.base64String);
      toast.success('Download iniciado com sucesso!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Não foi possível iniciar o download do arquivo';
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    reset();
    setCopySuccess(false);
  };

  return {
    file,
    result,
    status,
    copySuccess,
    handleFileSelect,
    handleConvert,
    handleCopy,
    handleDownload,
    handleReset,
  };
};
