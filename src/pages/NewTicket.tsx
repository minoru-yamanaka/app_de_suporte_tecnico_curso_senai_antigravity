import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function NewTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('id, name').then(({ data }) => {
      if (data) {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: statusData } = await supabase.from('statuses').select('id').eq('name', 'Pendente').single();
    
    if (statusData && user) {
      const { error } = await supabase.from('tickets').insert({
        subject,
        description,
        category_id: categoryId,
        status_id: statusData.id,
        created_by: user.id,
        priority: 'Baixa'
      });

      if (!error) navigate('/chamados');
      else alert('Erro ao criar chamado.');
    }
    setLoading(false);
  };


  return (
    <section>
      <h1 className="font-headline-md text-headline-md text-primary tracking-tight mb-lg">Novo Chamado</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant max-w-2xl">
        <div>
          <label className="block font-label-caps text-on-surface-variant mb-1">Assunto</label>
          <input required value={subject} onChange={e => setSubject(e.target.value)} type="text" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-container outline-none" />
        </div>
        <div>
          <label className="block font-label-caps text-on-surface-variant mb-1">Descrição</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-container outline-none" rows={4} />
        </div>
        <div>
          <label className="block font-label-caps text-on-surface-variant mb-1">Categoria</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-container outline-none">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button disabled={loading} type="submit" className="bg-primary text-on-primary py-3 rounded-lg font-label-caps uppercase hover:opacity-90 mt-4">
          {loading ? 'Salvando...' : 'Abrir Chamado'}
        </button>
      </form>
    </section>
  );
}
