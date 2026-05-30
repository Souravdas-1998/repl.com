SHELL := /bin/bash
.DEFAULT_GOAL := help

# ── Colours ────────────────────────────────────────────────────────────────────
BOLD  := $(shell tput bold 2>/dev/null || true)
RESET := $(shell tput sgr0 2>/dev/null || true)
CYAN  := $(shell tput setaf 6 2>/dev/null || true)

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "$(CYAN)%-22s$(RESET) %s\n", $$1, $$2}'

# ── Dev ────────────────────────────────────────────────────────────────────────
.PHONY: install
install: ## Install all workspace dependencies
	pnpm install

.PHONY: dev-api
dev-api: ## Start API server in dev/watch mode
	pnpm --filter @workspace/api-server run dev

.PHONY: dev-web
dev-web: ## Start frontend in dev/watch mode
	pnpm --filter @workspace/clothing-store run dev

.PHONY: dev
dev: ## Start full stack with docker compose (hot-reload)
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml up

.PHONY: dev-down
dev-down: ## Stop and remove docker compose dev stack
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.override.yml down

# ── Build ──────────────────────────────────────────────────────────────────────
.PHONY: build
build: ## Build all packages
	pnpm run build

.PHONY: build-api
build-api: ## Build API server only
	pnpm --filter @workspace/api-server run build

.PHONY: build-web
build-web: ## Build frontend only
	pnpm --filter @workspace/clothing-store run build

.PHONY: codegen
codegen: ## Regenerate API hooks and Zod schemas from OpenAPI spec
	pnpm --filter @workspace/api-spec run codegen

# ── Quality ────────────────────────────────────────────────────────────────────
.PHONY: typecheck
typecheck: ## Run TypeScript typecheck across all packages
	pnpm run typecheck

.PHONY: lint
lint: ## Lint all packages
	pnpm run lint --if-present

.PHONY: check
check: typecheck lint ## Run all quality checks (typecheck + lint)

# ── Database ───────────────────────────────────────────────────────────────────
.PHONY: db-push
db-push: ## Push DB schema changes (dev only — never use on prod)
	pnpm --filter @workspace/db run push

.PHONY: db-seed
db-seed: ## Seed dev database with sample data
	pnpm --filter @workspace/db run seed

.PHONY: db-studio
db-studio: ## Open Drizzle Studio
	pnpm --filter @workspace/db run studio

# ── Docker ─────────────────────────────────────────────────────────────────────
.PHONY: docker-build
docker-build: ## Build all Docker images
	docker build -f docker/api.Dockerfile -t styleai-api:local .
	docker build -f docker/web.Dockerfile -t styleai-web:local .

.PHONY: docker-up
docker-up: ## Start full production-like stack with docker compose
	docker compose -f docker/docker-compose.yml up --build -d

.PHONY: docker-down
docker-down: ## Tear down docker compose stack
	docker compose -f docker/docker-compose.yml down

.PHONY: docker-logs
docker-logs: ## Tail docker compose logs
	docker compose -f docker/docker-compose.yml logs -f

.PHONY: docker-clean
docker-clean: ## Remove all StyleAI Docker images and volumes
	docker compose -f docker/docker-compose.yml down -v --rmi local

# ── Release ────────────────────────────────────────────────────────────────────
.PHONY: release-patch
release-patch: ## Tag and push a patch release (e.g. v1.0.1)
	@./scripts/release.sh patch

.PHONY: release-minor
release-minor: ## Tag and push a minor release (e.g. v1.1.0)
	@./scripts/release.sh minor

.PHONY: release-major
release-major: ## Tag and push a major release (e.g. v2.0.0)
	@./scripts/release.sh major
