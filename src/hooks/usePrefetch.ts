import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Map routes to their data dependencies
const routeDataMap: Record<string, () => Promise<void>> = {
  '/': async () => {
    // Dashboard: prefetch habits, objectives, disciplines
    await Promise.all([
      supabase.from('habits').select('*').limit(10),
      supabase.from('objectives').select('*').limit(5),
      supabase.from('disciplines').select('*').limit(10),
    ]);
  },
  '/estudos': async () => {
    await supabase.from('disciplines').select('*');
  },
  '/cronograma': async () => {
    await supabase.from('schedules').select('*');
  },
  '/treinos': async () => {
    await Promise.all([
      supabase.from('simulados').select('*'),
      supabase.from('flashcard_groups').select('*'),
    ]);
  },
  '/concursos': async () => {
    await Promise.all([
      supabase.from('contests').select('*'),
      supabase.from('simulados').select('*'),
    ]);
  },
  '/cursinhos': async () => {
    await supabase.from('courses').select('*');
  },
  '/financeiro': async () => {
    await Promise.all([
      supabase.from('financial_entries').select('*'),
      supabase.from('fixed_expenses').select('*'),
      supabase.from('piggy_banks').select('*'),
    ]);
  },
  '/objetivos': async () => {
    await supabase.from('objectives').select('*');
  },
  '/banco': async () => {
    await Promise.all([
      supabase.from('link_folders').select('*'),
      supabase.from('link_subfolders').select('*'),
      supabase.from('links').select('*'),
    ]);
  },
  '/habitos': async () => {
    await Promise.all([
      supabase.from('habits').select('*'),
      supabase.from('habit_logs').select('*'),
    ]);
  },
  '/perfil': async () => {
    await supabase.from('user_settings').select('*').maybeSingle();
  },
};

// Cache to prevent multiple prefetches of the same route
const prefetchedRoutes = new Set<string>();

export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchRoute = useCallback((path: string) => {
    // Skip if already prefetched in this session
    if (prefetchedRoutes.has(path)) return;

    const prefetchFn = routeDataMap[path];
    if (prefetchFn) {
      // Mark as prefetched immediately to prevent duplicate calls
      prefetchedRoutes.add(path);
      
      // Execute prefetch in the background (non-blocking)
      prefetchFn().catch(() => {
        // Remove from cache if prefetch fails, allowing retry
        prefetchedRoutes.delete(path);
      });
    }
  }, []);

  const onMouseEnter = useCallback((path: string) => {
    // Use requestIdleCallback for non-blocking prefetch
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => prefetchRoute(path), { timeout: 100 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => prefetchRoute(path), 50);
    }
  }, [prefetchRoute]);

  return { prefetchRoute, onMouseEnter };
}

// Preload component chunks for code splitting
export function preloadComponent(path: string) {
  const componentMap: Record<string, () => Promise<any>> = {
    '/estudos': () => import('@/pages/Estudos'),
    '/cronograma': () => import('@/pages/Cronograma'),
    '/treinos': () => import('@/pages/Treinos'),
    '/concursos': () => import('@/pages/Concursos'),
    '/cursinhos': () => import('@/pages/Cursinhos'),
    '/financeiro': () => import('@/pages/Financeiro'),
    '/objetivos': () => import('@/pages/Objetivos'),
    '/banco': () => import('@/pages/Banco'),
    '/habitos': () => import('@/pages/Habitos'),
    '/perfil': () => import('@/pages/Perfil'),
  };

  const loadFn = componentMap[path];
  if (loadFn) {
    loadFn().catch(() => {});
  }
}
