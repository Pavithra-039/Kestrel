import { Eye, History, RotateCw, Trash2 } from 'lucide-react';
import { formatCents } from '../data/products';
import type { OrderConfirmation } from '../types/checkout';

interface RecentOrdersSectionProps {
  orders: OrderConfirmation[];
  activeReference: string | null;
  onViewReceipt: (order: OrderConfirmation) => void;
  onReorder: (order: OrderConfirmation) => void;
  onClearHistory: () => void;
}

function formatPlacedAt(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Recorded order';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function RecentOrdersSection({
  orders,
  activeReference,
  onViewReceipt,
  onReorder,
  onClearHistory,
}: RecentOrdersSectionProps) {
  return (
    <section
      id="recent-orders"
      aria-labelledby="recent-orders-heading"
      data-testid="recent-orders-section"
      className="mt-12 border-t border-stone-200 pt-10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2
            id="recent-orders-heading"
            className="font-display text-2xl font-semibold text-stone-900"
          >
            Recent Orders
          </h2>
          <span
            data-testid="recent-orders-count"
            className="font-mono text-xs font-medium text-stone-500 tabular-nums"
          >
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        {orders.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            data-testid="clear-order-history"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-200/60 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A34] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear history</span>
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div
          data-testid="recent-orders-empty"
          className="mt-5 rounded-xl border border-stone-200 bg-white p-6 flex items-center gap-3 text-sm text-stone-600"
        >
          <History className="h-5 w-5 text-stone-400 shrink-0" aria-hidden="true" />
          <p>
            No completed orders saved yet. Confirmed orders are stored locally in this browser so you can revisit receipts or reorder anytime.
          </p>
        </div>
      ) : (
        <ul
          aria-label="Recent orders"
          data-testid="recent-orders-list"
          className="mt-5 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white overflow-hidden"
        >
          {orders.map((order) => {
            const isViewing = activeReference === order.reference;
            const totalItems = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );
            const itemSummary = order.items
              .map((item) => `${item.quantity} × ${item.product.name}`)
              .join(', ');

            return (
              <li
                key={order.reference}
                data-testid={`recent-order-${order.reference}`}
                className={`p-5 sm:p-6 transition-colors ${
                  isViewing ? 'bg-[#FAF9F6]' : 'bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-sm">
                      <span
                        data-testid={`recent-order-ref-${order.reference}`}
                        className="font-mono font-semibold text-stone-900 tabular-nums"
                      >
                        {order.reference}
                      </span>
                      <span aria-hidden="true" className="text-stone-400">
                        ·
                      </span>
                      <span className="font-medium text-stone-900">
                        {order.customerName}
                      </span>
                      <span aria-hidden="true" className="text-stone-400">
                        ·
                      </span>
                      <span className="text-xs text-stone-500">
                        {formatPlacedAt(order.placedAt)}
                      </span>
                    </div>

                    <p className="text-sm text-stone-600">
                      {itemSummary}{' '}
                      <span className="font-mono text-xs text-stone-500 tabular-nums">
                        ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                      </span>
                    </p>

                    {order.orderNote && (
                      <p className="text-xs text-stone-500">
                        Note: {order.orderNote}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                    <span
                      data-testid={`recent-order-total-${order.reference}`}
                      className="font-mono text-base font-semibold text-stone-900 tabular-nums mr-1"
                    >
                      {formatCents(order.totalCents)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onViewReceipt(order)}
                      data-testid={`view-receipt-${order.reference}`}
                      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A34] whitespace-nowrap shrink-0 cursor-pointer ${
                        isViewing
                          ? 'border-[#1E3A34] bg-[#1E3A34] text-white'
                          : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-50'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isViewing ? 'Viewing receipt' : 'View receipt'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onReorder(order)}
                      data-testid={`reorder-${order.reference}`}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A34] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
