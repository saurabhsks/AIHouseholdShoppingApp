import type { Cart } from "@/types/cart";
import type { CatalogueCategory, CatalogueProduct } from "@/types/catalogue";

const DEFAULT_API_BASE_URL = "http://localhost:4000";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function notifyCartChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("gharcart-cart-changed"));
  }
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) {
    return DEFAULT_API_BASE_URL;
  }
  return configured.replace(/\/$/, "");
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "object" &&
      body.error !== null &&
      "message" in body.error &&
      typeof body.error.message === "string"
        ? body.error.message
        : "The request failed.";
    throw new ApiError(message);
  }

  return body as T;
}

export function listCategories() {
  return requestJson<{ categories: CatalogueCategory[] }>("/api/categories");
}

export function listProducts(params: URLSearchParams) {
  const query = params.toString();
  const path = query ? `/api/products?${query}` : "/api/products";
  return requestJson<{ products: CatalogueProduct[] }>(path);
}

export function getProduct(id: string) {
  return requestJson<{ product: CatalogueProduct }>(`/api/products/${id}`);
}

export function getCart() {
  return requestJson<{ cart: Cart }>("/api/cart");
}

export function addCartItem(variantId: string, quantity: number) {
  return requestJson<{ cart: Cart }>("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ variantId, quantity }),
  });
}

export function updateCartItem(itemId: string, quantity: number) {
  return requestJson<{ cart: Cart }>(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId: string) {
  return requestJson<{ cart: Cart }>(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  });
}
