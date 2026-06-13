import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Convert generic 'admin' username to email if needed
    const loginEmail = email.toLowerCase() === 'admin' ? 'admin@admin.com' : email;
    const loginPassword = password === 'admin' ? 'admin123' : password;

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setError('Credenciais inválidas.');
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-gutter">
      <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant w-full max-w-sm shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-headline-md text-primary mb-2">Suporte Técnico</h1>
          <p className="font-body-sm text-on-surface-variant">Painel Integrado</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-1">Usuário / Email</label>
            <input 
              type="text" 
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-container outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-container outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-primary text-on-primary py-3 rounded-lg font-label-caps uppercase hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
