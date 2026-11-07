import { BackendStatus } from "@/components/BackendStatus";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          GharCart
        </p>
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance">
          Household shopping, in plain language.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted">
          Browse household essentials, compare pack sizes, and review a cart
          before anything is ordered.
        </p>
        <Link
          href="/products"
          className="inline-flex h-11 w-fit items-center rounded-full bg-[#1f6b4a] px-5 text-sm font-medium text-white"
        >
          Browse products
        </Link>
      </header>

      <BackendStatus />

      <section aria-labelledby="next-heading" className="text-sm leading-6 text-muted">
        <h2 id="next-heading" className="text-base font-semibold text-foreground">
          What comes next
        </h2>
        <p className="mt-2">
          The Gemini assistant and checkout come later. Nothing on this page
          places an order.
        </p>
      </section>
    </main>
  );
}
