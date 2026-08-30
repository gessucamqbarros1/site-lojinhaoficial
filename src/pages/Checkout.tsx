import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEO/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart, formatBRL } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // `orders.user_id` is required by the database, so checkout always needs a
  // logged-in user; name/phone/address/notes aren't stored (the `orders`
  // table only tracks user_id/status/total_amount) but are kept here to
  // build the WhatsApp handoff message the store actually uses to fulfill.
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot: humans never fill this
  const formOpenedAt = useRef(Date.now());

  const total = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!user) {
      toast({ title: 'Faça login para continuar', description: 'Você precisa de uma conta para finalizar o pedido.', variant: 'destructive' });
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    // Anti-spam: honeypot field filled, or form submitted implausibly fast.
    if (website.trim() !== '' || Date.now() - formOpenedAt.current < 1500) {
      return;
    }

    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_amount: total,
        })
        .select()
        .single();

      if (error) throw error;

      const { error: itemsError } = await supabase.from('order_items').insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: Number(i.id),
          unit_price: i.price,
          quantity: i.quantity,
        }))
      );
      if (itemsError) throw itemsError;

      // Mensagem no WhatsApp da loja
      const { data: settings } = await supabase
        .from('store_settings')
        .select('whatsapp_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const lines = items.map((i) => `• ${i.quantity}x ${i.name} — ${formatBRL(i.price * i.quantity)}`).join('\n');
      const contactLines = [
        form.name && `Nome: ${form.name}`,
        form.phone && `Telefone: ${form.phone}`,
        form.address && `Endereço: ${form.address}`,
        form.notes && `Observações: ${form.notes}`,
      ].filter(Boolean).join('\n');
      const message = `Olá! Fiz um pedido no site.\n\nPedido: #${order.id}\n${contactLines}\n\n${lines}\n\nTotal: ${formatBRL(total)}`;

      clear();
      toast({ title: 'Pedido enviado!', description: 'Vamos confirmar os detalhes com você.' });

      if (settings?.whatsapp_number) {
        window.open(`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank');
      }
      navigate('/account');
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao finalizar', description: 'Tente novamente em instantes.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Finalizar compra | Minha Lojinha" description="Conclua seu pedido com segurança e rapidez." />
      <Navbar />
      <main className="flex-grow vintage-section">
        <div className="vintage-container max-w-4xl">
          <h1 className="text-3xl font-playfair text-vintage-brown mb-6">Finalizar compra</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-vintage-dark/70 mb-4">Seu carrinho está vazio.</p>
              <Button asChild>
                <Link to="/products">Ver produtos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot: hidden from real users, bots tend to fill every field */}
                <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
                  <Label htmlFor="website">Não preencha este campo</Label>
                  <Input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                {!user && (
                  <p className="text-sm text-vintage-dark/70 bg-vintage-beige/20 rounded-md p-3">
                    Você precisa estar logado para finalizar o pedido.{' '}
                    <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="text-vintage-brown underline">
                      Entrar ou criar conta
                    </Link>
                  </p>
                )}
                <div>
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="address">Endereço de entrega</Label>
                  <Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Confirmar pedido'}
                </Button>
              </form>

              <aside className="vintage-card p-5 h-fit">
                <h2 className="font-playfair text-xl text-vintage-brown mb-4">Resumo</h2>
                <ul className="space-y-2 mb-4">
                  {items.map((i) => (
                    <li key={i.id} className="flex justify-between text-sm">
                      <span className="line-clamp-1 pr-2">{i.quantity}x {i.name}</span>
                      <span>{formatBRL(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-1 text-sm border-t border-vintage-beige/30 pt-3">
                  <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span>{formatBRL(total)}</span></div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
