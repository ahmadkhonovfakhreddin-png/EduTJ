import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout';
import { CenterCard } from '../components/CenterCard';
import { CardSkeleton } from '../components/Skeleton';
import { CATEGORY_OPTIONS } from '../constants';
import { api } from '../api/client';

export function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ sort: 'rating', limit: '6', page: '1' });
        const data = await api(`/api/centers?${params}`);
        if (!cancelled) setFeatured(data.centers || []);
      } catch {
        if (!cancelled) setFeatured([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('search', q.trim());
    if (cat !== 'all') params.set('category', cat);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Tajikistan&apos;s education directory
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Every Course in Tajikistan.{' '}
            <span className="text-accent">One Place.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-blue-100">
            Search trusted learning centers, compare programs, and find your next course in Dushanbe,
            Khujand, and beyond.
          </p>

          <form onSubmit={onSearch} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search centers, cities, or subjects..."
                className="w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-slate-900 shadow-lg placeholder:text-slate-400 focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-slate-900 shadow-lg hover:bg-amber-400 transition-colors"
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => {
                  setCat(c.value);
                  const params = new URLSearchParams();
                  if (c.value !== 'all') params.set('category', c.value);
                  navigate(`/browse?${params.toString()}`);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  cat === c.value
                    ? 'bg-white text-primary'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 text-center text-sm font-medium text-slate-600">
          <span>
            <strong className="text-2xl text-slate-900">42</strong> Centers
          </span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <span>
            <strong className="text-2xl text-slate-900">180+</strong> Courses
          </span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <span>
            <strong className="text-2xl text-slate-900">8</strong> Cities
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured centers</h2>
            <p className="mt-1 text-slate-600">Highly rated programs students love.</p>
          </div>
          <Link to="/browse" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)
            : featured.map((c) => <CenterCard key={c.id} center={c} />)}
        </div>
      </section>

      <section className="bg-slate-100 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Search', desc: 'Filter by city, category, price, and ratings.' },
              { step: '2', title: 'Compare', desc: 'Read reviews, browse courses, and save favorites.' },
              { step: '3', title: 'Enroll', desc: 'Contact the center directly and start learning.' },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {s.step}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-blue-800 px-8 py-10 text-white sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">List your center</h2>
            <p className="mt-2 max-w-xl text-blue-100">
              Reach students across Tajikistan. Publish courses, collect reviews, and grow your
              classroom.
            </p>
          </div>
          <Link
            to="/for-centers"
            className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary shadow-lg hover:bg-slate-50 sm:mt-0"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
