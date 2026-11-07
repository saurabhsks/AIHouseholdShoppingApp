import { CartView } from "@/components/CartView";

export default function CartPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold">Cart</h1>
      <p className="text-sm text-muted">
        This development cart is shared by every browser on this machine. The total is
        calculated by the API.
      </p>
      <CartView />
    </main>
  );
}
