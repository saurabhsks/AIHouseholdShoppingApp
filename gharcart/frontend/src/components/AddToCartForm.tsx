"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiError, addCartItem, notifyCartChanged } from "@/lib/api";
import { formatInr } from "@/lib/money";
import type { CatalogueProduct } from "@/types/catalogue";

export function AddToCartForm({ product }: { product: CatalogueProduct }) {
  const selectable = product.variants.filter((variant) => variant.stockQuantity > 0);
  const [variantId, setVariantId] = useState(selectable[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const selected = product.variants.find((variant) => variant.id === variantId);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || selected.stockQuantity <= 0) {
      return;
    }

    setPending(true);
    setMessage("");
    try {
      await addCartItem(selected.id, quantity);
      notifyCartChanged();
      setMessage("Added to cart.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Could not add this pack.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Choose a pack</legend>
        {product.variants.map((variant) => {
          const soldOut = variant.stockQuantity <= 0;
          return (
            <label
              key={variant.id}
              className="flex items-start gap-3 rounded-xl border border-stone-200 p-3 dark:border-stone-700"
            >
              <input
                type="radio"
                name="variantId"
                value={variant.id}
                checked={variantId === variant.id}
                disabled={soldOut}
                onChange={() => setVariantId(variant.id)}
              />
              <span>
                <span className="block font-medium">
                  {variant.label} · {formatInr(variant.pricePaise)}
                </span>
                <span className="block text-sm text-muted">
                  {soldOut ? "Out of stock" : `${variant.stockQuantity} in stock`}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <label className="flex max-w-40 flex-col gap-1 text-sm">
        Quantity
        <input
          type="number"
          min={1}
          max={selected?.stockQuantity || 1}
          value={quantity}
          disabled={selectable.length === 0}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="h-11 rounded-xl border border-stone-300 bg-background px-3 dark:border-stone-600"
        />
      </label>

      <button
        type="submit"
        disabled={pending || selectable.length === 0}
        className="h-11 w-fit rounded-full bg-[#1f6b4a] px-5 text-sm font-medium text-white disabled:opacity-70"
      >
        {pending ? "Adding…" : "Add to cart"}
      </button>
      {message ? (
        <p role="status">
          {message}{" "}
          {message === "Added to cart." ? (
            <Link href="/cart" className="underline">
              View cart
            </Link>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
