"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, getCart, notifyCartChanged, removeCartItem, updateCartItem } from "@/lib/api";
import { formatInr } from "@/lib/money";
import { ProductPhoto } from "@/components/ProductPhoto";
import type { Cart } from "@/types/cart";

export function CartView() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getCart()
      .then((body) => {
        if (!ignore) {
          setCart(body.cart);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!ignore) {
          setStatus("error");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function changeQuantity(itemId: string, quantity: number) {
    setPendingId(itemId);
    setMessage("");
    try {
      const body = await updateCartItem(itemId, quantity);
      setCart(body.cart);
      notifyCartChanged();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Could not update the cart.");
    } finally {
      setPendingId(null);
    }
  }

  async function remove(itemId: string) {
    setPendingId(itemId);
    setMessage("");
    try {
      const body = await removeCartItem(itemId);
      setCart(body.cart);
      notifyCartChanged();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Could not remove that item.");
    } finally {
      setPendingId(null);
    }
  }

  if (status === "loading") {
    return <p role="status">Loading cart.</p>;
  }

  if (status === "error" || !cart) {
    return (
      <p role="alert" className="text-red-700 dark:text-red-300">
        The cart could not be loaded. Check that the backend is running.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {cart.items.length === 0 ? (
        <p>
          Your cart is empty. <Link href="/products">Browse products</Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {cart.items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-stone-200 bg-card p-5 dark:border-stone-700"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <ProductPhoto
                    productSlug={item.variant.productSlug}
                    name={item.variant.productName}
                    size="thumb"
                  />
                  <div>
                  <h2 className="text-lg font-semibold">
                    <Link href={`/products/${item.variant.productId}`}>
                      {item.variant.productName}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted">
                    {item.variant.brand} · {item.variant.label}
                  </p>
                  <p className="text-sm">
                    {formatInr(item.variant.pricePaise)} each · {item.variant.stockQuantity} in
                    stock
                  </p>
                  {item.available ? null : (
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Unavailable. This line is not included in the total.
                    </p>
                  )}
                  </div>
                </div>
                <p className="font-medium">{formatInr(item.lineTotalPaise)}</p>
              </div>
              <form
                className="mt-4 flex flex-wrap items-end gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  const next = Number(formData.get("quantity"));
                  if (!Number.isInteger(next) || next < 1) {
                    setMessage("Enter a whole quantity of at least 1.");
                    return;
                  }
                  if (next !== item.quantity) {
                    void changeQuantity(item.id, next);
                  }
                }}
              >
                <label className="flex flex-col gap-1 text-sm">
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    defaultValue={item.quantity}
                    key={`${item.id}-${item.quantity}`}
                    disabled={pendingId === item.id}
                    className="h-11 w-24 rounded-xl border border-stone-300 bg-background px-3 dark:border-stone-600"
                  />
                </label>
                <button
                  type="submit"
                  disabled={pendingId === item.id}
                  className="h-11 rounded-full border border-stone-300 px-4 text-sm dark:border-stone-600"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void remove(item.id);
                  }}
                  disabled={pendingId === item.id}
                  className="h-11 rounded-full border border-stone-300 px-4 text-sm dark:border-stone-600"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {message ? <p role="status">{message}</p> : null}
      <p className="text-xl font-semibold">Total {formatInr(cart.totalPaise)}</p>
    </div>
  );
}
