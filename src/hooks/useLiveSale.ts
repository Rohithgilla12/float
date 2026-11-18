import { useEffect, useState } from 'react';
import { BLACK_FRIDAY, Sale, saleIsLive } from '../data/sale';

/**
 * Resolves after mount so the prerendered HTML never carries a sale that was live, or not, at build time.
 * `?sale=preview` forces it on for review before the start date.
 */
export function useLiveSale(): Sale | null {
  const [live, setLive] = useState(false);
  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get('sale') === 'preview';
    setLive(preview || saleIsLive(new Date()));
  }, []);
  return live ? BLACK_FRIDAY : null;
}
