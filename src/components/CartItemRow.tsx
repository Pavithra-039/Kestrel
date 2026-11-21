import { useEffect, useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCents } from '../data/products';
import type { CartItem } from '../types/checkout';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, nextQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemRowProps) {
  const { product, quantity } = item;
  const [draftQuantity, setDraftQuantity] = useState(String(quantity));

  useEffect(() => {
    setDraftQuantity(String(quantity));
  }, [quantity]);

  const lineTotalCents = product.priceCents * quantity;

  function handleDraftChange(value: string) {
    setDraftQuantity(value);
    if (/^\d+$/.test(value)) {
      const parsed = Number.parseInt(value, 10);
      if (parsed >= 1 && parsed <= 99) {
        onUpdateQuantity(product.id, parsed);
      } else if (parsed > 99) {
        onUpdateQuantity(product.id, 99);
        setDraftQuantity('99');
      }
    }
  }

  function handleDraftBlur() {
    const parsed = Number.parseInt(draftQuantity, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setDraftQuantity(String(quantity));
      return;
    }
    const clamped = Math.min(99, parsed);
    setDraftQuantity(String(clamped));
    if (clamped !== quantity) {
      onUpdateQuantity(product.id, clamped);
    }
  }

  return (
    <li
      data-testid={`cart-item-${product.id}`}
      className="py-4 first:pt-0 last:pb-0"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-stone-900 leading-snug">
            {product.name}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-stone-500 tabular-nums">
            {formatCents(product.priceCents)} each
          </p>
        </div>

        <p
          data-testid={`line-total-${product.id}`}
          className="font-mono text-sm font-semibold text-stone-900 tabular-nums shrink-0"
        >
          {formatCents(lineTotalCents)}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="inline-flex items-center rounded-lg border border-stone-200 bg-[#FAF9F6]">
          <button
            type="button"
            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            aria-label={`Decrease quantity of ${product.name}`}
            data-testid={`qty-decrease-${product.id}`}
            className="inline-flex h-10 w-10 items-center justify-center text-stone-700 transition-colors hover:bg-stone-200/60 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1E3A34] rounded-l-lg cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={draftQuantity}
            onChange={(e) => handleDraftChange(e.target.value)}
            onBlur={handleDraftBlur}
            aria-label={`Quantity of ${product.name}`}
            data-testid={`qty-input-${product.id}`}
            className="h-10 w-12 border-x border-stone-200 bg-white text-center font-mono text-sm font-medium text-stone-900 tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1E3A34] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />

          <button
            type="button"
            disabled={quantity >= 99}
            onClick={() => onUpdateQuantity(product.id, Math.min(99, quantity + 1))}
            aria-label={`Increase quantity of ${product.name}`}
            data-testid={`qty-increase-${product.id}`}
            className="inline-flex h-10 w-10 items-center justify-center text-stone-700 transition-colors hover:bg-stone-200/60 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1E3A34] disabled:cursor-not-allowed disabled:opacity-40 rounded-r-lg cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemoveItem(product.id)}
          aria-label={`Remove ${product.name}`}
          data-testid={`remove-item-${product.id}`}
          className="inline-flex min-h-[40px] items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-stone-600 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A34] rounded-md whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Remove</span>
        </button>
      </div>
    </li>
  );
}
