# OUTCOME — PRODUCT-002

## Result

The Owner's commercial direction is converted into a bounded Product 2
architecture:

- selling West Coast KBP ADU construction projects is the terminal commercial
  outcome;
- the customer loop starts with a property or phone intent and ends at a
  human-controlled proposal and sale;
- Studio is the customer-facing qualification and conversion surface;
- Catalog, GIS, and jurisdiction evaluation remain independent technical/trust
  layers;
- immutable technical scenarios and mutable PII/commercial records are
  separated by an opaque reference;
- every public feature must attract, build trust, qualify, convert, or hand off;
- the minimum profitable v0 is manual-first and does not depend on a CRM,
  automated voice, advertising platform, or analytics suite;
- technical evidence cannot silently become a feasibility, price, schedule,
  permit, code, or buildability promise.

## Reconciliation with current repository state

- `adu-model/1` and its three starter families remain unchanged.
- #66 / Draft PR #69 remains independent and unchanged.
- Existing portal prohibitions remain effective for production behavior until a
  specific runtime packet replaces them safely.
- Earlier product sequencing that placed lead generation last is superseded as
  product priority, but this documentation slice does not itself authorize
  public PII collection or external actions.
- Current deployed UI remains unchanged.

## Verification

- Author scope is documentation-only and exactly four files. A fifth authorized
  file, `FABLE-ANALYSIS.md`, is reserved exclusively for the independent Fable
  review at the exact author result SHA.
- The accepted Owner direction appears in `DECISION.md`.
- Address-first and phone-first paths are explicit.
- `FUNNEL-CONTRACT.md` defines four separate records, twelve funnel stages,
  human-only commitment transitions, public-surface CTA mapping, first-party
  non-PII metrics, failure behavior, and privacy/retention gates.
- PII is prohibited from model, Catalog, GIS, jurisdiction, evaluation, and
  immutable scenario artifacts.
- No code, asset, dependency, production data, provider, deployment, external
  contact, advertising spend, or merge is changed.

## Immediate implementation queue

### LEAD-CONTRACT-001

First runtime packet after this decision is accepted:

- provider-neutral TypeScript contracts;
- exact-key and field validators;
- deterministic transition function;
- technical-reference binding;
- PII sanitizer for human-review summaries;
- consent validation;
- adversarial tests;
- no UI, storage, provider, network, deployment, or production PII.

### LEAD-INTAKE-001

Second runtime packet:

- address-first `/start` flow;
- scenario continuation from Catalog/Studio;
- phone fallback presentation;
- consent and accessible client/server validation;
- production transport disabled until LEAD-DELIVERY-001 is adopted.

### Production activation boundary

Real collection remains blocked on one precise owner packet that fixes the
privacy text, verified recipient, storage/delivery provider, retention/deletion
period, access controls, abuse controls, secret handling, and failed-delivery
semantics.

## Remaining gates

1. Fable 5 writes `FABLE-ANALYSIS.md` on this branch, pinned to the exact author
   result SHA, with exactly one terminal recommendation.
2. ChatGPT reconciles the analysis against repository evidence.
3. Tony's merge decision.
4. Claude Code implementation of LEAD-CONTRACT-001 from the merged decision.
5. Independent review and Tony merge of each runtime slice.

This outcome records commercial architecture. It does not certify feasibility
for any parcel or authorize production lead collection.
