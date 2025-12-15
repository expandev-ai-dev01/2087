import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg'] as const;
const JPG_MAGIC_BYTES = [0xff, 0xd8, 0xff];

export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'O arquivo deve ter no máximo 10MB',
  })
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]),
    {
      message: 'Apenas arquivos JPG/JPEG são aceitos',
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

export type FileInput = z.input<typeof fileSchema>;
export type FileOutput = z.output<typeof fileSchema>;
