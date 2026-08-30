import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { LogOut, Package, Heart, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductSkeleton from '@/components/ui/ProductSkeleton';

const Account = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites'>('orders');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-vintage-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-vintage-brown animate-pulse">Carregando...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-vintage-background">
      <Navbar />
      
      <main className="flex-grow vintage-container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-vintage-beige/30 p-6 md:p-8 mb-8 animate-fade-up">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-vintage-beige rounded-full flex items-center justify-center text-vintage-brown">
                  <UserIcon size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-playfair text-vintage-brown">Minha Conta</h1>
                  <p className="text-vintage-dark/70">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="text-vintage-brown border-vintage-beige hover:bg-vintage-beige/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-vintage-beige/30 overflow-hidden animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex border-b border-vintage-beige/30">
              <button
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                  activeTab === 'orders' 
                    ? 'text-primary border-b-2 border-primary bg-vintage-beige/10' 
                    : 'text-vintage-dark/70 hover:bg-vintage-beige/5'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={20} />
                Meus Pedidos
              </button>
              <button
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                  activeTab === 'favorites' 
                    ? 'text-primary border-b-2 border-primary bg-vintage-beige/10' 
                    : 'text-vintage-dark/70 hover:bg-vintage-beige/5'
                }`}
                onClick={() => setActiveTab('favorites')}
              >
                <Heart size={20} />
                Favoritos
              </button>
            </div>

            <div className="p-6 md:p-8 min-h-[300px]">
              {activeTab === 'orders' ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-vintage-beige mb-4" />
                  <h3 className="text-xl font-playfair text-vintage-brown mb-2">Nenhum pedido ainda</h3>
                  <p className="text-vintage-dark/70 mb-6">Você ainda não realizou nenhuma compra conosco.</p>
                  <Button onClick={() => navigate('/products')} className="bg-vintage-brown hover:bg-vintage-brown/90 text-white">
                    Ver Produtos
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart size={48} className="mx-auto text-vintage-beige mb-4" />
                  <h3 className="text-xl font-playfair text-vintage-brown mb-2">Sem favoritos</h3>
                  <p className="text-vintage-dark/70 mb-6">Você ainda não salvou nenhum produto como favorito.</p>
                  <Button onClick={() => navigate('/products')} className="bg-vintage-brown hover:bg-vintage-brown/90 text-white">
                    Explorar Produtos
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
