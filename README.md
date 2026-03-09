# Mindmaker-Driven-by-Natural-Language

这是一个基于自然语言驱动开发的项目仓库。

当前主应用位于 `figma/`，是一个基于 Next.js App Router 的社交阅读 MVP。

## 目录说明

- `figma/`：当前线上开发应用（前端 + API + Prisma）
- `PRD/`：产品需求与范围文档
- `prisma/`：历史遗留 schema（不作为 `figma/` 应用当前运行 schema）

## 快速开始

```bash
cd figma
pnpm install
pnpm prisma:generate
pnpm prisma:push
pnpm dev
```

## 参考文档

- [figma/README.md](figma/README.md)
- [figma/docs/api.md](figma/docs/api.md)
