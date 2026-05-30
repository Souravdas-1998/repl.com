## What does this PR do?

_Brief description of the changes._

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / code quality
- [ ] CI/CD / DevOps
- [ ] Dependencies
- [ ] Documentation

## Checklist

- [ ] `pnpm run typecheck` passes locally
- [ ] `pnpm run lint` passes locally
- [ ] If OpenAPI spec changed — ran `pnpm --filter @workspace/api-spec run codegen`
- [ ] If DB schema changed — `pnpm --filter @workspace/db run push` tested against dev DB
- [ ] New `createdAt`/`updatedAt` DB fields go through `serializeDates()` before Zod parse
- [ ] No secrets or credentials committed
- [ ] Docker builds pass (`make docker-build`) if Dockerfile changed

## Screenshots (if UI change)

_Before / After_

## Related issues

Closes #
