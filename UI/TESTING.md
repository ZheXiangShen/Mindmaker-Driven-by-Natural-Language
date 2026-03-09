# Testing Guide

## Manual QA Docs

- Latest manual report: `docs/testing/MANUAL_TEST_REPORT_2026-03-07.md`
- Reusable template: `docs/testing/MANUAL_TEST_TEMPLATE.md`

## Test Layers

- Unit: pure utilities (`src/lib`)
- API route tests: `src/app/api/**/route.test.ts`
- Component integration: `src/app/components/*.test.tsx` (StoreProvider + MSW)
- E2E smoke: `e2e/*.spec.ts`

## Commands

- Run all unit/integration tests: `pnpm test`
- Watch mode: `pnpm test:watch`
- Coverage: `pnpm test:coverage`
- Run E2E: `pnpm test:e2e`

## Notes

- API route tests mock Prisma (`@/lib/prisma`) for deterministic behavior.
- Component tests mock API with MSW and verify loading/empty/error rendering paths.
- E2E uses Playwright and starts local app on `http://127.0.0.1:3100`.
- Ensure DB schema is synced before local manual verification:
  - `pnpm prisma:generate`
  - `pnpm db:push`
