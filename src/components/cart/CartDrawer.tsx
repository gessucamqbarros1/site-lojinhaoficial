import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart, formatBRL } from '@/hooks/useCart';

const CartDrawer: React.FC = () => {
  const { items, isOpen, setIsOpen, setQuantity, removeItem, subtotal } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-playfair text-vintage-brown">Seu carrinho</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-vintage-dark/70">
              <ShoppingBag className="mx-auto mb-3 text-vintage-brown/50" size={40} />
              <p className="text-sm">Seu carrinho está vazio.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center border-b border-vintage-beige/30 pb-3">
                <img
                  src={item.image || '/placeholder.svg'}
                  alt={item.name}
                  loading="lazy"
                  className="w-16 h-16 rounded-md object-cover bg-vintage-cream"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1 text-vintage-dark">{item.name}</p>
                  <p className="text-sm text-vintage-brown">{formatBRL(item.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      aria-label="Diminuir quantidade"
                      className="p-1 rounded border border-vintage-beige/50 hover:bg-vintage-beige/20"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label="Aumentar quantidade"
                      className="p-1 rounded border border-vintage-beige/50 hover:bg-vintage-beige/20"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label="Remover item"
                      className="p-1 ml-auto text-destructive hover:opacity-70"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <SheetFooter className="flex-col gap-3 sm:flex-col">
          <div className="flex items-center justify-between w-full text-vintage-dark">
            <span className="text-sm">Subtotal</span>
            <span className="font-semibold">{formatBRL(subtotal)}</span>
          </div>
          <Button asChild disabled={items.length === 0} className="w-full">
            <Link to="/checkout" onClick={() => setIsOpen(false)}>
              Finalizar compra
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
