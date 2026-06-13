import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Status {
  id: string;
  name: string;
  text_color: string;
  bg_color: string;
}

interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'tecnico' | 'cliente';
  title: string | null;
  phone: string | null;
  photo_url: string | null;
  email?: string;
  created_at: string;
}

const PREDEFINED_COLORS = [
  { label: 'Cinza (Padrão)', bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  { label: 'Azul', bg: 'bg-primary-container', text: 'text-on-primary' },
  { label: 'Amarelo', bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed' },
  { label: 'Vermelho', bg: 'bg-error-container', text: 'text-on-error-container' },
  { label: 'Verde/Secundário', bg: 'bg-secondary-container', text: 'text-on-secondary-container' }
];

export function Settings() {
  const { profile, user, signOut } = useAuth();
  
  // Abas
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca' | 'usuarios' | 'sistema' | 'chamados'>('perfil');

  // Meu Perfil Próprio
  const [myName, setMyName] = useState('');
  const [myPhone, setMyPhone] = useState('');
  const [myPhotoUrl, setMyPhotoUrl] = useState('');
  const [savingMyProfile, setSavingMyProfile] = useState(false);

  // Segurança (Própria Senha)
  const [myPassword, setMyPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Gerenciamento de Usuários (Admin apenas)
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Campos do formulário de usuário (no Modal)
  const [uEmail, setUEmail] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uName, setUName] = useState('');
  const [uRole, setURole] = useState<'admin' | 'tecnico' | 'cliente'>('cliente');
  const [uPhone, setUPhone] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);

  // Configurações do Sistema Globais (Admin apenas)
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [helpText, setHelpText] = useState('');
  const [helpEmail, setHelpEmail] = useState('');
  const [helpPhone, setHelpPhone] = useState('');
  const [helpWebsite, setHelpWebsite] = useState('');
  const [savingSys, setSavingSys] = useState(false);
  const [sysMessage, setSysMessage] = useState('');

  // Exclusão em massa de chamados (Admin apenas)
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPasswordForDelete, setConfirmPasswordForDelete] = useState('');
  const [deletingAllTickets, setDeletingAllTickets] = useState(false);

  // Categorias & Statuses (Admin apenas)
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  
  // Nova Categoria Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('category');
  const [savingCat, setSavingCat] = useState(false);

  // Novo Status Form
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColorIndex, setNewStatusColorIndex] = useState(0);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    if (profile) {
      setMyName(profile.name || '');
      setMyPhone(profile.phone || '');
      setMyPhotoUrl(profile.photo_url || '');
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAdminData();
      fetchUsers();
    }
  }, [profile]);

  const fetchAdminData = async () => {
    // Sys Settings
    supabase.from('system_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) {
        setTitle(data.title);
        setSubtitle(data.subtitle);
        setHelpText(data.help_text || '');
        setHelpEmail(data.help_email || '');
        setHelpPhone(data.help_phone || '');
        setHelpWebsite(data.help_website || '');
      }
    });

    // Categories
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    if (catData) setCategories(catData);

    // Statuses
    const { data: statData } = await supabase.from('statuses').select('*').order('name');
    if (statData) setStatuses(statData);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list_users' }
      });
      if (error) throw error;
      if (data) {
        setUsersList(data);
      }
    } catch (err: any) {
      console.error('Erro ao listar usuários:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Salvar próprio perfil
  const handleSaveMyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingMyProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: myName.trim(),
          phone: myPhone.trim() || null,
          photo_url: myPhotoUrl.trim() || null
        })
        .eq('id', profile.id);

      if (error) throw error;
      alert('Perfil atualizado com sucesso!');
      window.location.reload();
    } catch (err: any) {
      alert('Erro ao atualizar perfil: ' + err.message);
    } finally {
      setSavingMyProfile(false);
    }
  };

  // Alterar própria senha
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myPassword !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    if (myPassword.length < 6) {
      alert('A senha deve conter no mínimo 6 caracteres!');
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: myPassword });
      if (error) throw error;
      alert('Senha updated com sucesso!');
      setMyPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert('Erro ao atualizar senha: ' + err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  // Abrir modal de criação
  const openCreateModal = () => {
    setEditingUser(null);
    setUEmail('');
    setUPassword('');
    setUName('');
    setURole('cliente');
    setUPhone('');
    setIsUserModalOpen(true);
  };

  // Abrir modal de edição
  const openEditModal = (userToEdit: UserProfile) => {
    setEditingUser(userToEdit);
    setUEmail(userToEdit.email || '');
    setUPassword('');
    setUName(userToEdit.name || '');
    setURole(userToEdit.role || 'cliente');
    setUPhone(userToEdit.phone || '');
    setIsUserModalOpen(true);
  };

  // Salvar novo/editado usuário (via Edge Function)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    try {
      if (editingUser) {
        // Atualizar
        const { error } = await supabase.functions.invoke('manage-users', {
          body: {
            action: 'update_user',
            userId: editingUser.id,
            email: uEmail.trim(),
            password: uPassword ? uPassword : undefined,
            name: uName.trim(),
            role: uRole,
            phone: uPhone.trim() || null
          }
        });
        if (error) throw error;
        alert('Usuário atualizado com sucesso!');
      } else {
        // Criar
        if (!uPassword) {
          alert('A senha é obrigatória para novos usuários!');
          setSubmittingUser(false);
          return;
        }
        if (uPassword.length < 6) {
          alert('A senha deve conter no mínimo 6 caracteres!');
          setSubmittingUser(false);
          return;
        }
        const { error } = await supabase.functions.invoke('manage-users', {
          body: {
            action: 'create_user',
            email: uEmail.trim(),
            password: uPassword,
            name: uName.trim(),
            role: uRole,
            phone: uPhone.trim() || null
          }
        });
        if (error) throw error;
        alert('Usuário criado com sucesso!');
      }
      setIsUserModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert('Erro ao salvar usuário: ' + err.message);
    } finally {
      setSubmittingUser(false);
    }
  };

  // Deletar usuário (via Edge Function)
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === profile?.id) {
      alert('Você não pode excluir sua própria conta!');
      return;
    }
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) return;
    try {
      const { error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete_user',
          userId
        }
      });
      if (error) throw error;
      alert('Usuário excluído com sucesso!');
      fetchUsers();
    } catch (err: any) {
      alert('Erro ao excluir usuário: ' + err.message);
    }
  };

  // Salvar configurações globais + ajuda
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (helpText.length > 20) {
      alert('O texto de ajuda deve ter no máximo 20 caracteres!');
      return;
    }
    setSavingSys(true);
    setSysMessage('');
    const { error } = await supabase.from('system_settings').update({
      title, 
      subtitle,
      help_text: helpText.trim() || null,
      help_email: helpEmail.trim() || null,
      help_phone: helpPhone.trim() || null,
      help_website: helpWebsite.trim() || null
    }).eq('id', 1);

    if (error) setSysMessage('Erro ao salvar as configurações.');
    else setSysMessage('Configurações atualizadas com sucesso!');
    setSavingSys(false);
  };

  // Exclusão em massa de chamados (Admin apenas)
  const handleDeleteAllTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('ATENÇÃO CRÍTICA: Isso excluirá permanentemente TODOS os chamados do sistema. Esta ação NÃO pode ser desfeita. Tem certeza?')) {
      return;
    }
    setDeletingAllTickets(true);
    try {
      // Re-autentica o admin usando e-mail e senha inseridos
      const { data, error } = await supabase.auth.signInWithPassword({
        email: confirmEmail.trim(),
        password: confirmPasswordForDelete
      });
      
      if (error || !data.user) {
        throw new Error('E-mail ou senha incorretos para confirmação.');
      }

      // Confirma que é admin logado
      const { data: checkProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (checkProfile?.role !== 'admin') {
        throw new Error('O usuário inserido não é Administrador.');
      }

      // Executa a exclusão de todos os chamados
      const { error: deleteError } = await supabase
        .from('tickets')
        .delete()
        .neq('id', 0); // Deleta todos

      if (deleteError) throw deleteError;

      alert('Todos os chamados do sistema foram excluídos com sucesso!');
      setConfirmEmail('');
      setConfirmPasswordForDelete('');
    } catch (err: any) {
      alert('Erro ao excluir chamados: ' + err.message);
    } finally {
      setDeletingAllTickets(false);
    }
  };

  // CRUD Categorias
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingCat(true);
    
    const { data, error } = await supabase.from('categories').insert([
      { name: newCatName.trim(), icon: newCatIcon.trim() }
    ]).select();

    if (!error && data) {
      setCategories([...categories, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatName('');
      setNewCatIcon('category');
    } else {
      alert('Erro ao adicionar categoria.');
    }
    setSavingCat(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Deseja excluir esta categoria? Isso pode afetar chamados existentes.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  // CRUD Status
  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName.trim()) return;
    setSavingStatus(true);
    
    const colorTheme = PREDEFINED_COLORS[newStatusColorIndex];
    const { data, error } = await supabase.from('statuses').insert([
      { name: newStatusName.trim(), text_color: colorTheme.text, bg_color: colorTheme.bg }
    ]).select();

    if (!error && data) {
      setStatuses([...statuses, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
      setNewStatusName('');
    } else {
      alert('Erro ao adicionar status.');
    }
    setSavingStatus(false);
  };

  const handleDeleteStatus = async (id: string) => {
    if (!confirm('Deseja excluir este status? Isso pode afetar chamados existentes.')) return;
    const { error } = await supabase.from('statuses').delete().eq('id', id);
    if (!error) {
      setStatuses(statuses.filter(s => s.id !== id));
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <h1 className="font-headline-md text-headline-md text-primary tracking-tight mb-lg">Configurações</h1>
      
      {/* Abas Superiores */}
      <div className="flex border-b border-outline-variant gap-4 mb-lg overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('perfil')}
          className={`pb-2 px-1 font-label-caps uppercase transition-all border-b-2 text-[11px] tracking-wider whitespace-nowrap ${activeTab === 'perfil' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
        >
          Meu Perfil
        </button>
        <button 
          onClick={() => setActiveTab('seguranca')}
          className={`pb-2 px-1 font-label-caps uppercase transition-all border-b-2 text-[11px] tracking-wider whitespace-nowrap ${activeTab === 'seguranca' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
        >
          Segurança e Acesso
        </button>
        {profile?.role === 'admin' && (
          <>
            <button 
              onClick={() => { setActiveTab('usuarios'); fetchUsers(); }}
              className={`pb-2 px-1 font-label-caps uppercase transition-all border-b-2 text-[11px] tracking-wider whitespace-nowrap ${activeTab === 'usuarios' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
            >
              Gerenciar Usuários
            </button>
            <button 
              onClick={() => setActiveTab('sistema')}
              className={`pb-2 px-1 font-label-caps uppercase transition-all border-b-2 text-[11px] tracking-wider whitespace-nowrap ${activeTab === 'sistema' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
            >
              Sistema e Fluxos
            </button>
            <button 
              onClick={() => setActiveTab('chamados')}
              className={`pb-2 px-1 font-label-caps uppercase transition-all border-b-2 text-[11px] tracking-wider whitespace-nowrap ${activeTab === 'chamados' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
            >
              Chamados
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-lg max-w-4xl">
        
        {/* ABA: MEU PERFIL */}
        {activeTab === 'perfil' && (
          <div className="flex flex-col gap-md">
            {/* Profile Card View */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-4 shadow-sm">
              <h2 className="font-title-sm text-primary border-b border-outline-variant pb-2">Meu Perfil</h2>
              <div className="flex items-center gap-4">
                <img 
                  src={profile?.photo_url || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full border border-outline-variant object-cover" 
                />
                <div>
                  <p className="font-title-sm text-on-surface">{profile?.name || 'Carregando...'}</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider inline-block mt-1 ${
                    profile?.role === 'admin' ? 'bg-error-container text-on-error-container' : 
                    profile?.role === 'tecnico' ? 'bg-secondary-container text-on-secondary-container' : 
                    'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {profile?.role === 'admin' ? 'Administrador' : 
                     profile?.role === 'tecnico' ? 'Técnico' : 'Cliente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-4 shadow-sm">
              <h3 className="font-title-sm text-primary border-b border-outline-variant pb-2">Editar Informações</h3>
              <form onSubmit={handleSaveMyProfile} className="flex flex-col gap-4">
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Nome Completo</label>
                  <input 
                    type="text" 
                    value={myName} 
                    onChange={(e) => setMyName(e.target.value)} 
                    required
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Telefone de Contato</label>
                  <input 
                    type="text" 
                    value={myPhone} 
                    onChange={(e) => setMyPhone(e.target.value)} 
                    placeholder="(99) 99999-9999"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">URL da Foto de Perfil</label>
                  <input 
                    type="url" 
                    value={myPhotoUrl} 
                    onChange={(e) => setMyPhotoUrl(e.target.value)} 
                    placeholder="https://exemplo.com/foto.jpg"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={savingMyProfile} 
                  className="w-full py-2 bg-primary text-on-primary rounded-lg font-label-caps uppercase hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {savingMyProfile ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </form>
            </div>

            <button 
              onClick={signOut}
              className="w-full py-2 bg-error-container text-on-error-container rounded-lg font-label-caps uppercase hover:opacity-90 transition-opacity border border-outline-variant shadow-sm"
            >
              Sair do Sistema
            </button>
          </div>
        )}

        {/* ABA: SEGURANÇA E ACESSO */}
        {activeTab === 'seguranca' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-4 shadow-sm">
            <h2 className="font-title-sm text-primary border-b border-outline-variant pb-2">Alterar Senha</h2>
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Nova Senha</label>
                <input 
                  type="password" 
                  value={myPassword} 
                  onChange={(e) => setMyPassword(e.target.value)} 
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required
                  placeholder="Confirme a nova senha"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>
              <button 
                type="submit" 
                disabled={changingPassword} 
                className="w-full py-2 bg-primary text-on-primary rounded-lg font-label-caps uppercase hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {changingPassword ? 'Alterando...' : 'Confirmar Nova Senha'}
              </button>
            </form>
          </div>
        )}

        {/* ABA: GERENCIAR USUÁRIOS (ADMIN ONLY) */}
        {activeTab === 'usuarios' && profile?.role === 'admin' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-outline-variant pb-2">
              <h2 className="font-title-sm text-primary">Gerenciamento de Usuários</h2>
              <button 
                onClick={openCreateModal}
                className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-caps text-xs uppercase hover:opacity-90 flex items-center gap-1 transition-opacity"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                Cadastrar Usuário
              </button>
            </div>

            {loadingUsers ? (
              <div className="text-center py-6 font-body-sm text-on-surface-variant">Carregando usuários...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-body-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                      <th className="p-3 font-label-caps text-xs text-on-surface-variant">Nome</th>
                      <th className="p-3 font-label-caps text-xs text-on-surface-variant">E-mail</th>
                      <th className="p-3 font-label-caps text-xs text-on-surface-variant">Cargo</th>
                      <th className="p-3 font-label-caps text-xs text-on-surface-variant">Telefone</th>
                      <th className="p-3 font-label-caps text-xs text-on-surface-variant text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                        <td className="p-3 font-body-sm text-on-surface font-semibold">{usr.name}</td>
                        <td className="p-3 font-body-sm text-on-surface-variant">{usr.email || '—'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            usr.role === 'admin' ? 'bg-error-container text-on-error-container' : 
                            usr.role === 'tecnico' ? 'bg-secondary-container text-on-secondary-container' : 
                            'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            {usr.role === 'admin' ? 'Administrador' : 
                             usr.role === 'tecnico' ? 'Técnico' : 'Cliente'}
                          </span>
                        </td>
                        <td className="p-3 font-body-sm text-on-surface-variant">{usr.phone || '—'}</td>
                        <td className="p-3 flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(usr)}
                            className="p-1 hover:bg-surface-container-high rounded text-secondary transition-colors"
                            title="Editar Usuário"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(usr.id, usr.name)}
                            disabled={usr.id === profile.id}
                            className="p-1 hover:bg-error-container hover:text-on-error-container rounded text-error disabled:opacity-30 transition-colors"
                            title="Excluir Usuário"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-on-surface-variant">Nenhum usuário cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ABA: SISTEMA E FLUXOS (ADMIN ONLY) */}
        {activeTab === 'sistema' && profile?.role === 'admin' && (
          <div className="flex flex-col gap-lg">
            {/* System Settings & Help */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-4 shadow-sm">
              <h2 className="font-title-sm text-primary border-b border-outline-variant pb-2">Sistema & Suporte</h2>
              <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Título do Painel</label>
                    <input 
                      type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Subtítulo</label>
                    <input 
                      type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} required
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                </div>

                <div className="border-t border-outline-variant pt-3 mt-1">
                  <h3 className="font-title-sm text-primary mb-3 text-sm font-semibold">Informações de Ajuda (Contato para Usuários)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Texto de Ajuda (Máx. 20 caracteres)</label>
                      <input 
                        type="text" 
                        value={helpText} 
                        onChange={(e) => setHelpText(e.target.value.substring(0, 20))} 
                        maxLength={20}
                        placeholder="Ex: Suporte Fone/Falar"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">E-mail de Contato</label>
                      <input 
                        type="email" 
                        value={helpEmail} 
                        onChange={(e) => setHelpEmail(e.target.value)}
                        placeholder="suporte@empresa.com"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Site do Suporte (Link)</label>
                      <input 
                        type="text" 
                        value={helpWebsite} 
                        onChange={(e) => setHelpWebsite(e.target.value)}
                        placeholder="www.suporte.com"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Telefone de Contato</label>
                      <input 
                        type="text" 
                        value={helpPhone} 
                        onChange={(e) => setHelpPhone(e.target.value)}
                        placeholder="(11) 4002-8922"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                      />
                    </div>
                  </div>
                </div>

                {sysMessage && <p className={`text-sm ${sysMessage.includes('sucesso') ? 'text-primary' : 'text-error'}`}>{sysMessage}</p>}
                <button type="submit" disabled={savingSys} className="w-full py-2 bg-primary text-on-primary rounded-lg font-label-caps uppercase hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {savingSys ? 'Salvando...' : 'Salvar Configurações de Sistema'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* Categorias CRUD */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-4 shadow-sm">
                <h2 className="font-title-sm text-primary border-b border-outline-variant pb-2">Categorias</h2>
                
                <form onSubmit={handleAddCategory} className="flex flex-col gap-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                  <span className="font-label-caps text-on-surface-variant text-xs">Nova Categoria</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" placeholder="Nome" value={newCatName} onChange={e => setNewCatName(e.target.value)} required
                      className="flex-1 min-w-0 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1 font-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input 
                      type="text" placeholder="Ícone (Google)" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} required
                      className="w-24 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1 font-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button type="submit" disabled={savingCat} className="mt-1 py-1 bg-primary text-on-primary rounded-lg font-label-caps uppercase hover:opacity-90 text-xs">
                    {savingCat ? '...' : 'Adicionar'}
                  </button>
                </form>

                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 border border-outline-variant rounded-lg bg-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-[18px]">{cat.icon}</span>
                        <span className="font-body-sm text-on-surface">{cat.name}</span>
                      </div>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-error hover:opacity-70">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status CRUD */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-4 shadow-sm">
                <h2 className="font-title-sm text-primary border-b border-outline-variant pb-2">Status dos Chamados</h2>
                
                <form onSubmit={handleAddStatus} className="flex flex-col gap-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                  <span className="font-label-caps text-on-surface-variant text-xs">Novo Status</span>
                  <input 
                    type="text" placeholder="Nome do status" value={newStatusName} onChange={e => setNewStatusName(e.target.value)} required
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1 font-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <select 
                    value={newStatusColorIndex} 
                    onChange={e => setNewStatusColorIndex(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 font-body-sm focus:outline-none"
                  >
                    {PREDEFINED_COLORS.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
                  </select>
                  <button type="submit" disabled={savingStatus} className="mt-1 py-1 bg-primary text-on-primary rounded-lg font-label-caps uppercase hover:opacity-90 text-xs">
                    {savingStatus ? '...' : 'Adicionar'}
                  </button>
                </form>

                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                  {statuses.map(stat => (
                    <div key={stat.id} className="flex items-center justify-between p-2 border border-outline-variant rounded-lg bg-surface">
                      <span className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-bold ${stat.bg_color} ${stat.text_color}`}>
                        {stat.name}
                      </span>
                      <button onClick={() => handleDeleteStatus(stat.id)} className="text-error hover:opacity-70">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: CHAMADOS (EXCLUSÃO EM MASSA - ADMIN ONLY) */}
        {activeTab === 'chamados' && profile?.role === 'admin' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-4 shadow-sm">
            <h2 className="font-title-sm text-error border-b border-outline-variant pb-2">Administração de Chamados (Ação Crítica)</h2>
            <div className="p-3 bg-error-container/30 border border-error/20 rounded-lg text-xs text-on-error-container flex gap-2">
              <span className="material-symbols-outlined text-[18px] text-error shrink-0">warning</span>
              <p>Esta operação é destrutiva e excluirá permanentemente **todos** os chamados, prioridades e status associados a eles no banco de dados. Exige confirmação de e-mail e senha de administrador.</p>
            </div>

            <form onSubmit={handleDeleteAllTickets} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">E-mail do Administrador Logado</label>
                <input 
                  type="email" 
                  value={confirmEmail} 
                  onChange={(e) => setConfirmEmail(e.target.value)} 
                  required
                  placeholder={user?.email || 'admin@admin.com'}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-error outline-none animate-all" 
                />
              </div>
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Sua Senha de Administrador</label>
                <input 
                  type="password" 
                  value={confirmPasswordForDelete} 
                  onChange={(e) => setConfirmPasswordForDelete(e.target.value)} 
                  required
                  placeholder="Insira sua senha atual"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-error outline-none animate-all" 
                />
              </div>
              <button 
                type="submit" 
                disabled={deletingAllTickets} 
                className="w-full py-2 bg-error text-on-error rounded-lg font-label-caps uppercase hover:opacity-90 disabled:opacity-50 transition-opacity font-bold mt-2"
              >
                {deletingAllTickets ? 'Excluindo...' : 'Excluir Todos os Chamados'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* MODAL DE USUÁRIO (CADASTRAR / EDITAR) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-md shadow-lg flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-outline-variant pb-2">
              <h3 className="font-title-sm text-primary">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="text-on-surface-variant hover:text-primary p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Nome Completo</label>
                <input 
                  type="text" 
                  value={uName} 
                  onChange={(e) => setUName(e.target.value)} 
                  required
                  placeholder="Ex: João Silva"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>

              <div>
                <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">E-mail</label>
                <input 
                  type="email" 
                  value={uEmail} 
                  onChange={(e) => setUEmail(e.target.value)} 
                  required
                  placeholder="exemplo@email.com"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>

              <div>
                <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Cargo / Tipo</label>
                <select
                  value={uRole}
                  onChange={(e) => setURole(e.target.value as any)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:outline-none"
                >
                  <option value="cliente">Cliente (Somente Chamados)</option>
                  <option value="tecnico">Técnico (Gerencia Chamados)</option>
                  <option value="admin">Administrador (Acesso Completo)</option>
                </select>
              </div>

              <div>
                <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Telefone</label>
                <input 
                  type="text" 
                  value={uPhone} 
                  onChange={(e) => setUPhone(e.target.value)} 
                  placeholder="(99) 99999-9999"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>

              <div>
                <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">
                  {editingUser ? 'Senha (deixe em branco para manter)' : 'Senha'}
                </label>
                <input 
                  type="password" 
                  value={uPassword} 
                  onChange={(e) => setUPassword(e.target.value)} 
                  required={!editingUser}
                  placeholder={editingUser ? 'Nova senha opcional' : 'Mínimo 6 caracteres'}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm focus:ring-2 focus:ring-primary outline-none" 
                />
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 bg-surface-container border border-outline-variant rounded-lg font-label-caps text-xs uppercase hover:opacity-80 transition-opacity"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submittingUser}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-caps text-xs uppercase hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {submittingUser ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
