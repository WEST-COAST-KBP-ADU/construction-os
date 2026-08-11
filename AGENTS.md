<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Start here

Before anything else in this repository, read
[`governance/memory/SESSION-START.md`](governance/memory/SESSION-START.md).

It is the one canonical cold start. It tells a session with no chat history who
holds authority, what Product 2 is and where the Product 1 boundary lies, how to
rebuild the live queue and the `M1`/`M2`/`R1` board from GitHub rather than from
memory, and which single control-plane action is executable next. It routes on
to `governance/BOUNDARIES.md`, the operating model, the program plan, and the
control plane in the order a fresh session needs them.

Chat, terminal scrollback, and model memory are not durable state. Neither is
the committed queue index — re-read live GitHub before dispatching, reviewing,
gating, or mutating anything.
