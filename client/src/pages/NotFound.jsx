import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

export function NotFound() {
  return (
    <Layout>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white"
        >
          Back home
        </Link>
      </div>
    </Layout>
  );
}
