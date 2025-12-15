import { useState } from 'react';
import { converterService } from '../../services/converterService';
import { useConverterStore } from '../../stores/converterStore';
import type { ConversionResult } from '../../types/models';

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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Falha ao processar o arquivo. Tente novamente';
      setStatus({ status: 'error', error: errorMessage });
    }
  };

  const handleCopy = async () => {
    if (!result?.base64String) return;

    const success = await converterService.copyToClipboard(result.base64String);

    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      setStatus({
        status: 'error',
        error: 'Não foi possível copiar para a área de transferência',
      });
    }
  };

  const handleDownload = () => {
    if (!result?.base64String || !result?.fileName) return;
    converterService.downloadAsTxt(result.base64String, result.fileName);
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
