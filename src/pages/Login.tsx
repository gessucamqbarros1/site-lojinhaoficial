import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { signIn, signUp, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Se já estiver logado, redireciona
  React.useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/account';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUp(email, password, '/account');
    } else {
      await signIn(email, password);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-vintage-background">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fade-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-playfair text-vintage-brown mb-2">
              {isSignUp ? 'Criar Conta' : 'Acesse sua Conta'}
            </h1>
            <p className="text-vintage-dark/70">
              {isSignUp 
                ? 'Preencha os dados abaixo para se cadastrar.' 
                : 'Insira seu email e senha para entrar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-vintage-brown hover:bg-vintage-brown/90 text-white mt-6"
              disabled={loading}
            >
              {loading ? 'Aguarde...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-vintage-dark/70">
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 text-primary hover:underline font-medium"
            >
              {isSignUp ? 'Faça Login' : 'Cadastre-se'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
