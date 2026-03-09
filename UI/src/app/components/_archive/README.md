# Archived UI Modules

This folder stores modules identified as unreachable from active Next.js entry points.

Archived on: 2026-03-09
Criteria:
- Not reachable from `page/layout/route/error/loading/not-found` entries
- Not imported by reachable modules/tests/styles

Policy:
- Keep here temporarily for rollback.
- If no regressions after verification and one release cycle, delete permanently.
