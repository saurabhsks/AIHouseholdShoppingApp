import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import type {
  CatalogueCategory,
  CatalogueProduct,
} from "../types/catalogue";
import type { ProductQuery } from "../validators/productQuery";

const variantSelect = {
  id: true,
  label: true,
  amount: true,
  unit: true,
  pricePaise: true,
  stockQuantity: true,
} satisfies Prisma.ProductVariantSelect;

const productInclude = {
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  variants: {
    where: { isActive: true },
    orderBy: { pricePaise: "asc" },
    select: variantSelect,
  },
} satisfies Prisma.ProductInclude;

type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toProduct(product: ProductRecord): CatalogueProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    description: product.description,
    category: {
      name: product.category.name,
      slug: product.category.slug,
    },
    variants: product.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      amount: variant.amount,
      unit: variant.unit,
      pricePaise: variant.pricePaise,
      stockQuantity: variant.stockQuantity,
    })),
  };
}

export const productRepository = {
  async listCategories(): Promise<CatalogueCategory[]> {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  },

  async listProducts(query: ProductQuery): Promise<CatalogueProduct[]> {
    const inStockOnly = query.inStock === "true";
    const variantWhere: Prisma.ProductVariantWhereInput = {
      isActive: true,
      ...(inStockOnly ? { stockQuantity: { gt: 0 } } : {}),
    };

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(query.category ? { category: { slug: query.category } } : {}),
        ...(query.brand
          ? { brand: { equals: query.brand, mode: "insensitive" } }
          : {}),
        ...(query.q
          ? {
              OR: [
                { name: { contains: query.q, mode: "insensitive" } },
                { brand: { contains: query.q, mode: "insensitive" } },
              ],
            }
          : {}),
        variants: { some: variantWhere },
      },
      include: {
        category: productInclude.category,
        variants: {
          where: variantWhere,
          orderBy: { pricePaise: "asc" },
          select: variantSelect,
        },
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    return products.map(toProduct);
  },

  async getProduct(id: string): Promise<CatalogueProduct | null> {
    const product = await prisma.product.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: productInclude,
    });

    if (!product) {
      return null;
    }

    return toProduct(product);
  },
};
