import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StatusSummary } from '../components/dashboard/StatusSummary';
import { CategoryFilters } from '../components/dashboard/CategoryFilters';
import { TicketCard } from '../components/tickets/TicketCard';
import type { TicketProps } from '../components/tickets/TicketCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [tickets, setTickets] = useState<TicketProps[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    const { data } = await supabase.from('statuses').select('*').order('name');
    if (data) setStatuses(data);
  };

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id, subject, description, priority, created_by, status_id, assigned_to,
        categories (name, icon),
        statuses (id, name, text_color, bg_color),
        creator:profiles!created_by(id, name),
        assignee:profiles!assigned_to(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

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
    const matchCategory = selectedCategory ? ticket.area === selectedCategory : true;
    return matchStatus && matchSearch && matchCategory;
  });

  return (
    <>
      <section className="mb-lg">
        <h1 className="font-headline-md text-headline-md text-primary tracking-tight">Painel de Controle</h1>
        <p className="font-body-sm text-on-surface-variant">Bem-vindo, {profile?.name || 'Carregando...'}</p>
      </section>

      <StatusSummary />
      <CategoryFilters selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <section className="space-y-sm">
        {/* Cabeçalho da Lista com Filtro por Status em Combo */}
        <div className="flex justify-between items-center mb-sm flex-wrap gap-2">
          <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Atividades Recentes</h2>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1 text-xs font-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
          >
            <option value="Todos">Todos os Status</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.name}>{st.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-sm">
          {loading ? (
            <p className="text-on-surface-variant">Carregando chamados...</p>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant text-center shadow-sm">
              <span className="material-symbols-outlined text-[32px] text-outline-variant mb-2">inbox</span>
              <p className="text-on-surface-variant font-body-sm">Nenhum chamado encontrado.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onUpdate={fetchTickets} />
            ))
          )}
        </div>
      </section>
    </>
  );
}
