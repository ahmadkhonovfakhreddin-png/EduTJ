import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Heart,
  BadgeCheck,
  BookOpen,
  MessageSquare,
  Info,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { StarRating } from '../components/StarRating';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CATEGORY_LABELS } from '../constants';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function CenterDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('courses');
  const [bookmarked, setBookmarked] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewErrors, setReviewErrors] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await api(`/api/centers/${slug}`);
      setData(res.center);
      setBookmarked(!!res.center.bookmarked);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) load();
  }, [slug]);

  useDocumentTitle(!loading && data ? data.name : null);

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Log in to save centers');
      return;
    }
    try {
      const res = await api(`/api/bookmarks/${data.id}`, { method: 'POST' });
      setBookmarked(res.bookmarked);
      toast.success(res.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewErrors({});
    if (!user) {
      toast.error('Log in to leave a review');
      return;
    }
    try {
      await api('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          centerId: data.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      toast.success('Review submitted');
      setReviewComment('');
      load();
    } catch (e) {
      if (e.details) {
        const d = {};
        e.details.forEach((x) => {
          d[x.field] = x.message;
        });
        setReviewErrors(d);
      }
      toast.error(e.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse mx-auto max-w-6xl px-4 py-8">
          <div className="h-48 rounded-2xl bg-slate-200" />
          <div className="mt-6 h-8 w-1/2 rounded bg-slate-200" />
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Center not found</h1>
          <Link to="/browse" className="mt-4 inline-block text-primary font-medium">
            Back to browse
          </Link>
        </div>
      </Layout>
    );
  }

  const breakdown = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: data.reviews.filter((r) => r.rating === star).length,
  }));

  const canReview = user && (user.role === 'STUDENT' || user.role === 'ADMIN');

  return (
    <Layout>
      <div className="relative h-48 sm:h-64 bg-slate-200">
        {data.coverImage ? (
          <img src={data.coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/40 to-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="-mt-16 relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-28 sm:w-28">
              {data.logo ? (
                <img src={data.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-bold text-primary">
                  {data.name[0]}
                </div>
              )}
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white drop-shadow sm:text-3xl">{data.name}</h1>
                {data.isVerified && (
                  <BadgeCheck className="h-7 w-7 text-accent drop-shadow" aria-label="Verified" />
                )}
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
                <MapPin className="h-4 w-4" />
                {data.city}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleBookmark}
            className={`mb-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold shadow-lg transition-colors ${
              bookmarked
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Heart className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
            {bookmarked ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
          {data.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-slate-400" />
              {data.address}
            </span>
          )}
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-1 hover:text-primary">
              <Phone className="h-4 w-4 text-slate-400" />
              {data.phone}
            </a>
          )}
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-1 hover:text-primary">
              <Mail className="h-4 w-4 text-slate-400" />
              {data.email}
            </a>
          )}
          {data.website && (
            <a
              href={data.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-primary"
            >
              <Globe className="h-4 w-4 text-slate-400" />
              Website
            </a>
          )}
        </div>

        <div className="mt-8 border-b border-slate-200 flex gap-2 overflow-x-auto">
          {[
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'reviews', label: 'Reviews', icon: MessageSquare },
            { id: 'about', label: 'About', icon: Info },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {tab === 'courses' && (
            <ul className="space-y-4">
              {data.courses.map((c) => (
                <li
                  key={c.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{c.title}</h3>
                      <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {CATEGORY_LABELS[c.category] || c.category}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{c.price} TJS</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-3">{c.description}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {c.duration} · {c.schedule}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {tab === 'reviews' && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-slate-900">
                    {data.avgRating?.toFixed(1) ?? '0'}
                  </span>
                  <div>
                    <StarRating value={data.avgRating || 0} />
                    <p className="text-sm text-slate-500">{data.reviewCount} reviews</p>
                  </div>
                </div>
                <ul className="mt-6 space-y-2">
                  {breakdown
                    .slice()
                    .reverse()
                    .map(({ star, count }) => (
                      <li key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-8">{star}★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${
                                data.reviews.length
                                  ? (count / data.reviews.length) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="w-6 text-slate-500">{count}</span>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="lg:col-span-2 space-y-6">
                {canReview && (
                  <form
                    onSubmit={submitReview}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="font-semibold text-slate-900">Write a review</h3>
                    <label className="mt-3 block text-sm text-slate-600">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} stars
                        </option>
                      ))}
                    </select>
                    <label className="mt-3 block text-sm text-slate-600">Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    {reviewErrors.comment && (
                      <p className="mt-1 text-xs text-red-600">{reviewErrors.comment}</p>
                    )}
                    <button
                      type="submit"
                      className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Submit review
                    </button>
                  </form>
                )}
                <ul className="space-y-4">
                  {data.reviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-900">{r.user.name}</span>
                        <StarRating value={r.rating} size={14} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900">About</h3>
                <p className="mt-3 whitespace-pre-wrap text-slate-600">{data.description}</p>
                <div className="mt-6 space-y-2 text-sm text-slate-600">
                  {data.phone && <p>Phone: {data.phone}</p>}
                  {data.email && <p>Email: {data.email}</p>}
                  {data.website && <p>Web: {data.website}</p>}
                </div>
              </div>
              <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500">
                Map preview — {data.city}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
