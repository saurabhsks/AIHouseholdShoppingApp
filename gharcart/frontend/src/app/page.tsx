import { BackendStatus } from "@/components/BackendStatus";

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
          GharCart will turn a request such as “toothpaste, the cheapest
          detergent, and a total under ₹1,500” into a cart you can review. This
          first screen only checks that the website can reach the API.
        </p>
      </header>

      <BackendStatus />

      <section aria-labelledby="next-heading" className="text-sm leading-6 text-muted">
        <h2 id="next-heading" className="text-base font-semibold text-foreground">
          What comes next
        </h2>
        <p className="mt-2">
          The product catalogue, shopping cart, Gemini assistant, and checkout
          are later phases. Nothing on this page places an order.
        </p>
      </section>
    </main>
  );
}
