import { Suspense } from "react";
import { ProductDetails } from "@/components/ProductDetails";

async function ProductDetailsLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
      <ProductDetails productId={id} />
    </main>
  );
}

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="px-6 py-12" role="status">Loading product.</p>}>
      <ProductDetailsLoader params={params} />
    </Suspense>
  );
}
