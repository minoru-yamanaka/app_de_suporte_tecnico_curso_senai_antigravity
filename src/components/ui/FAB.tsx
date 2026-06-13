import { useEffect, useState } from 'react';

export function FAB() {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > lastScroll && currentScroll > 50) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button className={`fixed bottom-20 right-gutter bg-primary-container text-on-primary h-14 rounded-full shadow-lg flex items-center gap-2 z-50 active:scale-95 transition-all duration-300 ${isExpanded ? 'pl-4 pr-6' : 'w-14 justify-center p-0'}`}>
      <span className="material-symbols-outlined">add</span>
      {isExpanded && (
        <span className="font-label-caps text-label-caps uppercase tracking-wider whitespace-nowrap">Novo Chamado</span>
      )}
    </button>
  );
}
