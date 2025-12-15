import DOMPurify from 'dompurify';
import type { ConversionResult, FileValidation } from '../types/models';
import { fileSchema, validateJPGHeader } from '../validations/file';

/**
 * @service ConverterService
 * @domain converter
 * @type Client-side service for JPG to Base64 conversion
 */
export const converterService = {
  /**
   * Validates a file against JPG requirements
   */
  async validateFile(file: File): Promise<FileValidation> {
    try {
      // Zod validation
      fileSchema.parse(file);

      // Magic bytes validation
      const hasValidHeader = await validateJPGHeader(file);
      if (!hasValidHeader) {
        return {
          isValid: false,
          error: 'O arquivo não possui estrutura JPG válida',
        };
      }

      return { isValid: true };
    } catch (error) {
      if (error instanceof Error) {
        return {
          isValid: false,
          error: error.message,
        };
      }
      return {
        isValid: false,
        error: 'Não foi possível validar o arquivo',
      };
    }
  },

  /**
   * Converts a JPG file to Base64 string
   */
  async convertToBase64(file: File): Promise<ConversionResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const base64String = reader.result as string;
          const sanitizedFileName = DOMPurify.sanitize(file.name);

          resolve({
            base64String,
            fileName: sanitizedFileName,
            fileSize: file.size,
            timestamp: new Date(),
          });
        } catch (error) {
          reject(new Error('Falha ao processar o arquivo. Tente novamente'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Não foi possível ler o arquivo selecionado'));
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * Copies text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  },

  /**
   * Downloads Base64 result as TXT file
   */
  downloadAsTxt(base64String: string, originalFileName: string): void {
    const blob = new Blob([base64String], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = originalFileName.replace(/\.[^/.]+$/, '') + '_base64.txt';

    link.href = url;
    link.download = DOMPurify.sanitize(fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
