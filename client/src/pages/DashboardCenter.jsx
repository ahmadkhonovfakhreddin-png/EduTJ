import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Bookmark, MessageSquare, Pencil, Plus, Trash2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '../constants';
import { api } from '../api/client';
import { StarRating } from '../components/StarRating';

const COURSE_CATS = CATEGORY_OPTIONS.filter((c) => c.value !== 'all');

function CreateCenterOnboarding({ onCreated }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    city: 'Dushanbe',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        name: form.name,
        description: form.description,
        city: form.city,
        address: form.address,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
      };
      await api('/api/centers', { method: 'POST', body: JSON.stringify(body) });
      toast.success('Center created');
      onCreated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900">Create your center</h1>
        <p className="mt-1 text-slate-600">
          Add your listing to start publishing courses and collecting reviews.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <input
            required
            placeholder="Center name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="Website URL (optional)"
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create center'}
          </button>
        </form>
        <Link to="/for-centers" className="mt-6 block text-center text-sm text-primary hover:underline">
          Why list on EduTJ?
        </Link>
      </div>
    </Layout>
  );
}

function OwnerContent() {
  const [payload, setPayload] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [courseModal, setCourseModal] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'ENGLISH',
    price: '',
    duration: '',
    schedule: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await api('/api/me/center-dashboard');
      setPayload(data);
    } catch (e) {
      if (e.status === 404) {
        setPayload({ centers: [], totals: null, empty: true });
      } else {
        toast.error(e.message);
        setLoadError(true);
        setPayload(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (c) => {
    setEditId(c.id);
    setEditForm({
      name: c.name,
      description: c.description,
      city: c.city,
      address: c.address,
      phone: c.phone || '',
      email: c.email || '',
      website: c.website || '',
      logo: c.logo || '',
      coverImage: c.coverImage || '',
    });
  };

  const saveCenter = async (id) => {
    try {
      await api(`/api/centers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      toast.success('Center updated');
      setEditId(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const openNewCourse = (centerId) => {
    setCourseModal({ mode: 'create', centerId });
    setCourseForm({
      title: '',
      description: '',
      category: 'ENGLISH',
      price: '',
      duration: '',
      schedule: '',
    });
  };

  const openEditCourse = (course, centerId) => {
    setCourseModal({ mode: 'edit', centerId, courseId: course.id });
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      price: String(course.price),
      duration: course.duration,
      schedule: course.schedule,
    });
  };

  const saveCourse = async () => {
    try {
      if (courseModal.mode === 'create') {
        await api('/api/courses', {
          method: 'POST',
          body: JSON.stringify({
            ...courseForm,
            price: Number(courseForm.price),
            centerId: courseModal.centerId,
          }),
        });
        toast.success('Course created');
      } else {
        await api(`/api/courses/${courseModal.courseId}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...courseForm,
            price: Number(courseForm.price),
          }),
        });
        toast.success('Course updated');
      }
      setCourseModal(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api(`/api/courses/${id}`, { method: 'DELETE' });
      toast.success('Course deleted');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-10 animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-32 bg-slate-200 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-600">
          Could not load your dashboard. Please try again later.
        </div>
      </Layout>
    );
  }

  if (!payload || payload.empty) {
    return <CreateCenterOnboarding onCreated={load} />;
  }

  const { centers, totals } = payload;

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Center owner dashboard</h1>
        <p className="text-slate-600">Manage your listings, courses, and reputation.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <Eye className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{totals.viewCount}</p>
              <p className="text-xs text-slate-500">Total views</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{totals.bookmarks}</p>
              <p className="text-xs text-slate-500">Bookmarks</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{totals.reviews}</p>
              <p className="text-xs text-slate-500">Reviews</p>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-12">
          {centers.map((c) => (
            <section key={c.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{c.name}</h2>
                  <p className="text-sm text-slate-500">{c.city}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/centers/${c.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View public page
                  </Link>
                  {editId !== c.id ? (
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => saveCenter(c.id)}
                        className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="rounded-lg border px-3 py-1.5 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6">
                {editId === c.id ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {['name', 'city', 'address', 'phone', 'email', 'website', 'logo', 'coverImage'].map(
                      (field) => (
                        <label key={field} className={field === 'name' ? 'sm:col-span-2' : ''}>
                          <span className="text-xs font-medium text-slate-500">{field}</span>
                          <input
                            value={editForm[field] || ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                      )
                    )}
                    <label className="sm:col-span-2">
                      <span className="text-xs font-medium text-slate-500">description</span>
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        rows={4}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 line-clamp-3">{c.description}</p>
                )}
              </div>

              <div className="border-t border-slate-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Courses</h3>
                  <button
                    type="button"
                    onClick={() => openNewCourse(c.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add course
                  </button>
                </div>
                <ul className="mt-4 divide-y divide-slate-100">
                  {c.courses.map((course) => (
                    <li key={course.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{course.title}</p>
                        <p className="text-xs text-slate-500">
                          {CATEGORY_LABELS[course.category]} · {course.price} TJS
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditCourse(course, c.id)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                          aria-label="Edit course"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          aria-label="Delete course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Reviews</h3>
                <ul className="mt-3 space-y-2">
                  {c.reviews.length === 0 && (
                    <p className="text-sm text-slate-500">No reviews yet.</p>
                  )}
                  {c.reviews.map((r) => (
                    <li key={r.id} className="rounded-lg bg-white p-3 border border-slate-200 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium">{r.user.name}</span>
                        <StarRating value={r.rating} size={12} />
                      </div>
                      <p className="mt-1 text-slate-600">{r.comment}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>

      {courseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] overflow-y-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">
              {courseModal.mode === 'create' ? 'New course' : 'Edit course'}
            </h3>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Title"
                value={courseForm.title}
                onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <select
                value={courseForm.category}
                onChange={(e) => setCourseForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {COURSE_CATS.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price"
                value={courseForm.price}
                onChange={(e) => setCourseForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                placeholder="Duration"
                value={courseForm.duration}
                onChange={(e) => setCourseForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                placeholder="Schedule"
                value={courseForm.schedule}
                onChange={(e) => setCourseForm((f) => ({ ...f, schedule: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCourseModal(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCourse}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export function DashboardCenter() {
  return (
    <ProtectedRoute roles={['CENTER_OWNER']}>
      <OwnerContent />
    </ProtectedRoute>
  );
}
