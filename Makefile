.PHONY: dev up down reset types help

# ── Colores ────────────────────────────────────────────────────
GREEN  := \033[0;32m
YELLOW := \033[0;33m
NC     := \033[0m

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-12s$(NC) %s\n", $$1, $$2}'

# ── Desarrollo local (Supabase CLI + npm) ─────────────────────
dev: ## Inicia Supabase en Docker y Next.js en modo dev
	@echo "$(YELLOW)▶ Iniciando Supabase...$(NC)"
	supabase start
	@echo "$(YELLOW)▶ Copiando credenciales locales...$(NC)"
	@supabase status -o env | grep -E 'API_URL|ANON_KEY|SERVICE_ROLE_KEY' \
		| sed 's/API_URL/NEXT_PUBLIC_SUPABASE_URL/' \
		| sed 's/ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/' \
		> .env.local.supabase
	@echo "$(YELLOW)▶ Iniciando Next.js...$(NC)"
	npm run dev

# ── Docker Compose (stack completo) ───────────────────────────
up: ## Levanta todo el stack con Docker Compose
	docker compose up --build

up-detached: ## Levanta en background
	docker compose up --build -d

down: ## Detiene todos los contenedores
	docker compose down

stop-supabase: ## Detiene el stack de Supabase CLI
	supabase stop

# ── Base de datos ──────────────────────────────────────────────
reset: ## Resetea la DB local y re-ejecuta todas las migraciones
	supabase db reset

# ── Tipos TypeScript ───────────────────────────────────────────
types: ## Genera tipos TS desde el esquema local
	supabase gen types typescript --local > src/types/database.generated.ts
	@echo "$(GREEN)✓ Tipos generados en src/types/database.generated.ts$(NC)"

types-remote: ## Genera tipos TS desde el proyecto en Supabase Cloud
	supabase gen types typescript --project-id $(PROJECT_ID) > src/types/database.generated.ts
	@echo "$(GREEN)✓ Tipos generados desde el proyecto remoto$(NC)"

# ── Cron manual (prueba local) ─────────────────────────────────
cron-test: ## Dispara el endpoint de sincronización manualmente
	curl -s -X GET http://localhost:3000/api/cron/sync \
		-H "Authorization: Bearer $$(grep CRON_SECRET .env.local | cut -d= -f2)" \
		| jq .
