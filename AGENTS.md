<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## TypeScript standards

- Never use `any`; use `unknown` plus type guards.
- Prefer derived types (`Pick`, `Omit`, `Partial`, `ReturnType`, conditional types) over duplicated interfaces.
- Use explicit return types for exported functions/components/hooks.
- Prefer `const` over `let` unless mutation is required.
- Remove unused locals/params instead of suppressing lint warnings.
- Use `satisfies` for config objects and discriminated unions when appropriate.

## Next.js App Router rules

- Default to Server Components; add `'use client'` only when client-only APIs/state/effects are required.
- Keep server-only logic out of Client Components.
- Keep route handlers (`app/**/route.ts`) thin: parse/validate input, delegate to domain helpers, return typed responses.
- Avoid coupling UI components to transport shapes; map API/data layer results into view models close to boundaries.

## UI component rules

- Use ShadCN components as the primary source of reusable UI building blocks.
- Prefer composing from `src/components/ui/*` before creating new shared components.
- When a needed pattern exists in ShadCN, use or extend that component instead of re-implementing from scratch.

## Data fetching and async patterns

- Avoid fetch/database calls inside render loops when batching/preloading is possible.
- Run independent async work in parallel with `Promise.all`.
- Request only required fields and avoid over-fetching large payloads.
- Use pagination/cursor strategies for list endpoints and large datasets.

## Side effects and reliability

- Separate state changes from external side effects where possible.
- Make retryable mutations idempotent (idempotency key or unique business key).
- Do not swallow exceptions; rethrow with actionable context.
- Keep user-facing error messages stable; log technical details separately.

## Performance and UX

- Prefer streaming and partial rendering patterns supported by current Next.js docs when beneficial.
- Use caching/revalidation intentionally and document assumptions near data access boundaries.
- Avoid adding client JS by default; keep bundles lean.

## Pre-implementation checklist

Before shipping significant changes, verify:

- Are server/client boundaries correct?
- Is input validated at the boundary?
- Are independent async operations parallelized?
- Is the change idempotent/retry-safe if applicable?
- Are types derived and specific (no `any`/overly broad types)?
- Are error paths typed and user-safe?
<!-- END:nextjs-agent-rules -->
