'use client';

/**
 * Identity Document Upload - AMU Platform
 *
 * Client-side document upload to Firebase Storage.
 * Implements secure upload for identity documents (Section 10.3).
 *
 * Security measures:
 * - Files stored in user-specific paths
 * - File type validation
 * - Size limits enforced
 * - Secure download URLs generated
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTask,
} from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import type { DocumentType } from './types';

/**
 * Maximum file size (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed MIME types
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];

/**
 * Upload progress callback
 */
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  state: 'running' | 'paused' | 'success' | 'error';
}

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  downloadUrl?: string;
  storagePath?: string;
  error?: string;
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed',
    };
  }

  return { valid: true };
}

/**
 * Upload identity document to Firebase Storage
 */
export async function uploadIdentityDocument(
  userId: string,
  documentType: DocumentType | 'proof_of_residence',
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Generate storage path
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const storagePath = `identity-documents/${userId}/${documentType}_${timestamp}.${fileExtension}`;

  try {
    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Start upload
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        userId,
        documentType,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Return promise that resolves when upload completes
    return new Promise((resolve) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Handle progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress: Math.round(progress),
            state: snapshot.state as 'running' | 'paused' | 'success' | 'error',
          });
        },
        (error) => {
          // Handle error
          console.error('Upload error:', error);
          resolve({
            success: false,
            error: getUploadErrorMessage(error.code),
          });
        },
        async () => {
          // Handle success
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              downloadUrl,
              storagePath,
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Failed to get download URL',
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload initialization error:', error);
    return {
      success: false,
      error: 'Failed to start upload',
    };
  }
}

/**
 * Get user-friendly error message from Firebase Storage error code
 */
function getUploadErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'storage/unauthorized':
      return 'You do not have permission to upload files';
    case 'storage/canceled':
      return 'Upload was cancelled';
    case 'storage/quota-exceeded':
      return 'Storage quota exceeded. Please contact support';
    case 'storage/retry-limit-exceeded':
      return 'Upload failed after multiple retries. Please try again';
    case 'storage/invalid-checksum':
      return 'File was corrupted during upload. Please try again';
    case 'storage/server-file-wrong-size':
      return 'File size mismatch. Please try again';
    default:
      return 'Upload failed. Please try again';
  }
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'application/pdf':
      return 'pdf';
    default:
      return 'file';
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
