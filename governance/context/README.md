# External Context Packages

Context packages are **projections** of external repositories or systems,
pinned to a specific state, provided by the owner to sessions that lack direct
access to the source.

Rules:

- A context package has **zero authority**. It is not SourceTrue for the
  external system it describes; the external system's committed state wins on
  any conflict.
- Every claim inherited from a context package into our own records must carry
  its pin (repo + SHA/date) and be re-verified when direct access exists.
- Newer pins supersede older ones; superseded packages stay in place.

| Package | Source | Pin | Received |
| :------ | :----- | :-- | :------- |
| [kbp-core-context-package-v0.1.md](kbp-core-context-package-v0.1.md) | `kbp-core-engineering/kbp-core` | `main` @ `bb52a6f` | 2026-07-02 |
