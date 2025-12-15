import DOMPurify from 'dompurify';
import type { ConversionResult, FileValidation } from '../types/models';
import { fileSchema, validateImageFile } from '../validations/file';
import { downloadService } from './downloadService';

/**
 * @service ConverterService
 * @domain converter
 * @type Client-side service for JPG/PNG to Base64 conversion
 */
export const converterService = {
  /**
   * Validates a file against JPG/PNG requirements
   */
  async validateFile(file: File): Promise<FileValidation> {
    try {
      // Zod validation
      fileSchema.parse(file);

      // Format-specific validation
      const validation = await validateImageFile(file);
      if (!validation.isValid) {
        return {
          isValid: false,
          error: validation.error || 'Arquivo inválido',
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
   * Converts a JPG/PNG file to Base64 string
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
   * Downloads Base64 result as TXT file with automatic generation
   */
  async downloadAsTxt(base64String: string): Promise<void> {
    const result = await downloadService.downloadBase64AsTxt(base64String);

    if (!result.success && result.error) {
      throw new Error(result.error);
    }
  },
};
