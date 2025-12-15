import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'] as const;
const JPG_MAGIC_BYTES = [0xff, 0xd8, 0xff];
const PNG_MAGIC_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'O arquivo deve ter no máximo 10MB',
  })
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]),
    {
      message: 'Apenas arquivos JPG/JPEG/PNG são aceitos',
    }
  );

export async function validateJPGHeader(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 3);
      const isValid = JPG_MAGIC_BYTES.every((byte, index) => arr[index] === byte);
      resolve(isValid);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 3));
  });
}

export async function validatePNGHeader(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 8);
      const isValid = PNG_MAGIC_BYTES.every((byte, index) => arr[index] === byte);
      resolve(isValid);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
}

export async function validatePNGChunks(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arr = new Uint8Array(e.target?.result as ArrayBuffer);

        // PNG must start with signature
        if (!PNG_MAGIC_BYTES.every((byte, index) => arr[index] === byte)) {
          resolve(false);
          return;
        }

        // Check for IHDR chunk (must be first chunk after signature)
        const ihdrStart = 8;
        const ihdrType = String.fromCharCode(...arr.slice(ihdrStart + 4, ihdrStart + 8));
        if (ihdrType !== 'IHDR') {
          resolve(false);
          return;
        }

        // Check for IEND chunk (must be present at end)
        const iendSignature = [0x49, 0x45, 0x4e, 0x44]; // "IEND"
        let hasIEND = false;
        for (let i = arr.length - 12; i >= 0; i--) {
          if (iendSignature.every((byte, idx) => arr[i + idx] === byte)) {
            hasIEND = true;
            break;
          }
        }

        resolve(hasIEND);
      } catch {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file);
  });
}

export async function validateImageFile(file: File): Promise<{ isValid: boolean; error?: string }> {
  const isPNG = file.type === 'image/png';
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg';

  if (isPNG) {
    const hasValidHeader = await validatePNGHeader(file);
    if (!hasValidHeader) {
      return {
        isValid: false,
        error: 'Header do arquivo PNG está corrompido',
      };
    }

    const hasValidChunks = await validatePNGChunks(file);
    if (!hasValidChunks) {
      return {
        isValid: false,
        error: 'Estrutura de chunks PNG inválida',
      };
    }
  } else if (isJPG) {
    const hasValidHeader = await validateJPGHeader(file);
    if (!hasValidHeader) {
      return {
        isValid: false,
        error: 'O arquivo não possui estrutura JPG válida',
      };
    }
  }

  return { isValid: true };
}

export type FileInput = z.input<typeof fileSchema>;
export type FileOutput = z.output<typeof fileSchema>;
