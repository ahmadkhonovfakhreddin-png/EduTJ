import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">EduTJ</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/browse" className={linkClass}>
              Browse
            </NavLink>
            <NavLink to="/for-centers" className={linkClass}>
              For centers
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
            {user?.role === 'CENTER_OWNER' && (
              <NavLink to="/dashboard/center" className={linkClass}>
                My center
              </NavLink>
            )}
            {user && user.role === 'STUDENT' && (
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-slate-600 max-w-[140px] truncate">{user.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-2">
            <NavLink to="/browse" className={linkClass} onClick={() => setOpen(false)}>
              Browse
            </NavLink>
            <NavLink to="/for-centers" className={linkClass} onClick={() => setOpen(false)}>
              For centers
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                Admin
              </NavLink>
            )}
            {user?.role === 'CENTER_OWNER' && (
              <NavLink to="/dashboard/center" className={linkClass} onClick={() => setOpen(false)}>
                My center
              </NavLink>
            )}
            {user && user.role === 'STUDENT' && (
              <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
            )}
            {user ? (
              <button
                type="button"
                className="text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600"
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate('/');
                }}
              >
                Log out
              </button>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary px-3 py-2 text-sm text-white text-center"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <GraduationCap className="h-6 w-6 text-primary" />
              EduTJ
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Discover trusted courses and learning centers across Tajikistan.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Explore</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>
                <Link to="/browse" className="hover:text-primary">
                  Browse centers
                </Link>
              </li>
              <li>
                <Link to="/for-centers" className="hover:text-primary">
                  List your center
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Account</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>
                <Link to="/login" className="hover:text-primary">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} EduTJ. Built for learners in Tajikistan.
        </div>
      </footer>
    </div>
  );
}
