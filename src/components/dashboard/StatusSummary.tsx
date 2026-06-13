export function StatusSummary() {
  return (
    <section className="mb-lg -mx-gutter overflow-x-auto no-scrollbar flex gap-sm px-gutter">
      <div className="min-w-[140px] p-md bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col gap-xs shrink-0">
        <span className="text-primary font-title-sm text-title-sm">12</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Chamados Abertos</span>
      </div>
      <div className="min-w-[140px] p-md bg-secondary-container border border-outline-variant rounded-xl flex flex-col gap-xs shrink-0">
        <span className="text-on-secondary-container font-title-sm text-title-sm">5</span>
        <span className="font-label-caps text-label-caps text-on-secondary-container uppercase">Em Atendimento</span>
      </div>
      <div className="min-w-[140px] p-md bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col gap-xs shrink-0">
        <span className="text-tertiary-container font-title-sm text-title-sm">3</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Aguardando Peças</span>
      </div>
      <div className="min-w-[140px] p-md bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col gap-xs shrink-0">
        <span className="text-on-secondary-fixed-variant font-title-sm text-title-sm">8</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Concluídos Hoje</span>
      </div>
    </section>
  );
}
