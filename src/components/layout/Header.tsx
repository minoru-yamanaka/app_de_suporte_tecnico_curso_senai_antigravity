import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpData, setHelpData] = useState<any>(null);

  // Sincroniza o valor de busca se o parâmetro de query mudar
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Busca dados de ajuda
  useEffect(() => {
    supabase.from('system_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setHelpData(data);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = searchQuery.trim();
    if (cleanSearch) {
      navigate(`${location.pathname}?search=${encodeURIComponent(cleanSearch)}`);
    } else {
      navigate(location.pathname);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const showSearch = location.pathname === '/' || location.pathname === '/chamados';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-header border-b border-outline-variant h-16 px-gutter flex items-center justify-between md:pl-72">
      {/* Área da barra de pesquisa */}
      <div className="flex items-center gap-3 flex-1 mr-4">
        {showSearch && (
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <button 
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar chamados por título ou usuário..." 
              className="w-full bg-surface-container-high border border-outline-variant rounded-full py-2 pl-12 pr-4 font-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none placeholder:text-on-surface-variant transition-all"
            />
          </form>
        )}
      </div>

      {/* Ações da direita */}
      <div className="flex items-center gap-4 relative">
        <button className="relative p-1 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
        </button>

        {/* Botão "?" de Ajuda */}
        <div className="relative">
          <button 
            onClick={() => { setHelpOpen(!helpOpen); setMenuOpen(false); }}
            className={`p-1 hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center ${helpOpen ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant'}`}
            title="Ajuda"
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          
          {helpOpen && helpData && (
            <div className="absolute right-0 top-10 mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-4 z-50 animate-in fade-in duration-200">
              <h4 className="font-title-sm text-primary border-b border-outline-variant pb-1 mb-2 text-xs uppercase tracking-wider font-bold">Ajuda e Suporte</h4>
              <p className="font-body-sm text-on-surface font-semibold mb-2">{helpData.help_text || 'Suporte Técnico'}</p>
              <div className="flex flex-col gap-2 text-xs text-on-surface-variant border-t border-surface-container-low pt-2">
                {helpData.help_email && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary">mail</span>
                    <a href={`mailto:${helpData.help_email}`} className="hover:underline text-primary truncate">{helpData.help_email}</a>
                  </div>
                )}
                {helpData.help_phone && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary">phone</span>
                    <a href={`tel:${helpData.help_phone}`} className="hover:underline">{helpData.help_phone}</a>
                  </div>
                )}
                {helpData.help_website && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary">public</span>
                    <a 
                      href={helpData.help_website.startsWith('http') ? helpData.help_website : `https://${helpData.help_website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline text-primary truncate max-w-[180px]"
                    >
                      {helpData.help_website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Menu do Perfil do Usuário */}
        <div className="relative">
          <button 
            onClick={() => { setMenuOpen(!menuOpen); setHelpOpen(false); }} 
            className="flex items-center gap-2 focus:outline-none hover:bg-surface-container-high py-1 px-2 rounded-full transition-all"
          >
            <span className="font-body-sm text-on-surface font-semibold hidden md:inline">{profile?.name || 'Carregando...'}</span>
            <img className="w-8 h-8 rounded-full border border-outline-variant object-cover" alt="Perfil" src={profile?.photo_url || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"}/>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 mt-2 w-52 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 p-2 animate-in fade-in duration-200">
              <div className="p-3 border-b border-outline-variant mb-1 flex items-center gap-2">
                <img className="w-8 h-8 rounded-full border border-outline-variant object-cover" alt="Perfil" src={profile?.photo_url || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"}/>
                <div className="truncate">
                  <p className="font-title-sm text-on-surface truncate text-xs font-bold">{profile?.name || 'Usuário'}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{profile?.role === 'admin' ? 'Administrador' : profile?.role === 'tecnico' ? 'Técnico' : 'Cliente'}</p>
                </div>
              </div>
              <button 
                onClick={() => { setMenuOpen(false); navigate('/configuracoes'); }} 
                className="w-full text-left px-3 py-2 text-xs font-label-caps uppercase text-on-surface hover:bg-surface-container-high rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">account_circle</span>
                Perfil do Usuário
              </button>
              <button 
                onClick={handleLogout} 
                className="w-full text-left px-3 py-2 text-xs font-label-caps uppercase text-error hover:bg-error-container rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

