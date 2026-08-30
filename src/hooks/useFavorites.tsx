import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'favorites';

const readLocalFavorites = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
};

const writeLocalFavorites = (ids: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

/**
 * Favorites are persisted to Supabase (table `favorites`) for logged-in
 * users, so they follow the account across devices. Signed-out visitors
 * still get a working favorite button backed by localStorage only.
 */
export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setFavorites(readLocalFavorites());
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Error loading favorites:', error);
          setFavorites([]);
        } else {
          setFavorites((data ?? []).map((row) => row.product_id.toString()));
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleFavorite = useCallback(
    async (productId: string) => {
      const currentlyFavorite = favorites.includes(productId);

      if (!user) {
        const next = currentlyFavorite
          ? favorites.filter((id) => id !== productId)
          : [...favorites, productId];
        setFavorites(next);
        writeLocalFavorites(next);
        return;
      }

      // Optimistic update; rolled back if the write fails.
      const next = currentlyFavorite
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];
      setFavorites(next);

      const { error } = currentlyFavorite
        ? await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', Number(productId))
        : await supabase
            .from('favorites')
            .insert({ user_id: user.id, product_id: Number(productId) });

      if (error) {
        console.error('Error toggling favorite:', error);
        setFavorites(favorites); // revert
      }
    },
    [favorites, user]
  );

  const isFavorite = (productId: string) => favorites.includes(productId);

  return { favorites, toggleFavorite, isFavorite, loading };
};
