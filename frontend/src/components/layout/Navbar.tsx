import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, History, Info, Menu, X, ScanSearch } from 'lucide-react';
import clsx from 'clsx';

const navLinks = [
  { to: '/analyze', label: 'Analyze', icon: Search },
  { to: '/history', label: 'History', icon: History },
  { to: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="TruthTrace Home">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <ScanSearch className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Truth<span className="text-blue-400">Trace</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === to
                    ? 'bg-blue-600/20 text-blue-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
            <Link
              to="/analyze"
              className="ml-3 btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <Search size={14} />
              Analyze News
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden py-3 border-t border-slate-800 animate-fade-in">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === to
                    ? 'bg-blue-600/20 text-blue-300'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
