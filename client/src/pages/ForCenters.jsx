import { Link } from 'react-router-dom';
import { CheckCircle2, Users, TrendingUp, Star } from 'lucide-react';
import { Layout } from '../components/Layout';

export function ForCenters() {
  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h1 className="text-4xl font-bold sm:text-5xl">Grow your center with EduTJ</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Tajikistan&apos;s students are searching for courses like yours. Publish your programs,
            build trust with reviews, and get discovered in every major city.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex rounded-xl bg-accent px-6 py-3 font-semibold text-slate-900 shadow-lg hover:bg-amber-400"
          >
            Register as center owner
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Why list on EduTJ?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Users,
              title: 'Reach learners',
              desc: 'Appear in search and filters across Dushanbe, Khujand, and more.',
            },
            {
              icon: Star,
              title: 'Social proof',
              desc: 'Collect verified reviews and showcase your best outcomes.',
            },
            {
              icon: TrendingUp,
              title: 'Simple management',
              desc: 'Update courses, schedules, and contact info anytime.',
            },
            {
              icon: CheckCircle2,
              title: 'Trust badge',
              desc: 'Get verified by our team to stand out on listings.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <item.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-slate-100 p-10 text-center">
          <h3 className="text-xl font-bold text-slate-900">Ready to list your center?</h3>
          <p className="mt-2 text-slate-600">Create a free owner account and add your first courses.</p>
          <Link
            to="/register"
            className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Create owner account
          </Link>
        </div>
      </section>
    </Layout>
  );
}
