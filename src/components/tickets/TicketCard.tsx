import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export interface TicketProps {
  id: string;
  title: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  area: string;
  icon: string;
  status: string;
  statusId: string;
  statusColor: string;
  statusBg: string;
  creatorId: string;
  creatorName: string;
  assignedToId: string | null;
  assignedToName: string | null;
}

interface TicketCardProps {
  ticket: TicketProps;
  onUpdate?: () => void;
}

export function TicketCard({ ticket, onUpdate }: TicketCardProps) {
  const { profile } = useAuth();
  
  // Controle de Modais e Edição
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [ticketStatusId, setTicketStatusId] = useState(ticket.statusId);
  const [ticketPriority, setTicketPriority] = useState(ticket.priority);
  const [assignedTo, setAssignedTo] = useState<string | null>(ticket.assignedToId);
  
  // Listas do Banco de Dados
  const [supportUsers, setSupportUsers] = useState<any[]>([]);
  const [statusesList, setStatusesList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isDetailsModalOpen) {
      loadModalData();
    }
  }, [isDetailsModalOpen]);

  const loadModalData = async () => {
    // Carrega usuários de suporte (tecnicos e admins)
    const { data: users } = await supabase
      .from('profiles')
      .select('id, name, role')
      .in('role', ['tecnico', 'admin'])
      .order('name');
    if (users) setSupportUsers(users);

    // Carrega a lista de status cadastrados
    const { data: stats } = await supabase
      .from('statuses')
      .select('id, name')
      .order('name');
    if (stats) setStatusesList(stats);
  };

  const priorityStyles = {
    'Crítica': 'bg-error-container text-on-error-container',
    'Alta': 'bg-tertiary-fixed text-on-tertiary-fixed',
    'Média': 'bg-secondary-container text-on-secondary-container',
    'Baixa': 'bg-surface-container-high text-on-surface-variant',
  };

  // Atribuir a mim mesmo
  const handleAssignToMe = async () => {
    if (!profile || (profile.role !== 'tecnico' && profile.role !== 'admin')) {
      alert('Apenas usuários de suporte podem assumir chamados!');
      return;
    }
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: profile.id })
        .eq('id', Number(ticket.id));
      if (error) throw error;
      alert('Chamado atribuído a você com sucesso!');
      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert('Erro ao atribuir chamado: ' + err.message);
    }
  };

  // Salvar alterações do chamado
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status_id: ticketStatusId,
          priority: ticketPriority,
          assigned_to: assignedTo || null
        })
        .eq('id', Number(ticket.id));
      
      if (error) throw error;
      alert('Chamado atualizado com sucesso!');
      setIsDetailsModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert('Erro ao salvar chamado: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Excluir chamado (apenas Admin)
  const handleDeleteTicket = async () => {
    if (!confirm('Deseja realmente excluir este chamado permanentemente?')) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', Number(ticket.id));
      
      if (error) throw error;
      alert('Chamado excluído com sucesso!');
      setIsDetailsModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert('Erro ao excluir chamado: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isSupport = profile?.role === 'tecnico' || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-md shadow-sm hover:border-primary-container/20 transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="font-data-mono text-data-mono text-on-surface-variant mb-1">ID #{ticket.id}</span>
          <h3 className="font-title-sm text-title-sm text-primary font-semibold">{ticket.title}</h3>
        </div>
        <span className={`px-2 py-1 font-label-caps text-label-caps rounded uppercase font-bold tracking-wider ${priorityStyles[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      
      <div className="flex gap-2 items-center text-body-sm flex-wrap">
        <span className="material-symbols-outlined text-[18px] text-secondary">{ticket.icon}</span>
        <span className="text-on-surface-variant">{ticket.area}</span>
        <span className="mx-1 text-outline">•</span>
        <span className={`flex items-center gap-1 font-semibold ${ticket.statusColor}`}>
          <span className={`w-2 h-2 rounded-full ${ticket.statusBg}`}></span>
          {ticket.status}
        </span>
        {ticket.assignedToName && (
          <>
            <span className="mx-1 text-outline">•</span>
            <span className="text-on-surface-variant text-[12px] italic">Atribuído a: {ticket.assignedToName}</span>
          </>
        )}
      </div>

      <div className="flex gap-2 pt-xs border-t border-surface-container-low">
        <button 
          onClick={() => setIsDetailsModalOpen(true)}
          className="flex-1 py-2 bg-surface-container-high text-on-surface-variant rounded-lg font-label-caps text-label-caps uppercase hover:bg-outline-variant transition-colors"
        >
          Ver Detalhes
        </button>
        {isSupport && (
          <button 
            onClick={handleAssignToMe}
            className="flex-1 py-2 bg-primary-container text-on-primary rounded-lg font-label-caps text-label-caps uppercase hover:opacity-90 transition-opacity"
            title="Atribuir chamado a mim mesmo"
          >
            Atribuir
          </button>
        )}
      </div>

      {/* MODAL DE DETALHES E EDIÇÃO */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg p-md shadow-lg flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-outline-variant pb-2">
              <h3 className="font-title-sm text-primary font-bold">
                Detalhes do Chamado #{ticket.id}
              </h3>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-on-surface-variant hover:text-primary p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <span className="font-label-caps text-on-surface-variant text-xs">Assunto</span>
                <p className="font-title-sm text-on-surface font-semibold text-sm mt-0.5">{ticket.title}</p>
              </div>

              <div>
                <span className="font-label-caps text-on-surface-variant text-xs">Descrição</span>
                <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm text-on-surface whitespace-pre-wrap mt-0.5 max-h-[150px] overflow-y-auto">
                  {ticket.description || <span className="italic text-on-surface-variant">Nenhuma descrição fornecida.</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline-variant pt-3">
                <div>
                  <span className="font-label-caps text-on-surface-variant text-xs block mb-1">Criado por</span>
                  <span className="text-sm font-semibold text-on-surface">{ticket.creatorName}</span>
                </div>
                <div>
                  <span className="font-label-caps text-on-surface-variant text-xs block mb-1">Área / Categoria</span>
                  <span className="text-sm text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">{ticket.icon}</span>
                    {ticket.area}
                  </span>
                </div>
              </div>

              {/* Status / Prioridade / Atribuição (Condicional conforme Cargo) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline-variant pt-3">
                
                {/* STATUS: Editável por Admin e Técnico */}
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Status do Chamado</label>
                  {isSupport ? (
                    <select
                      value={ticketStatusId}
                      onChange={(e) => setTicketStatusId(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 font-body-sm focus:outline-none"
                    >
                      {statusesList.map((st) => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider inline-block ${ticket.statusBg} ${ticket.statusColor}`}>
                      {ticket.status}
                    </span>
                  )}
                </div>

                {/* PRIORIDADE: Editável apenas por Admin */}
                <div>
                  <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Prioridade</label>
                  {isAdmin ? (
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as any)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 font-body-sm focus:outline-none"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                      <option value="Crítica">Crítica</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider inline-block ${priorityStyles[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  )}
                </div>

                {/* ATRIBUÍDO A: Editável apenas por Admin/Técnico. Só exibe usuários de suporte. */}
                {isSupport && (
                  <div className="md:col-span-2 border-t border-surface-container-low pt-3">
                    <label className="block font-label-caps text-on-surface-variant mb-1 text-xs">Atribuído a (Suporte)</label>
                    <select
                      value={assignedTo || ''}
                      onChange={(e) => setAssignedTo(e.target.value || null)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 font-body-sm focus:outline-none"
                    >
                      <option value="">Não Atribuído / Ninguém</option>
                      {supportUsers.map((usr) => (
                        <option key={usr.id} value={usr.id}>
                          {usr.name} ({usr.role === 'admin' ? 'Admin' : 'Técnico'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Ações no rodapé do Modal */}
              <div className="flex gap-2 justify-between mt-4 border-t border-outline-variant pt-3">
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={handleDeleteTicket}
                    disabled={saving}
                    className="px-4 py-2 bg-error-container text-on-error-container rounded-lg font-label-caps text-xs uppercase hover:opacity-90 transition-opacity flex items-center gap-1 font-bold"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Excluir
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="px-4 py-2 bg-surface-container border border-outline-variant rounded-lg font-label-caps text-xs uppercase hover:opacity-85 transition-opacity"
                  >
                    Fechar
                  </button>
                  {isSupport && (
                    <button 
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-caps text-xs uppercase hover:opacity-90 disabled:opacity-50 transition-opacity font-bold"
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
