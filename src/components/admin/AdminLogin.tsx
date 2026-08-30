
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="py-12">
      <div className="max-w-md mx-auto admin-card p-8">
        <h1 className="text-2xl font-playfair text-vintage-brown mb-6 text-center">
          Acesso Administrativo
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-vintage-dark mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="vintage-input w-full"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-vintage-dark mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="vintage-input w-full"
              placeholder="Digite sua senha"
              required
            />
          </div>
          <button
            type="submit"
            className="admin-button w-full py-2 mb-4"
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-xs text-vintage-dark/60 text-center">
          Contas de administrador são criadas manualmente. Fale com quem gerencia a loja se precisar de acesso.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
