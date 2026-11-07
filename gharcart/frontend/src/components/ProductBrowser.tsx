"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ProductPhoto } from "@/components/ProductPhoto";
import { listCategories, listProducts } from "@/lib/api";
import { formatInr } from "@/lib/money";
import type { CatalogueCategory, CatalogueProduct } from "@/types/catalogue";

function lowestPrice(product: CatalogueProduct): number | null {
  if (product.variants.length === 0) {
    return null;
  }
  return Math.min(...product.variants.map((variant) => variant.pricePaise));
}

function hasStock(product: CatalogueProduct): boolean {
  return product.variants.some((variant) => variant.stockQuantity > 0);
}

export function ProductBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CatalogueCategory[]>([]);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const inStock = searchParams.get("inStock") === "true";
  const queryKey = `${q}|${category}|${brand}|${inStock}`;
  const [result, setResult] = useState<{
    key: string;
    products: CatalogueProduct[];
  } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const status =
    errorKey === queryKey ? "error" : result?.key === queryKey ? "ready" : "loading";
  const products = result?.key === queryKey ? result.products : [];

  useEffect(() => {
    let ignore = false;

    listCategories()
      .then((body) => {
        if (!ignore) {
          setCategories(body.categories);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCategories([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (inStock) params.set("inStock", "true");

    listProducts(params)
      .then((body) => {
        if (!ignore) {
          setResult({ key: queryKey, products: body.products });
          setErrorKey(null);
        }
      })
      .catch(() => {
        if (!ignore) {
          setErrorKey(queryKey);
        }
      });

    return () => {
      ignore = true;
    };
  }, [queryKey, q, category, brand, inStock]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    const nextQuery = String(formData.get("q") ?? "").trim();
    const nextCategory = String(formData.get("category") ?? "").trim();
    const nextBrand = String(formData.get("brand") ?? "").trim();
    const nextInStock = formData.get("inStock") === "on";

    if (nextQuery) next.set("q", nextQuery);
    if (nextCategory) next.set("category", nextCategory);
    if (nextBrand) next.set("brand", nextBrand);
    if (nextInStock) next.set("inStock", "true");

    const query = next.toString();
    router.push(query ? `/products?${query}` : "/products");
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={applyFilters}
        className="grid gap-4 rounded-2xl border border-stone-200 bg-card p-5 dark:border-stone-700 md:grid-cols-2"
      >
        <label className="flex flex-col gap-1 text-sm">
          Search
          <input
            name="q"
            defaultValue={q}
            className="h-11 rounded-xl border border-stone-300 bg-background px-3 dark:border-stone-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Category
          <select
            name="category"
            defaultValue={category}
            className="h-11 rounded-xl border border-stone-300 bg-background px-3 dark:border-stone-600"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Brand
          <input
            name="brand"
            defaultValue={brand}
            className="h-11 rounded-xl border border-stone-300 bg-background px-3 dark:border-stone-600"
          />
        </label>
        <label className="flex items-center gap-2 self-end text-sm">
          <input name="inStock" type="checkbox" defaultChecked={inStock} />
          In stock only
        </label>
        <button
          type="submit"
          className="h-11 rounded-full bg-[#1f6b4a] px-5 text-sm font-medium text-white md:col-span-2 md:w-fit"
        >
          Apply filters
        </button>
      </form>

      {status === "loading" ? <p role="status">Loading products.</p> : null}
      {status === "error" ? (
        <p role="alert" className="text-red-700 dark:text-red-300">
          The product list could not be loaded. Check that the backend is running.
        </p>
      ) : null}
      {status === "ready" && products.length === 0 ? (
        <p>No products match these filters.</p>
      ) : null}

      {status === "ready" ? (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const price = lowestPrice(product);
            const inStock = hasStock(product);
            return (
              <li key={product.id}>
                <Link
                  href={`/products/${product.id}`}
                  className="flex h-full flex-col rounded-2xl border border-stone-200 bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md dark:border-stone-700"
                >
                  <ProductPhoto productSlug={product.slug} name={product.name} />
                  <div className="mt-3 flex flex-1 flex-col gap-1">
                    <p className="text-xs tracking-wide text-muted uppercase">{product.brand}</p>
                    <h2 className="line-clamp-2 text-base font-semibold leading-snug">
                      {product.name}
                    </h2>
                    <p className="line-clamp-1 text-xs text-muted">{product.category.name}</p>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                      <p className="text-sm font-semibold">
                        {price === null ? "No packs" : formatInr(price)}
                      </p>
                      <p
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          inStock
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                            : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                        }`}
                      >
                        {inStock ? "In stock" : "Out of stock"}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
