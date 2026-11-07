import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import type { CartFailure, CartResponse } from "../types/cart";

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      variant: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

type CartRecord = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

function toCart(cart: CartRecord): CartResponse {
  const items = cart.items.map((item) => {
    const available =
      item.variant.isActive &&
      item.variant.product.isActive &&
      item.variant.stockQuantity >= item.quantity;

    return {
      id: item.id,
      quantity: item.quantity,
      available,
      lineTotalPaise: available ? item.variant.pricePaise * item.quantity : 0,
      variant: {
        id: item.variant.id,
        label: item.variant.label,
        amount: item.variant.amount,
        unit: item.variant.unit,
        pricePaise: item.variant.pricePaise,
        stockQuantity: item.variant.stockQuantity,
        productName: item.variant.product.name,
        brand: item.variant.product.brand,
        productId: item.variant.product.id,
        productSlug: item.variant.product.slug,
        categorySlug: item.variant.product.category.slug,
      },
    };
  });

  return {
    id: cart.id,
    items,
    totalPaise: items.reduce((sum, item) => sum + item.lineTotalPaise, 0),
  };
}

async function loadCart(cartId: string): Promise<CartResponse> {
  const cart = await prisma.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: cartInclude,
  });
  return toCart(cart);
}

async function getOrCreateCartId(): Promise<string> {
  const existing = await prisma.cart.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) {
    return existing.id;
  }

  const created = await prisma.cart.create({ data: {} });
  return created.id;
}

function rejectQuantity(
  stockQuantity: number,
  quantity: number,
): CartFailure | null {
  if (stockQuantity <= 0) {
    return {
      statusCode: 400,
      code: "OUT_OF_STOCK",
      message: "This pack is out of stock.",
    };
  }

  if (quantity > stockQuantity) {
    return {
      statusCode: 400,
      code: "INSUFFICIENT_STOCK",
      message: `Only ${stockQuantity} packs are in stock.`,
    };
  }

  return null;
}

export const cartRepository = {
  async getCart(): Promise<CartResponse> {
    const cartId = await getOrCreateCartId();
    return loadCart(cartId);
  },

  async addItem(
    variantId: string,
    quantity: number,
  ): Promise<{ cart: CartResponse } | CartFailure> {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || !variant.isActive || !variant.product.isActive) {
      return {
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Product pack was not found.",
      };
    }

    const rejected = rejectQuantity(variant.stockQuantity, quantity);
    if (rejected) {
      return rejected;
    }

    const cartId = await getOrCreateCartId();
    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
      update: { quantity },
      create: { cartId, variantId, quantity },
    });

    return { cart: await loadCart(cartId) };
  },

  async updateItem(
    itemId: string,
    quantity: number,
  ): Promise<{ cart: CartResponse } | CartFailure> {
    const cartId = await getOrCreateCartId();
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      include: {
        variant: {
          include: { product: true },
        },
      },
    });

    if (!item || !item.variant.isActive || !item.variant.product.isActive) {
      return {
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Cart item was not found.",
      };
    }

    const rejected = rejectQuantity(item.variant.stockQuantity, quantity);
    if (rejected) {
      return rejected;
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return { cart: await loadCart(cartId) };
  },

  async removeItem(
    itemId: string,
  ): Promise<{ cart: CartResponse } | CartFailure> {
    const cartId = await getOrCreateCartId();
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      select: { id: true },
    });

    if (!item) {
      return {
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Cart item was not found.",
      };
    }

    await prisma.cartItem.delete({ where: { id: item.id } });
    return { cart: await loadCart(cartId) };
  },
};

export function isCartFailure(
  result: { cart: CartResponse } | CartFailure,
): result is CartFailure {
  return "code" in result;
}
