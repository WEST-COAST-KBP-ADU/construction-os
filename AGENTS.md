<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Start here

This repository is the `CONSTRUCTION` contour. Its current role address is
`role.construction.operations-director`, for the West Coast KBP / ADU and
construction operational domain, with status `referenced-not-frozen`. This
address is model- and vendor-neutral: the Owner `avoroncov971-maker` alone
launches the role, approves or adopts material decisions, and merges.

Product 2 remains valid business and product vocabulary inside the Construction
contour; it is not a current top-level contour. The legacy `PRODUCT_2 /
product-adu` address resolves to `CONSTRUCTION / construction`. The frozen
cross-contour relation remains exactly `West Coast KBP — first user`.

Addressing the role does not hydrate PostgreSQL, activate runtime, grant
credentials, or produce business or external effects.

Before anything else in this repository, read
[`governance/memory/SESSION-START.md`](governance/memory/SESSION-START.md).

It is the one canonical cold start. It tells a session with no chat history who
holds authority, what Product 2 is and where the Product 1 boundary lies, how to
rebuild the live queue and the `P1`/`P2`/`W1` lane board from GitHub rather than
from memory, and which single control-plane action is executable next. It routes
on to `governance/BOUNDARIES.md`, the operating model, the program plan, and the
control plane in the order a fresh session needs them.

The board's three lanes are permanent: `P1` and `P2` each advance Product 2, and
`W1` advances the engineering workflow, graph memory, cold start, and
orchestration. Mutation versus independent read-only review is a lane's current
`activityMode`, never a lane identity — a review of a product head occupies `P1`
or `P2`, and a review of a workflow head occupies `W1`.

Chat, terminal scrollback, and model memory are not durable state. Neither is
the committed queue index — re-read live GitHub before dispatching, reviewing,
gating, or mutating anything.
