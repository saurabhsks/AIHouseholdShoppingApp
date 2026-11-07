const productImages: Record<string, string> = {
  "colgate-strong-teeth": "/products/colgate-strong-teeth.jpg",
  "colgate-maxfresh": "/products/colgate-maxfresh.jpg",
  "pepsodent-germicheck": "/products/pepsodent-germicheck.jpg",
  "ghadi-detergent-powder": "/products/ghadi-detergent-powder.jpg",
  "surf-excel-easy-wash": "/products/surf-excel-easy-wash.jpg",
  "ariel-matic": "/products/ariel-matic.jpg",
  "tide-nature-fresh": "/products/tide-nature-fresh.jpg",
  "fortune-sunflower-oil": "/products/fortune-sunflower-oil.jpg",
  "saffola-gold": "/products/saffola-gold.jpg",
  "clinic-plus-shampoo": "/products/clinic-plus-shampoo.jpg",
  "dove-daily-shine": "/products/dove-daily-shine.jpg",
  "santoor-sandal": "/products/santoor-sandal.jpg",
  "lifebuoy-total": "/products/lifebuoy-total.jpg",
  "vim-dishwash-liquid": "/products/vim-dishwash-liquid.jpg",
  "scotch-brite-sponge": "/products/scotch-brite-sponge.jpg",
  "india-gate-basmati": "/products/india-gate-basmati.jpg",
  "aashirvaad-atta": "/products/aashirvaad-atta.jpg",
  "lizol-disinfectant": "/products/lizol-disinfectant.jpg",
  "origami-face-tissues": "/products/origami-face-tissues.jpg",
  "closeup-everfresh": "/products/closeup-everfresh.jpg",
  "wheel-detergent-powder": "/products/wheel-detergent-powder.jpg",
  "dhara-sunflower-oil": "/products/dhara-sunflower-oil.jpg",
  "head-shoulders-smooth": "/products/head-shoulders-smooth.jpg",
  "lux-soft-touch": "/products/lux-soft-touch.jpg",
  "dettol-antiseptic": "/products/dettol-antiseptic.jpg",
  "daawat-basmati": "/products/daawat-basmati.jpg",
};

export function productImageSrc(productSlug: string): string {
  return productImages[productSlug] ?? "/products/colgate-strong-teeth.jpg";
}
