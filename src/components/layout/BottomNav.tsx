export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container border-t border-outline-variant flex justify-around items-center h-16 w-full px-xs">
      <button className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 transition-transform scale-95">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        <span className="font-label-caps text-[10px] mt-0.5">Início</span>
      </button>
      <button className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high p-2 rounded-xl transition-all">
        <span className="material-symbols-outlined">list_alt</span>
        <span className="font-label-caps text-[10px] mt-0.5">Chamados</span>
      </button>
      <button className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high p-2 rounded-xl transition-all">
        <span className="material-symbols-outlined">bar_chart</span>
        <span className="font-label-caps text-[10px] mt-0.5">Relatórios</span>
      </button>
      <button className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high p-2 rounded-xl transition-all">
        <span className="material-symbols-outlined">settings</span>
        <span className="font-label-caps text-[10px] mt-0.5">Ajustes</span>
      </button>
    </nav>
  );
}
