import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TicketCard } from '../components/tickets/TicketCard';
import type { TicketProps } from '../components/tickets/TicketCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function MyTickets() {
  const { profile, user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [tickets, setTickets] = useState<TicketProps[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyTickets();
      fetchStatuses();
    }
  }, [user]);

  const fetchStatuses = async () => {
    const { data } = await supabase.from('statuses').select('*').order('name');
    if (data) setStatuses(data);
  };

  const fetchMyTickets = async () => {
    setLoading(true);
    let query = supabase
      .from('tickets')
      .select(`
        id, subject, description, priority, created_by, status_id, assigned_to,
        categories (name, icon),
        statuses (id, name, text_color, bg_color),
        creator:profiles!created_by(id, name),
        assignee:profiles!assigned_to(id, name)
      `)
      .order('created_at', { ascending: false });

    // Restringe o filtro de proprietário de chamados apenas se o cargo for cliente
    if (profile?.role === 'cliente') {
      query = query.eq('created_by', user?.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (!data) return;

    const formatted: TicketProps[] = data.map((t: any) => ({
      id: t.id.toString(),
      title: t.subject,
      description: t.description || '',
      priority: t.priority,
      area: t.categories?.name || 'TI/Geral',
      icon: t.categories?.icon || 'computer',
      status: t.statuses?.name || 'Pendente',
      statusId: t.statuses?.id || t.status_id,
      statusColor: t.statuses?.text_color || 'text-on-surface-variant',
      statusBg: t.statuses?.bg_color || 'bg-outline',
      creatorId: t.created_by,
      creatorName: t.creator?.name || 'Usuário',
      assignedToId: t.assigned_to,
      assignedToName: t.assignee?.name || null
    }));
    
    setTickets(formatted);
    setLoading(false);
  };

  // Filtragem local
  const filteredTickets = tickets.filter((ticket) => {
    const matchStatus = statusFilter === 'Todos' ? true : ticket.status === statusFilter;
    const matchSearch = searchQuery
      ? ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchStatus && matchSearch;
  });

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Cabeçalho Responsivo da Página com Filtro e Informações */}
      <div className="flex justify-between items-center mb-lg flex-wrap gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight mb-2">
            {profile?.role === 'cliente' ? 'Meus Chamados' : 'Gerenciamento de Chamados'}
          </h1>
          <p className="text-on-surface-variant font-body-sm">
            {profile?.role === 'cliente' 
              ? `Acompanhe o status dos chamados que você abriu, ${profile?.name}.`
              : `Gerencie e atribua todos os chamados abertos no portal, ${profile?.name}.`}
          </p>
        </div>

        {/* Combo de status para filtrar */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-sm text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
          >
            <option value="Todos">Todos os Status</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.name}>{st.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        {loading ? (
          <p className="text-on-surface-variant">Carregando chamados...</p>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant text-center shadow-sm">
             <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">inbox</span>
             <p className="text-on-surface-variant font-body-md">Nenhum chamado encontrado.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onUpdate={fetchMyTickets} />
          ))
        )}
      </div>
    </section>
  );
}
