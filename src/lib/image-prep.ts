'use client';

import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';

function toFile(blob: Blob, name: string, type: string) {
  return new File([blob], name, { type, lastModified: Date.now() });
}

export async function prepareImageForUpload(file: File): Promise<File> {
  const lowerName = file.name.toLowerCase();
  const isHeicLike =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    lowerName.endsWith('.heic') ||
    lowerName.endsWith('.heif');

  let workingFile = file;

  if (isHeicLike) {
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    const convertedBlob = Array.isArray(converted) ? converted[0] : converted;
    workingFile = toFile(
      convertedBlob as Blob,
      lowerName.replace(/\.heic$|\.heif$/i, '.jpg'),
      'image/jpeg'
    );
  }

  const compressedBlob = await imageCompression(workingFile, {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.82,
    fileType: 'image/jpeg',
  });

  const baseName = workingFile.name.replace(/\.[^.]+$/, '');
  return toFile(compressedBlob, `${baseName}.jpg`, 'image/jpeg');
}