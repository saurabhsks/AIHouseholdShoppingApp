import { Suspense } from "react";
import { ProductBrowser } from "@/components/ProductBrowser";

export default function ProductsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <header>
        <h1 className="text-3xl font-semibold">Household products</h1>
        <p className="mt-2 text-muted">
          Prices come from the catalogue. Stock is checked again when you add a pack.
        </p>
      </header>
      <Suspense fallback={<p role="status">Loading products.</p>}>
        <ProductBrowser />
      </Suspense>
    </main>
  );
}
