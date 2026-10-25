"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { isHealthResponse, type HealthResponse } from "@/types/health";

type StatusState =
  | { kind: "loading" }
  | { kind: "ok"; health: HealthResponse }
  | { kind: "error"; message: string };

export function BackendStatus() {
  const apiBaseUrl = getApiBaseUrl();
  const [state, setState] = useState<StatusState>({ kind: "loading" });

  const checkHealth = useCallback(async () => {
    setState({ kind: "loading" });

    try {
      const response = await fetch(`${apiBaseUrl}/api/health`);
      const body: unknown = await response.json();

      if (!response.ok || !isHealthResponse(body)) {
        setState({
          kind: "error",
          message: "The backend replied, but the health response was not valid.",
        });
        return;
      }

      setState({ kind: "ok", health: body });
    } catch {
      setState({
        kind: "error",
        message:
          "The frontend could not reach the backend. Start it with npm run dev in gharcart/backend, then try again.",
      });
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  const statusText =
    state.kind === "loading"
      ? "Checking the backend."
      : state.kind === "ok"
        ? `Backend ${state.health.service} is running.`
        : "Backend is unavailable.";

  return (
    <section
      aria-labelledby="backend-status-heading"
      className="rounded-2xl border border-stone-200 bg-card p-6 shadow-sm dark:border-stone-700"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="backend-status-heading" className="text-lg font-semibold">
            Backend connection
          </h2>
          <p className="mt-1 text-sm text-muted">
            The browser calls{" "}
            <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs dark:bg-stone-800">
              GET {apiBaseUrl}/api/health
            </code>
          </p>
        </div>
        <span
          className={`mt-1 inline-flex h-3 w-3 shrink-0 rounded-full ${
            state.kind === "ok"
              ? "bg-accent"
              : state.kind === "error"
                ? "bg-red-600"
                : "bg-amber-500"
          }`}
          aria-hidden="true"
        />
      </div>

      <p className="mt-4 text-base" role="status" aria-live="polite">
        {statusText}
      </p>

      {state.kind === "ok" ? (
        <dl className="mt-4 grid gap-2 text-sm text-muted">
          <div className="flex justify-between gap-4">
            <dt>Service</dt>
            <dd className="font-medium text-foreground">{state.health.service}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Checked at</dt>
            <dd className="font-medium text-foreground">
              {new Date(state.health.timestamp).toLocaleString()}
            </dd>
          </div>
        </dl>
      ) : null}

      {state.kind === "error" ? (
        <p className="mt-3 text-sm text-red-700 dark:text-red-300">{state.message}</p>
      ) : null}

      <button
        type="button"
        onClick={() => {
          void checkHealth();
        }}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#1f6b4a] px-5 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6b4a] disabled:cursor-wait disabled:opacity-70"
        disabled={state.kind === "loading"}
      >
        {state.kind === "loading" ? "Checking…" : "Check again"}
      </button>
    </section>
  );
}
