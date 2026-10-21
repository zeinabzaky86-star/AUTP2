import { supabase } from '@/integrations/supabase/client';

/**
 * Get a signed URL for a file in Supabase storage
 * @param bucket - The storage bucket name
 * @param path - The file path in the bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise<string | null> - The signed URL or null if error
 */
export const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }
};

/**
 * Get signed URLs for multiple files
 * @param bucket - The storage bucket name
 * @param paths - Array of file paths
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise<Record<string, string | null>> - Object mapping paths to signed URLs
 */
export const getSignedUrls = async (
  bucket: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<Record<string, string | null>> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls(paths, expiresIn);

    if (error) {
      console.error('Error creating signed URLs:', error);
      return {};
    }

    const result: Record<string, string | null> = {};
    data.forEach((item) => {
      result[item.path] = item.signedUrl;
    });

    return result;
  } catch (error) {
    console.error('Error creating signed URLs:', error);
    return {};
  }
};

/**
 * Extract just the file path from a full storage URL
 * @param fullUrl - The full storage URL (public or signed)
 * @returns string - Just the file path
 */
export function extractStoragePath(fullUrl: string): string {
  if (!fullUrl) return '';
  
  // Handle both public URLs and signed URLs
  const urlParts = fullUrl.split('/');
  const bucketIndex = urlParts.findIndex(part => part === 'object');
  
  if (bucketIndex !== -1 && bucketIndex + 2 < urlParts.length) {
    // For URLs like: .../storage/v1/object/public/bucket/path/file.jpg
    return urlParts.slice(bucketIndex + 3).join('/');
  }
  
  // Fallback: assume the path is after the last occurrence of a bucket name
  const pathMatch = fullUrl.match(/\/([^\/]+\/[^?]+)(\?|$)/);
  return pathMatch ? pathMatch[1] : fullUrl;
}