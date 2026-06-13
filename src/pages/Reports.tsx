import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        id,
        categories (name),
        statuses (name)
      `);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (!tickets) return;

    setTotalTickets(tickets.length);

    const statusesMap: Record<string, { count: number, color: string }> = {
      'Pendente': { count: 0, color: '#75777d' },
      'Em Progresso': { count: 0, color: '#505f76' },
      'Validando': { count: 0, color: '#ddc39d' },
      'Concluído': { count: 0, color: '#bcc7de' }
    };

    const categoriesMap: Record<string, { count: number, color: string }> = {
      'Informática/TI': { count: 0, color: '#091426' },
      'Elétrica': { count: 0, color: '#505f76' },
      'Predial/Civil': { count: 0, color: '#1e1200' },
      'Segurança': { count: 0, color: '#ba1a1a' },
      'Telecom': { count: 0, color: '#545f73' }
    };

    tickets.forEach((ticket: any) => {
      const statusName = ticket.statuses?.name;
      const catName = ticket.categories?.name;
      
      if (statusName && statusesMap[statusName]) {
        statusesMap[statusName].count += 1;
      }
      
      if (catName && categoriesMap[catName]) {
        categoriesMap[catName].count += 1;
      }
    });

    setStatusData(Object.keys(statusesMap).map(key => ({
      name: key,
      value: statusesMap[key].count,
      color: statusesMap[key].color
    })));

    setCategoryData(Object.keys(categoriesMap).map(key => ({
      name: key,
      value: categoriesMap[key].count,
      color: categoriesMap[key].color
    })));

    setLoading(false);
  };

  if (loading) {
    return <div className="text-on-surface-variant font-body-sm p-4">Carregando relatórios...</div>;
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-headline-md text-headline-md text-primary tracking-tight mb-lg">Relatórios e Estatísticas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col justify-center items-center shadow-sm">
          <span className="text-display-lg text-primary font-bold">{totalTickets}</span>
          <span className="font-label-caps text-on-surface-variant uppercase mt-2">Total de Chamados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg pb-10">
        {/* Gráfico de Status */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <h2 className="font-title-sm text-primary mb-6">Chamados por Status</h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Categorias */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <h2 className="font-title-sm text-primary mb-6">Chamados por Categoria</h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
