import DOMPurify from 'dompurify';
import type { DownloadResult, DownloadStatus } from '../types/download';

/**
 * @service DownloadService
 * @domain converter
 * @type Client-side service for Base64 TXT file download with automatic generation
 */
export const downloadService = {
  /**
   * Validates Base64 string before download
   */
  validateBase64(base64String: string): { isValid: boolean; error?: string } {
    if (!base64String || base64String.trim().length === 0) {
      return {
        isValid: false,
        error: 'Não há conteúdo Base64 para download',
      };
    }

    // Clean formatting characters
    const cleaned = base64String.replace(/[\s\n\r]/g, '');

    // Check for valid Base64 characters
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(cleaned)) {
      return {
        isValid: false,
        error: 'String Base64 contém caracteres inválidos',
      };
    }

    // Check completeness (proper padding)
    if (cleaned.length % 4 !== 0) {
      return {
        isValid: false,
        error: 'String Base64 está incompleta, verifique se a conversão foi finalizada',
      };
    }

    // Check size limit (10MB)
    const sizeInBytes = new Blob([cleaned]).size;
    if (sizeInBytes > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'Arquivo excede o limite de 10MB, não é possível gerar',
      };
    }

    return { isValid: true };
  },

  /**
   * Cleans Base64 string by removing formatting characters
   */
  cleanBase64String(base64String: string): string {
    return base64String.replace(/[\s\n\r]/g, '');
  },

  /**
   * Generates unique timestamp-based filename
   */
  generateFileName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    return `base64_conversion_${year}${month}${day}_${hours}${minutes}${seconds}_${milliseconds}.txt`;
  },

  /**
   * Detects browser compatibility for automatic download
   */
  detectBrowserCompatibility(): 'compatible' | 'partial' | 'incompatible' {
    try {
      // Check for Blob support
      if (typeof Blob === 'undefined') {
        return 'incompatible';
      }

      // Check for URL.createObjectURL support
      if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
        return 'incompatible';
      }

      // Check for download attribute support
      const a = document.createElement('a');
      if (typeof a.download === 'undefined') {
        return 'partial';
      }

      return 'compatible';
    } catch {
      return 'incompatible';
    }
  },

  /**
   * Downloads Base64 string as TXT file with automatic generation
   */
  async downloadBase64AsTxt(
    base64String: string,
    onStatusChange?: (status: DownloadStatus) => void
  ): Promise<DownloadResult> {
    try {
      // Update status: validating
      onStatusChange?.({ status: 'validating' });

      // Validate Base64 string
      const validation = this.validateBase64(base64String);
      if (!validation.isValid) {
        onStatusChange?.({ status: 'error', error: validation.error });
        return {
          success: false,
          error: validation.error,
        };
      }

      // Clean Base64 string
      const cleanedBase64 = this.cleanBase64String(base64String);

      // Calculate file size
      const fileSizeBytes = new Blob([cleanedBase64]).size;

      // Update status: generating
      onStatusChange?.({ status: 'generating' });

      // Generate unique filename
      const fileName = this.generateFileName();

      // Check browser compatibility
      const compatibility = this.detectBrowserCompatibility();

      if (compatibility === 'incompatible') {
        onStatusChange?.({
          status: 'error',
          error:
            'Seu navegador não suporta download automático. O conteúdo será exibido em nova aba para cópia manual',
        });

        // Fallback: open in new tab
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(
            `<pre style="word-wrap: break-word; white-space: pre-wrap;">${DOMPurify.sanitize(
              cleanedBase64
            )}</pre>`
          );
          newWindow.document.close();
        }

        return {
          success: false,
          error:
            'Seu navegador não suporta download automático. O conteúdo foi aberto em nova aba.',
        };
      }

      // Update status: downloading
      onStatusChange?.({ status: 'downloading' });

      // Create blob with UTF-8 encoding
      const blob = new Blob([cleanedBase64], { type: 'text/plain;charset=utf-8' });

      // Generate temporary URL
      const url = URL.createObjectURL(blob);

      // Create temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = DOMPurify.sanitize(fileName);
      link.style.display = 'none';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke URL after 30 seconds
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 30000);

      // Update status: completed
      onStatusChange?.({ status: 'completed' });

      return {
        success: true,
        fileName,
        fileSizeBytes,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha ao gerar arquivo TXT';

      onStatusChange?.({ status: 'error', error: errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};
