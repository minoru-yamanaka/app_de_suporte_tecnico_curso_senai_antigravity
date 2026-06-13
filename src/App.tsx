import React from 'react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { FAB } from './components/ui/FAB';
import { StatusSummary } from './components/dashboard/StatusSummary';
import { CategoryFilters } from './components/dashboard/CategoryFilters';
import { TicketCard, TicketProps } from './components/tickets/TicketCard';

function App() {
  const tickets: TicketProps[] = [
    {
      id: '1024',
      title: 'Falha no Servidor',
      priority: 'Crítica',
      area: 'TI',
      icon: 'computer',
      status: 'Em Progresso',
      statusColor: 'text-primary-container',
      statusBg: 'bg-secondary'
    },
    {
      id: '1025',
      title: 'Troca de Lâmpadas Hall',
      priority: 'Baixa',
      area: 'Elétrica',
      icon: 'electrical_services',
      status: 'Pendente',
      statusColor: 'text-on-surface-variant',
      statusBg: 'bg-outline'
    },
    {
      id: '1026',
      title: 'Manutenção AC Sala 4',
      priority: 'Alta',
      area: 'Predial',
      icon: 'domain',
      status: 'Validando',
      statusColor: 'text-secondary',
      statusBg: 'bg-tertiary-fixed-dim'
    }
  ];

  return (
    <>
      <Header />
      
      <main className="pt-20 pb-24 px-gutter max-w-md mx-auto overflow-x-hidden">
        {/* Welcome Section */}
        <section className="mb-lg">
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight">Painel de Controle</h1>
          <p className="font-body-sm text-on-surface-variant">Bem-vindo, Suporte Nível 1</p>
        </section>

        <StatusSummary />
        <CategoryFilters />

        {/* Ticket List (Main Content) */}
        <section className="space-y-sm">
          <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Atividades Recentes</h2>
          
          <div className="flex flex-col gap-sm">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </section>
      </main>

      <FAB />
      <BottomNav />
    </>
  );
}

export default App;
