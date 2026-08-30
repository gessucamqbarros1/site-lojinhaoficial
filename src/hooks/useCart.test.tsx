import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart, formatBRL } from './useCart';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const item = (overrides: Partial<{ id: string; name: string; price: number; image: string }> = {}) => ({
  id: '1',
  name: 'Vestido Floral',
  price: 100,
  image: '/img.jpg',
  ...overrides,
});

describe('formatBRL', () => {
  it('formats a number as Brazilian currency', () => {
    expect(formatBRL(1234.5)).toBe('R$ 1.234,50');
  });

  it('formats zero', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });
});

describe('useCart', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('adds a new item with default quantity 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(item()));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.count).toBe(1);
    expect(result.current.subtotal).toBe(100);
  });

  it('increments quantity when the same item is added again', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(item()));
    act(() => result.current.addItem(item(), 2));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.subtotal).toBe(300);
  });

  it('removes an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(item()));
    act(() => result.current.removeItem('1'));
    expect(result.current.items).toEqual([]);
  });

  it('setQuantity updates quantity, and drops the item at zero or below', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(item()));
    act(() => result.current.setQuantity('1', 5));
    expect(result.current.items[0].quantity).toBe(5);

    act(() => result.current.setQuantity('1', 0));
    expect(result.current.items).toEqual([]);
  });

  it('clear empties the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(item()));
    act(() => result.current.addItem(item({ id: '2' })));
    act(() => result.current.clear());
    expect(result.current.items).toEqual([]);
  });

  it('computes subtotal across multiple distinct items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(item({ id: '1', price: 50 }), 2)); // 100
    act(() => result.current.addItem(item({ id: '2', price: 30 }), 3)); // 90
    expect(result.current.subtotal).toBe(190);
    expect(result.current.count).toBe(5);
  });

  it('persists items to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(item()));
    const stored = JSON.parse(localStorage.getItem('cart') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('1');
  });

  it('throws when used outside a CartProvider', () => {
    expect(() => renderHook(() => useCart())).toThrow('useCart deve ser usado dentro de CartProvider');
  });
});
