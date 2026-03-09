# 03.07Knowledge

Personal Markdown knowledge base project.

## Repository Structure

- `UI/`: Next.js web app (main product code)
- `UI/src/`: app routes, components, store, api routes, tests
- `UI/docs/`: project docs (testing, API)
- `UI/prisma/`: app Prisma schema and local DB
- `prisma/`: legacy/root Prisma schema snapshot
- `files/`: local memory/edit artifacts

## Quick Start

```bash
cd UI
pnpm install
pnpm prisma:generate
pnpm db:push
pnpm dev
```

Default local URL: `http://localhost:3000`.

## Verification Commands

```bash
cd UI
pnpm test
pnpm build
pnpm test:e2e
```

## Documentation

- App guide: `UI/README.md`
- API reference: `UI/docs/api.md`
- Testing guide: `UI/TESTING.md`

## Refactor Notes

- Dead modules are currently archived at `UI/src/app/components/_archive/` for rollback safety.
- Import style is standardized to `@/` for internal TypeScript module imports.
