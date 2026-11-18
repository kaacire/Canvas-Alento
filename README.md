# Hope v2 — arquivos base

Esqueleto da **segunda versão** da plataforma de experiências interativas, a partir do
[documento de conceito v0.1](docs/conceito-v0.1.txt).

> Contém **apenas a base**: estrutura, configuração, modelo de dados, tipos compartilhados
> e *stubs* de rotas/páginas. Nenhuma regra de negócio foi implementada.
> As rotas da API respondem `501 Not Implemented`.

## Estrutura

```text
hope-v2/
├── apps/
│   ├── api/        Node + Express + TypeScript + Prisma (PostgreSQL)
│   └── web/        React + TypeScript + Vite (4 temas visuais)
├── packages/
│   └── shared/     Tipos e constantes do domínio (categorias, temas, planos…)
└── docs/           Conceito e mapa conceito → código
```

## Como começar

Pré-requisitos: Node 20+ e um PostgreSQL (ou Docker, para usar o `docker-compose.yml`).

```bash
# 1. Banco de dados (pule se já tem um Postgres rodando)
docker compose up -d

# 2. Variáveis de ambiente (um .env por app)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Dependências
npm install

# 4. Prisma: gera o client e cria as tabelas
npm run db:generate
npm run db:migrate        # na primeira vez, dê um nome à migração (ex.: init)

# 5. Rodar (dois terminais)
npm run dev:api           # http://localhost:3333/api/health
npm run dev:web           # http://localhost:5173
```

## Solução de problemas

| Erro | Causa | Solução |
| --- | --- | --- |
| `Environment variable not found: DATABASE_URL` | Falta o `apps/api/.env` | `cp apps/api/.env.example apps/api/.env` |
| `@prisma/client did not initialize yet` | Client não gerado | `npm run db:generate` |
| `Can't reach database server at localhost:5432` | Postgres desligado | `docker compose up -d` (ou ligue seu Postgres) |
| `Authentication failed` / `database does not exist` | `DATABASE_URL` não bate com o banco | Ajuste usuário, senha e nome em `apps/api/.env` |
| `ZodError` ao iniciar a API | Variável obrigatória ausente | Confira `apps/api/.env` |

## Decisões de stack (sugestão, ainda em aberto)

O conceito deixa em aberto arquitetura, banco, hospedagem, autenticação e armazenamento
(seção 31). Esta base **assume** a stack já proposta no escopo do Hope Studio
(React, TypeScript, Node/Express, PostgreSQL, Prisma) para não bloquear o início.
Tudo é trocável: veja `docs/arquitetura-base.md`.
