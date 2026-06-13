import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function BottomNav() {
  const { profile } = useAuth();

  const items = [
    { to: '/', icon: 'home', label: 'Início', roles: ['admin', 'tecnico'] },
    { to: '/chamados', icon: 'list_alt', label: 'Chamados', roles: ['admin', 'tecnico', 'cliente'] },
    { to: '/relatorios', icon: 'bar_chart', label: 'Relatórios', roles: ['admin', 'tecnico'] },
    { to: '/configuracoes', icon: 'settings', label: 'Ajustes', roles: ['admin', 'tecnico', 'cliente'] },
  ];

  const filteredItems = items.filter((item) =>
    profile && item.roles.includes(profile.role)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container border-t border-outline-variant flex justify-around items-center h-16 w-full px-xs">
      {filteredItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-all ${
              isActive
                ? 'bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 scale-95'
                : 'text-on-surface-variant hover:bg-surface-container-high p-2 rounded-xl'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-label-caps text-[10px] mt-0.5">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

