import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { formatCents } from '../data/products';
import type { Product } from '../types/checkout';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  isOrderLocked: boolean;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({
  product,
  quantityInCart,
  isOrderLocked,
  onAddToCart,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="flex flex-col h-full bg-white border border-stone-200 rounded-xl overflow-hidden transition-transform duration-150 ease-out hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.imageAlt}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-stone-100 p-6 text-stone-500">
            <Package className="h-7 w-7 stroke-[1.5]" aria-hidden="true" />
            <span className="text-xs font-medium">{product.name}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-medium text-stone-500">
          {product.category}
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span>{product.sku}</span>
        </p>

        <div className="mt-2 flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold text-stone-900 leading-snug">
            {product.name}
          </h2>
          <span
            data-testid={`product-price-${product.id}`}
            className="font-mono text-sm font-medium text-stone-900 tabular-nums shrink-0"
          >
            {formatCents(product.priceCents)}
          </span>
        </div>

        <p className="mt-2 text-sm text-stone-600 leading-relaxed">
          {product.description}
        </p>

        <p className="mt-3 text-xs text-stone-500">{product.materialSpec}</p>

        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={isOrderLocked}
            onClick={() => onAddToCart(product)}
            data-testid={`add-to-cart-${product.id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1E3A34] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#152A25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A34] disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{quantityInCart > 0 ? 'Add another' : 'Add to bag'}</span>
          </button>

          {quantityInCart > 0 && (
            <span
              data-testid={`in-bag-count-${product.id}`}
              className="font-mono text-xs font-medium text-stone-600 tabular-nums whitespace-nowrap shrink-0"
            >
              {quantityInCart} in bag
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
