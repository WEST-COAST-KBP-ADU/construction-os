#!/usr/bin/env bash
# SessionStart hook — make the verification gate usable before any work starts.
#
# Without this, a fresh session has no node_modules: `npm test`, `npm run lint`,
# and `npm run build` all fail, and the `node_modules/next/dist/docs/` guides
# that AGENTS.md requires reading are absent. A session that cannot verify
# cannot produce evidence, and evidence is the basis of every claim here.

set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}" || exit 0

if [ -d node_modules/.bin ] && [ -x node_modules/.bin/vitest ]; then
  echo "verify-gate: dependencies present"
  exit 0
fi

echo "verify-gate: node_modules missing or incomplete — installing"

if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund >/tmp/verify-gate-install.log 2>&1
else
  npm install --no-audit --no-fund >/tmp/verify-gate-install.log 2>&1
fi

if [ -x node_modules/.bin/vitest ]; then
  echo "verify-gate: dependencies installed; npm test / lint / build are available"
else
  echo "verify-gate: INSTALL FAILED — npm test, npm run lint, and npm run build"
  echo "verify-gate: cannot run. Treat all build and test claims as UNVERIFIED"
  echo "verify-gate: until this is resolved. Log: /tmp/verify-gate-install.log"
fi

exit 0
