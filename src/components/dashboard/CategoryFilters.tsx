import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface CategoryFiltersProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilters({ selectedCategory, onSelectCategory }: CategoryFiltersProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    supabase.from('categories').select('id, name').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  return (
    <section className="mb-md">
      <div className="flex items-center justify-between mb-sm">
        <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Categorias</h2>
        <button 
          onClick={() => onSelectCategory(null)}
          className={`font-label-caps text-label-caps uppercase transition-colors ${
            selectedCategory === null 
              ? 'text-primary font-bold' 
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          Ver Todas
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-gutter px-gutter pb-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isActive ? null : cat.name)}
              className={`px-4 py-1.5 rounded-full font-body-sm whitespace-nowrap border transition-all ${
                isActive
                  ? 'bg-primary-container text-on-primary border-transparent font-semibold shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:bg-surface-container'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

