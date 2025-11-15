'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch real-time prices from Warden oracle
 */
export function usePrices(pairs: string[]) {
  return useQuery({
    queryKey: ['prices', pairs],
    queryFn: async () => {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      return response.json() as Promise<Record<string, number>>;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000,
  });
}

