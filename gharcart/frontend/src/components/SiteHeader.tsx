"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/api";

export function SiteHeader() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;

    function loadCount() {
      getCart()
        .then((body) => {
          if (!ignore) {
            const nextCount = body.cart.items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );
            setCount(nextCount);
          }
        })
        .catch(() => {
          if (!ignore) {
            setCount(null);
          }
        });
    }

    loadCount();
    window.addEventListener("gharcart-cart-changed", loadCount);
    return () => {
      ignore = true;
      window.removeEventListener("gharcart-cart-changed", loadCount);
    };
  }, [pathname]);

  return (
    <header className="border-b border-stone-200 bg-card dark:border-stone-700">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-wide text-accent uppercase">
          GharCart
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link href="/products" className="hover:text-accent">
            Products
          </Link>
          <Link href="/cart" className="hover:text-accent">
            Cart{count === null ? "" : ` (${count})`}
          </Link>
        </div>
      </nav>
    </header>
  );
}
