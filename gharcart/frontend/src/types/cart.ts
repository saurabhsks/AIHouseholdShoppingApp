export type CartLine = {
  id: string;
  quantity: number;
  available: boolean;
  lineTotalPaise: number;
  variant: {
    id: string;
    label: string;
    amount: number;
    unit: "ML" | "G" | "PIECE";
    pricePaise: number;
    stockQuantity: number;
    productName: string;
    brand: string;
    productId: string;
    productSlug: string;
    categorySlug: string;
  };
};

export type Cart = {
  id: string;
  items: CartLine[];
  totalPaise: number;
};
