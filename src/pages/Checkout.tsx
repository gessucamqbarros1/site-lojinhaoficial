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

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  const [couponCode, setCouponCode] = useState('');
  const [couponPercent, setCouponPercent] = useState(0);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot: humans never fill this
  const formOpenedAt = useRef(Date.now());

  const discount = (subtotal * couponPercent) / 100;
  const total = Math.max(subtotal - discount, 0);

  // NOTE: coupon validity is checked here, but the resulting discount/total
  // is still trusted from the client when the order is inserted below. A
  // user can bypass this check via devtools. Closing that gap requires a
  // server-side RPC (e.g. validate_coupon) or a BEFORE INSERT trigger on
  // `orders` that recomputes discount/total from `coupon_code` — tracked
  // as a follow-up alongside the Supabase schema reconciliation.
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidating(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('active', true)
      .maybeSingle();
    setValidating(false);

    const expired = data?.expires_at ? new Date(data.expires_at) < new Date() : false;
    const exhausted = data?.max_uses != null && data.used_count >= data.max_uses;

    if (error || !data || expired || exhausted) {
      setCouponPercent(0);
      toast({ title: 'Cupom inválido', description: 'Verifique o código e tente novamente.', variant: 'destructive' });
      return;
    }
    setCouponPercent(data.discount_percentage);
    toast({ title: 'Cupom aplicado', description: `${data.discount_percentage}% de desconto.` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Anti-spam: honeypot field filled, or form submitted implausibly fast.
    if (website.trim() !== '' || Date.now() - formOpenedAt.current < 1500) {
      return;
    }

    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id ?? null,
          customer_name: form.name,
          customer_email: form.email || null,
          customer_phone: form.phone || null,
          address: form.address || null,
          notes: form.notes || null,
          subtotal,
          discount,
          total,
          coupon_code: couponPercent > 0 ? couponCode.trim().toUpperCase() : null,
        })
        .select()
        .single();

      if (error) throw error;

      const { error: itemsError } = await supabase.from('order_items').insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          product_name: i.name,
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
      const message = `Olá! Fiz um pedido no site.\n\nPedido: ${order.id.slice(0, 8)}\nNome: ${form.name}\n\n${lines}\n\nSubtotal: ${formatBRL(subtotal)}\nDesconto: ${formatBRL(discount)}\nTotal: ${formatBRL(total)}`;

      clear();
      toast({ title: 'Pedido enviado!', description: 'Vamos confirmar os detalhes com você.' });

      if (settings?.whatsapp_number) {
        window.open(`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank');
      }
      navigate('/orders');
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
                <div>
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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

                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Cupom de desconto"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button type="button" variant="secondary" onClick={applyCoupon} disabled={validating}>
                    Aplicar
                  </Button>
                </div>

                <div className="space-y-1 text-sm border-t border-vintage-beige/30 pt-3">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Desconto</span><span>-{formatBRL(discount)}</span></div>
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
