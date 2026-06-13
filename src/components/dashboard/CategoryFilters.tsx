export function CategoryFilters() {
  const categories = [
    { label: 'Informática/TI', active: true },
    { label: 'Elétrica', active: false },
    { label: 'Predial/Civil', active: false },
    { label: 'Segurança', active: false },
    { label: 'Telecom', active: false },
  ];

  return (
    <section className="mb-md">
      <div className="flex items-center justify-between mb-sm">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Categorias</h2>
        <button className="text-primary font-label-caps text-label-caps uppercase">Ver Todas</button>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-gutter px-gutter pb-1">
        {categories.map((cat, index) => (
          <button
            key={index}
            className={`px-4 py-1.5 rounded-full font-body-sm whitespace-nowrap border ${
              cat.active
                ? 'bg-primary-container text-on-primary border-transparent'
                : 'bg-surface-container-high text-on-surface-variant border-outline-variant'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </section>
  );
}
