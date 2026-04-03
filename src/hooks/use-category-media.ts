import { useState, useEffect, useRef, startTransition } from 'react';

interface MediaEntry {
  readonly key: string;
  readonly url: string;
}

interface UseCategoryMediaResult {
  readonly items: readonly MediaEntry[];
  readonly loading: boolean;
  readonly error: string | null;
}

const cache = new Map<string, readonly MediaEntry[]>();

export function useCategoryMedia(
  type: 'video' | 'photo',
  slug: string,
  enabled: boolean,
): UseCategoryMediaResult {
  const [items, setItems] = useState<readonly MediaEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const cacheKey = `${type}/${slug}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      startTransition(() => {
        setItems(cached);
        setLoading(false);
      });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    startTransition(() => {
      setLoading(true);
      setError(null);
    });

    fetch(`/api/media?type=${type}&category=${slug}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<{ items: MediaEntry[] }>;
      })
      .then((data) => {
        cache.set(cacheKey, data.items);
        setItems(data.items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load media');
        setLoading(false);
      });

    return () => controller.abort();
  }, [type, slug, enabled]);

  return { items, loading, error };
}
