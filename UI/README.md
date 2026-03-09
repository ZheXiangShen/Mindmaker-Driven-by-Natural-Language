# MindMark UI

Next.js 15 + TypeScript app for local-first Markdown note management.

## Tech Stack

- Next.js App Router
- React 18
- Prisma + SQLite
- Vitest + Testing Library + MSW
- Playwright (smoke e2e)

## Scripts

```bash
pnpm dev            # start dev server
pnpm build          # production build
pnpm start          # start built app
pnpm test           # unit + integration tests
pnpm test:watch     # watch tests
pnpm test:coverage  # coverage report
pnpm test:e2e       # playwright smoke
pnpm prisma:generate
pnpm db:push
```

## Environment

Create `.env`:

```bash
DATABASE_URL="file:./prisma/dev.db"
```

## Code Structure

- `src/app/`: routes, pages, layouts, API handlers
- `src/app/components/`: active business UI components
- `src/app/components/_archive/`: archived unreachable modules (kept for rollback)
- `src/app/store.tsx`: app state + actions
- `src/lib/`: shared utilities (`prisma`, note mapper)
- `src/styles/`: global CSS and theme files
- `src/test/`: test setup, fixtures, MSW handlers

## Import & Naming Conventions

- Internal TS/TSX imports use alias style: `@/...`
- Component files use `PascalCase.tsx`
- Utility/style files use `kebab-case.ts` / `kebab-case.css`
- CSS internal `@import` keeps relative paths within style folder

## Quality Gate

Before merging cleanup/refactor work, run:

```bash
pnpm build
pnpm test
pnpm test:e2e
```

## API

See `docs/api.md` for request/response contracts.
