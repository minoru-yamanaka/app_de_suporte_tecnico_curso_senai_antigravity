export interface TicketProps {
  id: string;
  title: string;
  priority: 'Baixa' | 'Alta' | 'Crítica';
  area: string;
  icon: string;
  status: string;
  statusColor: string;
  statusBg: string;
}

export function TicketCard({ ticket }: { ticket: TicketProps }) {
  const priorityStyles = {
    'Crítica': 'bg-error-container text-on-error-container',
    'Alta': 'bg-tertiary-fixed text-on-tertiary-fixed',
    'Baixa': 'bg-surface-container-high text-on-surface-variant',
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-md">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="font-data-mono text-data-mono text-on-surface-variant mb-1">ID #{ticket.id}</span>
          <h3 className="font-title-sm text-title-sm text-primary">{ticket.title}</h3>
        </div>
        <span className={`px-2 py-1 font-label-caps text-label-caps rounded uppercase ${priorityStyles[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      
      <div className="flex gap-2 items-center text-body-sm">
        <span className="material-symbols-outlined text-[18px] text-secondary">{ticket.icon}</span>
        <span className="text-on-surface-variant">{ticket.area}</span>
        <span className="mx-1 text-outline">•</span>
        <span className={`flex items-center gap-1 font-semibold ${ticket.statusColor}`}>
          <span className={`w-2 h-2 rounded-full ${ticket.statusBg}`}></span>
          {ticket.status}
        </span>
      </div>

      <div className="flex gap-2 pt-xs border-t border-surface-container-low">
        <button className="flex-1 py-2 bg-surface-container-high text-on-surface-variant rounded-lg font-label-caps text-label-caps uppercase hover:bg-outline-variant transition-colors">
          Ver Detalhes
        </button>
        <button className="flex-1 py-2 bg-primary-container text-on-primary rounded-lg font-label-caps text-label-caps uppercase hover:opacity-90 transition-opacity">
          Atribuir
        </button>
      </div>
    </div>
  );
}
