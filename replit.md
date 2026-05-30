# StyleAI

An AI-powered clothing store where shoppers can browse curated fashion, get outfit recommendations from an AI stylist, manage their cart, and place orders.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/clothing-store run dev` — run the frontend (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui, React Query (Orval-generated hooks)
- API: Express 5 (port 8080, path prefix `/api`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Router: wouter (client-side)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth for all API contracts
- `lib/api-zod/` — Zod schemas generated from OpenAPI (codegen output)
- `lib/api-client-react/` — React Query hooks generated from OpenAPI (codegen output)
- `lib/db/src/schema/index.ts` — Drizzle ORM schema (products, categories, cart_items, orders, order_items)
- `artifacts/api-server/src/routes/` — Express route handlers (products, categories, cart, orders, ai)
- `artifacts/clothing-store/src/pages/` — React pages (Home, Products, Product Detail, Cart, Orders, AI Stylist, Admin)
- `artifacts/clothing-store/src/components/` — Shared UI components + shadcn/ui
- `Jenkinsfile` — CI/CD pipeline (build → test → deploy dev/staging/prod)
- `docker/` — Dockerfiles and docker-compose for all environments
- `.env.example`, `.env.staging`, `.env.production.template` — environment config templates

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → typed Zod schemas + React Query hooks. Never write fetch calls by hand.
- **Date serialization**: Drizzle returns JS `Date` objects; all route handlers call `serializeDates()` before passing to Zod `.parse()` (Zod expects ISO strings per the OpenAPI spec).
- **Shared proxy routing**: Frontend and API both served through the Replit reverse proxy at `/` and `/api` respectively. No Vite proxy config needed.
- **Seed data**: 6 categories + 12 products pre-seeded. Re-seed anytime with `pnpm --filter @workspace/db run seed`.

## Product

- **Shop**: Browse 12+ products with search, category filter, and sort. Product detail with size/color picker and add-to-cart.
- **Cart**: Persistent cart with quantity editing, item removal, and order placement.
- **Orders**: Order history with item breakdown and status tracking.
- **AI Stylist**: Chat with an AI fashion advisor that can pull product recommendations inline.
- **Admin**: Product and category management dashboard.

## User preferences

- Wants full DevOps artifacts alongside the app: `Jenkinsfile`, Dockerfiles, docker-compose, and environment configs for dev/staging/prod.

## Gotchas

- **Date serialization**: Always call `serializeDates(row)` (or `.map(serializeDates)`) on Drizzle query results before passing to any Zod schema that has `createdAt`/`updatedAt` fields — Drizzle returns `Date` objects but the OpenAPI spec (and Zod) expects ISO strings.
- **Codegen after spec changes**: Run `pnpm --filter @workspace/api-spec run codegen` after any change to `openapi.yaml`. Generated files are in `lib/api-zod/` and `lib/api-client-react/`.
- **Wouter imports**: Only import routing helpers (`Link`, `useLocation`, `useParams`, `Switch`, `Route`) from `wouter`. Never import React hooks (`useState`, etc.) from `wouter`.
- Jenkins credentials required: `DOCKER_REGISTRY`, `DOCKER_CREDENTIALS`, `AWS_CREDENTIALS`, `DATABASE_URL`, `DATABASE_URL_PROD`, `DATABASE_URL_STAGING`, `SESSION_SECRET`, `PROD_URL`, `STAGING_URL`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
