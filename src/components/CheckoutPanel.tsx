import type { FormEvent } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw, ShoppingBag } from 'lucide-react';
import { formatCents } from '../data/products';
import type {
  CartItem,
  OrderConfirmation,
  ValidationErrors,
} from '../types/checkout';
import { CartItemRow } from './CartItemRow';

interface CheckoutPanelProps {
  items: CartItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  customerName: string;
  orderNote: string;
  errors: ValidationErrors;
  confirmation: OrderConfirmation | null;
  onCustomerNameChange: (value: string) => void;
  onOrderNoteChange: (value: string) => void;
  onUpdateQuantity: (productId: string, nextQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: (e: FormEvent<HTMLFormElement>) => void;
  onStartNewOrder: () => void;
}

export function CheckoutPanel({
  items,
  subtotalCents,
  shippingCents,
  totalCents,
  customerName,
  orderNote,
  errors,
  confirmation,
  onCustomerNameChange,
  onOrderNoteChange,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onStartNewOrder,
}: CheckoutPanelProps) {
  if (confirmation) {
    return (
      <section
        id="checkout-summary"
        aria-labelledby="confirmation-heading"
        data-testid="order-confirmation"
        className="bg-white border border-stone-200 rounded-xl p-6 lg:p-8"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="h-6 w-6 text-[#1E3A34] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <h2
              id="confirmation-heading"
              className="font-display text-2xl font-semibold text-stone-900"
            >
              Order Confirmed
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Thank you, <span className="font-medium text-stone-900">{confirmation.customerName}</span>. Your order has been recorded and is being prepared for dispatch.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-stone-200 bg-[#FAF9F6] p-4 flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-stone-600">Order Reference</span>
          <span
            data-testid="order-reference"
            className="font-mono text-sm font-semibold text-stone-900 tabular-nums"
          >
            {confirmation.reference}
          </span>
        </div>

        <div className="mt-6 border-t border-stone-200 pt-5">
          <h3 className="text-sm font-semibold text-stone-900">Order Receipt</h3>
          <ul className="mt-3 divide-y divide-stone-200">
            {confirmation.items.map((item) => (
              <li
                key={item.product.id}
                className="py-3 flex items-baseline justify-between gap-4 text-sm"
              >
                <span className="text-stone-700">
                  {item.product.name}{' '}
                  <span className="font-mono text-xs text-stone-500 tabular-nums">
                    × {item.quantity}
                  </span>
                </span>
                <span className="font-mono font-medium text-stone-900 tabular-nums shrink-0">
                  {formatCents(item.product.priceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {confirmation.orderNote && (
            <div className="mt-3 border-t border-stone-200 pt-3 text-xs text-stone-600">
              <span className="font-medium text-stone-700">Delivery note: </span>
              <span>{confirmation.orderNote}</span>
            </div>
          )}

          <div className="mt-4 border-t border-stone-200 pt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">
                {formatCents(confirmation.subtotalCents)}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span>Standard Shipping</span>
              <span className="font-mono tabular-nums">
                {confirmation.shippingCents === 0
                  ? 'Free ($0.00)'
                  : formatCents(confirmation.shippingCents)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-base font-semibold text-stone-900">
              <span>Total Paid</span>
              <span
                data-testid="confirmed-total"
                className="font-mono tabular-nums"
              >
                {formatCents(confirmation.totalCents)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartNewOrder}
          data-testid="start-new-order"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A34] whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Start a new order</span>
        </button>
      </section>
    );
  }

  const hasErrors = Boolean(errors.cart || errors.customerName);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section
      id="checkout-summary"
      aria-labelledby="checkout-heading"
      className="bg-white border border-stone-200 rounded-xl p-6 lg:p-8"
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-stone-200 pb-4">
        <h2
          id="checkout-heading"
          className="font-display text-2xl font-semibold text-stone-900"
        >
          Your Bag
        </h2>
        <span
          data-testid="bag-item-count"
          className="font-mono text-xs font-medium text-stone-500 tabular-nums"
        >
          {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
        </span>
      </div>

      {items.length === 0 ? (
        <div
          data-testid="empty-bag-state"
          className="py-8 flex flex-col items-center justify-center text-center border-b border-stone-200"
        >
          <ShoppingBag
            className="h-6 w-6 text-stone-400 stroke-[1.5]"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-stone-800">
            Your bag is empty
          </p>
          <p className="mt-1 text-xs text-stone-500 max-w-xs">
            Select an item from the studio catalog to review line totals and place an order.
          </p>
        </div>
      ) : (
        <ul
          aria-label="Bag items"
          className="divide-y divide-stone-200 border-b border-stone-200 py-2"
        >
          {items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </ul>
      )}

      <div className="mt-5 space-y-2 text-sm">
        <div className="flex items-center justify-between text-stone-600">
          <span>Subtotal</span>
          <span
            data-testid="order-subtotal"
            className="font-mono tabular-nums"
          >
            {formatCents(subtotalCents)}
          </span>
        </div>
        <div className="flex items-center justify-between text-stone-600">
          <span>Standard Shipping</span>
          <span className="font-mono tabular-nums">
            {items.length === 0
              ? formatCents(0)
              : shippingCents === 0
                ? 'Free ($0.00)'
                : formatCents(shippingCents)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-stone-200 text-base font-semibold text-stone-900">
          <span>Order Total</span>
          <span
            data-testid="order-total"
            className="font-mono text-lg tabular-nums"
          >
            {formatCents(totalCents)}
          </span>
        </div>
      </div>

      <form
        onSubmit={onPlaceOrder}
        noValidate
        className="mt-7 border-t border-stone-200 pt-6 space-y-5"
      >
        <h3 className="text-sm font-semibold text-stone-900">
          Customer Details
        </h3>

        {hasErrors && (
          <div
            role="alert"
            data-testid="checkout-validation-summary"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle
                className="h-4 w-4 text-red-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="font-semibold text-red-900">
                  Unable to place order
                </p>
                {errors.cart && (
                  <p data-testid="cart-error-message">{errors.cart}</p>
                )}
                {errors.customerName && (
                  <p data-testid="name-error-summary">{errors.customerName}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="customer-name"
            className="block text-sm font-medium text-stone-800"
          >
            Full name{' '}
            <span className="text-red-700" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="customer-name"
            name="customerName"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.customerName)}
            aria-describedby={
              errors.customerName ? 'customer-name-error' : undefined
            }
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="e.g. Maya Lin"
            data-testid="customer-name-input"
            className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 ${
              errors.customerName
                ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-red-600/20'
                : 'border-stone-300 bg-white focus:border-[#1E3A34] focus:ring-[#1E3A34]/20'
            }`}
          />
          {errors.customerName && (
            <p
              id="customer-name-error"
              data-testid="name-field-error"
              className="mt-1.5 text-xs font-medium text-red-700"
            >
              {errors.customerName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="order-note"
            className="block text-sm font-medium text-stone-800"
          >
            Delivery note{' '}
            <span className="text-xs font-normal text-stone-500">
              (optional)
            </span>
          </label>
          <textarea
            id="order-note"
            name="orderNote"
            rows={2}
            value={orderNote}
            onChange={(e) => onOrderNoteChange(e.target.value)}
            placeholder="Gate code or placement preference"
            data-testid="order-note-input"
            className="mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-[#1E3A34] focus:outline-none focus:ring-2 focus:ring-[#1E3A34]/20"
          />
        </div>

        <button
          type="submit"
          data-testid="place-order-button"
          className="inline-flex w-full items-center justify-center rounded-lg bg-[#1E3A34] px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#152A25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A34] whitespace-nowrap cursor-pointer"
        >
          Place Order
        </button>
      </form>
    </section>
  );
}
