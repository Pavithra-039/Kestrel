import type { OrderConfirmation } from '../types/checkout';

export const RECENT_ORDERS_STORAGE_KEY = 'kestrel_recent_orders_v1';
const MAX_STORED_ORDERS = 10;

function isValidOrderConfirmation(value: unknown): value is OrderConfirmation {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<OrderConfirmation>;
  return (
    typeof candidate.reference === 'string' &&
    candidate.reference.length > 0 &&
    typeof candidate.customerName === 'string' &&
    typeof candidate.orderNote === 'string' &&
    Array.isArray(candidate.items) &&
    typeof candidate.subtotalCents === 'number' &&
    typeof candidate.shippingCents === 'number' &&
    typeof candidate.totalCents === 'number' &&
    typeof candidate.placedAt === 'string'
  );
}

export function loadRecentOrders(): OrderConfirmation[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_ORDERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidOrderConfirmation).slice(0, MAX_STORED_ORDERS);
  } catch {
    return [];
  }
}

export function saveRecentOrders(orders: OrderConfirmation[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      RECENT_ORDERS_STORAGE_KEY,
      JSON.stringify(orders.slice(0, MAX_STORED_ORDERS)),
    );
  } catch {
    // Ignore storage quota or private-mode restrictions gracefully.
  }
}

export function appendRecentOrder(
  order: OrderConfirmation,
  currentOrders: OrderConfirmation[],
): OrderConfirmation[] {
  const deduped = currentOrders.filter(
    (existing) => existing.reference !== order.reference,
  );
  const nextOrders = [order, ...deduped].slice(0, MAX_STORED_ORDERS);
  saveRecentOrders(nextOrders);
  return nextOrders;
}

export function clearRecentOrdersStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(RECENT_ORDERS_STORAGE_KEY);
  } catch {
    // Ignore storage access errors gracefully.
  }
}
