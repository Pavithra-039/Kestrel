import { type FormEvent, useRef, useState } from 'react';
import { CheckoutPanel } from './components/CheckoutPanel';
import { ProductCard } from './components/ProductCard';
import { RecentOrdersSection } from './components/RecentOrdersSection';
import { PRODUCTS } from './data/products';
import type {
  CartItem,
  OrderConfirmation,
  Product,
  ValidationErrors,
} from './types/checkout';
import {
  appendRecentOrder,
  clearRecentOrdersStorage,
  loadRecentOrders,
} from './utils/orderStorage';

function generateOrderReference(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `KST-${randomDigits}`;
}

export function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(
    null,
  );
  const [recentOrders, setRecentOrders] = useState<OrderConfirmation[]>(() =>
    loadRecentOrders(),
  );

  // Synchronous submission lock prevents duplicate confirmations on rapid double-click
  // before React commits the state update.
  const orderSubmittedLockRef = useRef(false);

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalCents = cart.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  const shippingCents = 0;
  const totalCents = subtotalCents + shippingCents;

  function handleAddToCart(product: Product) {
    if (orderSubmittedLockRef.current || confirmation) {
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(99, item.quantity + 1) }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setErrors((prev) => {
      if (!prev.cart) return prev;
      const { cart: _removed, ...rest } = prev;
      return rest;
    });
  }

  function handleUpdateQuantity(productId: string, nextQuantity: number) {
    if (orderSubmittedLockRef.current || confirmation) {
      return;
    }

    if (nextQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const clamped = Math.min(99, Math.max(1, nextQuantity));
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: clamped } : item,
      ),
    );
  }

  function handleRemoveItem(productId: string) {
    if (orderSubmittedLockRef.current || confirmation) {
      return;
    }

    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }

  function handleCustomerNameChange(value: string) {
    setCustomerName(value);
    if (value.trim().length > 0 && errors.customerName) {
      setErrors((prev) => {
        const { customerName: _removed, ...rest } = prev;
        return rest;
      });
    }
  }

  function handlePlaceOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (orderSubmittedLockRef.current || confirmation) {
      return;
    }

    const nextErrors: ValidationErrors = {};
    const trimmedName = customerName.trim();

    if (cart.length === 0) {
      nextErrors.cart =
        'Your bag is empty. Add at least one item before placing your order.';
    }

    if (trimmedName.length === 0) {
      nextErrors.customerName =
        'Please enter your full name to place your order.';
    }

    if (nextErrors.cart || nextErrors.customerName) {
      setErrors(nextErrors);
      return;
    }

    orderSubmittedLockRef.current = true;
    setErrors({});

    const newOrder: OrderConfirmation = {
      reference: generateOrderReference(),
      customerName: trimmedName,
      orderNote: orderNote.trim(),
      items: cart.map((item) => ({ ...item })),
      subtotalCents,
      shippingCents,
      totalCents,
      placedAt: new Date().toISOString(),
    };

    setConfirmation(newOrder);
    setRecentOrders((prev) => appendRecentOrder(newOrder, prev));
  }

  function handleStartNewOrder() {
    orderSubmittedLockRef.current = false;
    setConfirmation(null);
    setCart([]);
    setCustomerName('');
    setOrderNote('');
    setErrors({});
  }

  function handleViewReceipt(order: OrderConfirmation) {
    orderSubmittedLockRef.current = true;
    setErrors({});
    setConfirmation(order);
    scrollToSection('checkout-summary');
  }

  function handleReorder(order: OrderConfirmation) {
    orderSubmittedLockRef.current = false;
    setConfirmation(null);
    setErrors({});

    // Rehydrate items against current catalog prices while preserving quantities.
    const nextCart: CartItem[] = order.items
      .map((item) => {
        const catalogProduct = PRODUCTS.find((p) => p.id === item.product.id);
        return catalogProduct
          ? { product: catalogProduct, quantity: Math.min(99, Math.max(1, item.quantity)) }
          : null;
      })
      .filter((entry): entry is CartItem => entry !== null);

    setCart(nextCart);
    setCustomerName(order.customerName);
    setOrderNote(order.orderNote);
    scrollToSection('checkout-summary');
  }

  function handleClearHistory() {
    clearRecentOrdersStorage();
    setRecentOrders([]);
  }

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-900">
      <header className="border-b border-stone-200 bg-[#FAF9F6]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          <a
            href="#top"
            className="font-display text-xl font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0"
          >
            Kestrel Goods
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600"
          >
            <a
              href="#catalog"
              className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Catalog
            </a>
            <a
              href="#checkout-summary"
              className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Checkout
            </a>
            <a
              href="#recent-orders"
              className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Recent Orders
            </a>
            <a
              href="#shipping-policy"
              className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Shipping
            </a>
          </nav>

          <button
            type="button"
            onClick={() => scrollToSection('checkout-summary')}
            className="rounded-lg bg-[#1E3A34] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#152A25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A34] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="font-mono tabular-nums">Bag ({totalQuantity})</span>
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-10 lg:py-12">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 [text-wrap:balance]">
            Studio Objects & Checkout
          </h1>
          <p className="mt-3 text-base text-stone-600 leading-relaxed">
            Select your pieces below, adjust quantities in real time, and complete your order on a single page.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section
            id="catalog"
            aria-labelledby="catalog-heading"
            className="lg:col-span-7"
          >
            <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-stone-200">
              <h2
                id="catalog-heading"
                className="text-base font-semibold text-stone-900"
              >
                Studio Catalog
              </h2>
              <span className="text-xs text-stone-500 font-mono tabular-nums">
                {PRODUCTS.length} items
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {PRODUCTS.map((product) => {
                const cartEntry = cart.find(
                  (item) => item.product.id === product.id,
                );
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantityInCart={cartEntry ? cartEntry.quantity : 0}
                    isOrderLocked={Boolean(confirmation)}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>

            <div className="mt-10 border-t border-stone-200 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div id="shipping-policy">
                <h3 className="text-sm font-semibold text-stone-900">
                  Complimentary Dispatch
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                  All studio orders ship free in plastic-free molded pulp packaging within two business days.
                </p>
              </div>
              <div id="returns-policy">
                <h3 className="text-sm font-semibold text-stone-900">
                  30-Day Studio Returns
                </h3>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                  Unused stoneware and walnut pieces may be returned within 30 days using your order reference.
                </p>
              </div>
            </div>
          </section>

          <div className="lg:col-span-5">
            <CheckoutPanel
              items={cart}
              subtotalCents={subtotalCents}
              shippingCents={shippingCents}
              totalCents={totalCents}
              customerName={customerName}
              orderNote={orderNote}
              errors={errors}
              confirmation={confirmation}
              onCustomerNameChange={handleCustomerNameChange}
              onOrderNoteChange={setOrderNote}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onPlaceOrder={handlePlaceOrder}
              onStartNewOrder={handleStartNewOrder}
            />
          </div>
        </div>

        <RecentOrdersSection
          orders={recentOrders}
          activeReference={confirmation ? confirmation.reference : null}
          onViewReceipt={handleViewReceipt}
          onReorder={handleReorder}
          onClearHistory={handleClearHistory}
        />
      </main>

      <footer className="border-t border-stone-200 bg-[#FAF9F6]">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-500">
          <span>Kestrel Goods Workshop · Portland, Oregon</span>
          <span>Prices in USD · Single-page checkout</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
