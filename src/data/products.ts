import type { Product } from '../types/checkout';

export const PRODUCTS: Product[] = [
  {
    id: 'ceramic-dripper',
    sku: 'KST-01',
    name: 'Speckled Stoneware Dripper',
    category: 'Tabletop Ceramics',
    materialSpec: 'Kiln-fired clay · 320g · Dish-safe',
    description:
      'Flat-bottomed pour-over brewer thrown in warm speckled stoneware for steady thermal retention.',
    priceCents: 4800,
    image: '/src/assets/images/product_ceramic_dripper_1795254743111.jpg',
    imageAlt: 'Speckled stoneware pour-over coffee dripper resting on a glass server over pale limestone.',
  },
  {
    id: 'walnut-tray',
    sku: 'KST-02',
    name: 'Solid Walnut Valet Tray',
    category: 'Desk Objects',
    materialSpec: 'American walnut · 24 × 15 cm · Hand-oiled',
    description:
      'Milled from a single block of sustainably harvested walnut with subtle chamfered edges for daily tools.',
    priceCents: 3450,
    image: '/src/assets/images/product_walnut_tray_1795254742129.jpg',
    imageAlt: 'Solid American walnut desk valet tray holding glasses, a matte pen, and brass keys.',
  },
];

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
