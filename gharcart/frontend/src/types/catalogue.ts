export type CatalogueCategory = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogueVariant = {
  id: string;
  label: string;
  amount: number;
  unit: "ML" | "G" | "PIECE";
  pricePaise: number;
  stockQuantity: number;
};

export type CatalogueProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string | null;
  category: {
    name: string;
    slug: string;
  };
  variants: CatalogueVariant[];
};
