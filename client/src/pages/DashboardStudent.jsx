import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { CenterCard } from '../components/CenterCard';
import { StarRating } from '../components/StarRating';
import { CardSkeleton } from '../components/Skeleton';
import { api } from '../api/client';

function DashboardContent() {
  const [bookmarks, setBookmarks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [b, r] = await Promise.all([api('/api/bookmarks'), api('/api/me/reviews')]);
        if (!cancelled) {
          setBookmarks(b.bookmarks || []);
          setReviews(r.reviews || []);
        }
      } catch {
        if (!cancelled) {
          setBookmarks([]);
          setReviews([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Student dashboard</h1>
        <p className="text-slate-600">Your saved centers and reviews.</p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">Bookmarked centers</h2>
          {loading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : bookmarks.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No bookmarks yet.{' '}
              <Link to="/browse" className="text-primary font-medium hover:underline">
                Browse centers
              </Link>
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((b) => (
                <CenterCard key={b.id} center={b.center} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900">My reviews</h2>
          {loading ? (
            <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-200" />
          ) : reviews.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">You haven&apos;t written any reviews yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-start justify-between gap-2"
                >
                  <div>
                    <Link
                      to={`/centers/${r.center.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {r.center.name}
                    </Link>
                    <p className="text-xs text-slate-500">{r.center.city}</p>
                    <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
                  </div>
                  <StarRating value={r.rating} size={14} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}

export function DashboardStudent() {
  return (
    <ProtectedRoute roles={['STUDENT']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
