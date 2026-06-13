
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { FAB } from '../ui/FAB';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <Header />
      <Sidebar />
      <main className="pt-20 pb-24 md:pb-8 md:pl-72 px-gutter max-w-6xl mx-auto overflow-x-hidden transition-all">
        <Outlet />
      </main>
      <FAB />
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
