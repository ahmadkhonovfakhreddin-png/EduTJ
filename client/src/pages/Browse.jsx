import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Layout } from '../components/Layout';
import { CenterCard } from '../components/CenterCard';
import { CardSkeleton } from '../components/Skeleton';
import { CATEGORY_OPTIONS, CITIES } from '../constants';
import { api } from '../api/client';

export function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [centers, setCenters] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');

  const city = searchParams.get('city') || 'all';
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const minRating = searchParams.get('minRating') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city !== 'all') params.set('city', city);
      if (category !== 'all') params.set('category', category);
      if (search.trim()) params.set('search', search.trim());
      params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '12');
      if (minRating) params.set('minRating', minRating);
      if (maxPrice) params.set('maxPrice', maxPrice);
      const data = await api(`/api/centers?${params}`);
      setCenters(data.centers || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch {
      setCenters([]);
    } finally {
      setLoading(false);
    }
  }, [city, category, search, sort, page, minRating, maxPrice]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900">Browse centers</h1>
        <p className="mt-1 text-slate-600">Filter by location, subject, and more.</p>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row">
          <aside className="lg:w-64 shrink-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 h-fit lg:sticky lg:top-24">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">City</label>
              <select
                value={city}
                onChange={(e) => setParam('city', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="all">All cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Category</label>
              <select
                value={category}
                onChange={(e) => setParam('category', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="all">All categories</option>
                {CATEGORY_OPTIONS.filter((c) => c.value !== 'all').map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Min rating</label>
              <select
                value={minRating}
                onChange={(e) => setParam('minRating', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Any</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Max price (TJS)</label>
              <input
                type="number"
                placeholder="e.g. 1000"
                value={maxPrice}
                onChange={(e) => setParam('maxPrice', e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              className="w-full text-center text-sm text-primary hover:underline"
              onClick={() => setSearchParams(new URLSearchParams())}
            >
              Clear filters
            </button>
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    const v = localSearch.trim();
                    const next = new URLSearchParams(searchParams);
                    if (v) next.set('search', v);
                    else next.delete('search');
                    next.delete('page');
                    setSearchParams(next);
                  }}
                  placeholder="Search… press Enter"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="rating">Rating</option>
                <option value="reviews">Most reviews</option>
              </select>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {centers.map((c) => (
                  <CenterCard key={c.id} center={c} />
                ))}
              </div>
            )}

            {!loading && centers.length === 0 && (
              <p className="py-12 text-center text-slate-500">No centers match your filters.</p>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-6">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setParam('page', String(page - 1))}
                  className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setParam('page', String(page + 1))}
                  className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
