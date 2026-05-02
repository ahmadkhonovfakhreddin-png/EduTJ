import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { api } from '../api/client';
import { BadgeCheck, Trash2 } from 'lucide-react';

function AdminContent() {
  const [stats, setStats] = useState(null);
  const [centers, setCenters] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, c, u] = await Promise.all([
        api('/api/admin/stats'),
        api('/api/admin/centers'),
        api('/api/admin/users'),
      ]);
      setStats(s);
      setCenters(c.centers || []);
      setUsers(u.users || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const verify = async (id) => {
    try {
      await api(`/api/admin/centers/${id}/verify`, { method: 'PUT' });
      toast.success('Center verified');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const removeCenter = async (id) => {
    if (!confirm('Delete this center and all its courses?')) return;
    try {
      await api(`/api/admin/centers/${id}`, { method: 'DELETE' });
      toast.success('Center deleted');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const removeUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api(`/api/admin/users/${id}`, { method: 'DELETE' });
      toast.success('User deleted');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
        {loading ? (
          <p className="mt-4 text-slate-500">Loading…</p>
        ) : (
          <>
            {stats && (
              <div className="mt-6 grid gap-3 sm:grid-cols-5">
                {Object.entries(stats).map(([k, v]) => (
                  <div key={k} className="rounded-xl border bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-2xl font-bold text-slate-900">{v}</p>
                  </div>
                ))}
              </div>
            )}

            <section className="mt-12">
              <h2 className="text-lg font-semibold">Centers</h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">City</th>
                      <th className="px-4 py-2">Owner</th>
                      <th className="px-4 py-2">Verified</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centers.map((c) => (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="px-4 py-2 font-medium">{c.name}</td>
                        <td className="px-4 py-2">{c.city}</td>
                        <td className="px-4 py-2">{c.owner.email}</td>
                        <td className="px-4 py-2">{c.isVerified ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2 flex gap-2">
                          {!c.isVerified && (
                            <button
                              type="button"
                              onClick={() => verify(c.id)}
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <BadgeCheck className="h-4 w-4" />
                              Verify
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeCenter(c.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:underline"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-lg font-semibold">Users</h2>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-slate-100">
                        <td className="px-4 py-2">{u.name}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.role}</td>
                        <td className="px-4 py-2">
                          {u.role !== 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => removeUser(u.id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}

export function Admin() {
  return (
    <ProtectedRoute roles={['ADMIN']}>
      <AdminContent />
    </ProtectedRoute>
  );
}
