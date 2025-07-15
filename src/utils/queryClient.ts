import { QueryClient } from '@tanstack/react-query';

// Configuration identique au site web
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (nouveau nom pour cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});