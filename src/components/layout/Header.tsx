export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-header border-b border-outline-variant h-16 px-gutter flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 mr-4">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-sm focus:ring-2 focus:ring-primary-container outline-none transition-all" placeholder="Buscar chamados..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-1 hover:bg-surface-container-high rounded-full transition-colors">
          <span className="material-symbols-outlined text-on-surface">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
        </button>
        <img className="w-9 h-9 rounded-full border border-outline-variant object-cover" alt="Perfil" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhCeYvZAu5yaJCcx7rzzl7QW1MGt70kev60miaenC9yFmj_C5ilSLFSZbU7osxdCqTikSbBxQeCDZUdMQz-trh60vaKCqpQLKszGophMWq1HuvhNUlud17n_TmXXK7qbTa022DT43UIi0YOdsYLbMKPuqOGnKYlhoMk-k2Rg8nBthhRwGJtwXj1J6FbEQwYt9dezdg1i8-P0J-zkhlCiBMEcY1W_RZQbVM4-sNKnMBg2I6Am6PFFwkxzqyIXigFNTx7sL_4A4KoH8"/>
      </div>
    </header>
  );
}
