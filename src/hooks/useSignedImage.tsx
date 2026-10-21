import { useState, useEffect, useCallback } from 'react';
import { getSignedUrl } from '@/lib/storage';

interface UseSignedImageResult {
  signedUrl: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useSignedImage = (
  bucket: string, 
  path: string | null, 
  expiresIn: number = 3600 // 1 hour default
): UseSignedImageResult => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignedUrl = useCallback(async () => {
    if (!path) {
      setSignedUrl(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await getSignedUrl(bucket, path, expiresIn);
      setSignedUrl(url);
    } catch (err) {
      console.error('Error fetching signed URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to load image');
      setSignedUrl(null);
    } finally {
      setLoading(false);
    }
  }, [bucket, path, expiresIn]);

  const refresh = useCallback(() => {
    fetchSignedUrl();
  }, [fetchSignedUrl]);

  useEffect(() => {
    fetchSignedUrl();
  }, [fetchSignedUrl]);

  // Auto-refresh before expiry (refresh 5 minutes before expiry)
  useEffect(() => {
    if (!signedUrl) return;

    const refreshTime = Math.max((expiresIn - 300) * 1000, 300000); // Min 5 minutes
    const timeout = setTimeout(refresh, refreshTime);

    return () => clearTimeout(timeout);
  }, [signedUrl, expiresIn, refresh]);

  return { signedUrl, loading, error, refresh };
};