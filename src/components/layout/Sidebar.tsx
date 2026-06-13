
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, FileBarChart, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const { profile } = useAuth();

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Painel Geral', roles: ['admin', 'tecnico'] },
    { to: '/chamados', icon: <Ticket size={20} />, label: 'Meus Chamados', roles: ['admin', 'tecnico', 'cliente'] },
    { to: '/relatorios', icon: <FileBarChart size={20} />, label: 'Relatórios', roles: ['admin', 'tecnico'] },
    { to: '/configuracoes', icon: <Settings size={20} />, label: 'Configurações', roles: ['admin', 'tecnico', 'cliente'] },
  ];

  const filteredItems = navItems.filter((item) => 
    profile && item.roles.includes(profile.role)
  );

  return (
    <aside className="hidden md:flex md:flex-col fixed left-0 top-[72px] bottom-0 w-20 lg:w-64 bg-surface-container-lowest border-r border-outline-variant z-30 transition-all">
      <div className="flex-1 py-lg flex flex-col gap-2 px-3 lg:px-4">

        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-body-md ${
                isActive
                  ? 'bg-primary-container text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`
            }
          >
            {item.icon}
            <span className="hidden lg:inline">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
