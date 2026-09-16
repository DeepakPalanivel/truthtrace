import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>TruthTrace — Explainable Fake News Intelligence System</p>
        <p className="mt-1 text-xs text-slate-600">
          TruthTrace does not guarantee accuracy. Always verify important claims through multiple trusted sources.
        </p>
      </footer>
    </div>
  );
}
