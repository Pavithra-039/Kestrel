export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  materialSpec: string;
  description: string;
  priceCents: number;
  image: string;
  imageAlt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ValidationErrors {
  cart?: string;
  customerName?: string;
}

export interface OrderConfirmation {
  reference: string;
  customerName: string;
  orderNote: string;
  items: CartItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  placedAt: string;
}
