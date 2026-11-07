"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, getProduct } from "@/lib/api";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductPhoto } from "@/components/ProductPhoto";
import type { CatalogueProduct } from "@/types/catalogue";

export function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<CatalogueProduct | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(
    "loading",
  );

  useEffect(() => {
    let ignore = false;
    getProduct(productId)
      .then((body) => {
        if (!ignore) {
          setProduct(body.product);
          setStatus("ready");
        }
      })
      .catch((error: unknown) => {
        if (ignore) {
          return;
        }
        if (error instanceof ApiError && error.message === "Product was not found.") {
          setStatus("missing");
          return;
        }
        setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [productId]);

  if (status === "loading") {
    return <p role="status">Loading product.</p>;
  }

  if (status === "missing") {
    return (
      <p role="status">
        This product was not found. <Link href="/products">Back to products</Link>
      </p>
    );
  }

  if (status === "error" || !product) {
    return (
      <p role="alert" className="text-red-700 dark:text-red-300">
        The product could not be loaded. Check that the backend is running.
      </p>
    );
  }

  return (
    <article className="grid items-start gap-8 md:grid-cols-[16rem_1fr]">
      <ProductPhoto productSlug={product.slug} name={product.name} size="detail" />
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">{product.category.name}</p>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="text-muted">{product.brand}</p>
        {product.description ? <p>{product.description}</p> : null}
        <AddToCartForm product={product} />
      </div>
    </article>
  );
}
