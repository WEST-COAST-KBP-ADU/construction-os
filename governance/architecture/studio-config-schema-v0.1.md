# Studio Configuration Schema v0.1 — deterministic contract for TASK-0013

Status: architecture spec for the builder. Binding for TASK-0013 unless a
REVIEW file argues otherwise. Author: Lane C. Date: 2026-08-04.

## 1. Canonical objects

Typed JSON is authoritative; every render is a projection. Three objects:

### CatalogRelease (append-only, versioned)

```
catalog/releases/<version>.json        // e.g. 2026.08.0
{
  "version": "2026.08.0",
  "effective_from": "YYYY-MM-DD",
  "archetypes": [{
    "id": "studio-450",                // stable slug, never reused
    "label": "Studio ADU",
    "size_band": {"min_sqft": 400, "max_sqft": 500},
    "layouts": ["open", "alcove"],
    "geometry_ref": "assets/geo/studio-450@1",   // versioned pointer
  }],
  "options": {
    "exterior":  ["stucco-smooth", "lap-siding"],
    "palette":   ["warm-white", "sage", "clay"],
    "roof":      ["gable", "shed"],
    "windows":   ["standard", "tall"],
    "interior":  ["essential", "comfort"]
  },
  "compatibility": [
    // data, not code. Deny rules only; absence = allowed.
    {"if": {"archetype": "studio-450", "roof": "shed"},
     "deny": {"windows": ["tall"]},
     "reason_code": "roof_window_clearance"}
  ],
  "assets": [{
    "ref": "assets/geo/studio-450@1",
    "license": {"kind": "owned|licensed", "source": "", "verified_on": ""}
  }]
}
```

No asset ships without its license row. A release is never edited — errors are
fixed by a new version.

### ConfigurationCandidate (what the visitor builds)

```
{
  "schema": "config/1",
  "catalog_version": "2026.08.0",
  "archetype": "studio-450",
  "layout": "open",
  "selections": {"exterior": "stucco-smooth", "palette": "sage",
                  "roof": "gable", "windows": "standard",
                  "interior": "comfort"},
  "config_hash": "<sha256>",
  "disclaimer_version": "d1"
}
```

### Hash rule (the determinism contract)

`config_hash = SHA-256` over the canonical form: UTF-8, keys sorted
lexicographically at every level, no whitespace, `config_hash` field excluded.
Same selections + same catalog version ⇒ identical hash, forever. The replay
test in TASK-0013 asserts exactly this, including across a page reload.

## 2. Behavior rules

- Compatibility engine evaluates deny-rules from data; UI disables the option
  and shows the reason. No rule logic in components.
- An invalid combination can never be submitted into a candidate — construct
  the object only from the engine's output.
- Scenario comparison = 2–3 `ConfigurationCandidate`s side by side; the
  comparison view holds no state of its own.
- Every visual carries the conceptual label; `disclaimer_version` pins which
  wording the visitor actually saw.
- No address, no PII, no network egress. The whole studio runs from committed
  catalog data and first-party assets.

## 3. Storage

None. v0 keeps candidates in memory (URL-safe share codes, DBs, cookies are
all out of scope). A candidate that the visitor abandons is gone — by design,
until the intake phase opens.

## 4. Forward compatibility (why this shape)

- `config_hash` + `catalog_version` is the replayable artifact the future
  OwnerReviewPacket, price-book lookup (DR-0012), and evidence passport attach
  to — nothing here changes when those phases open.
- The deny-rule table is the same discipline as the statutory rules table in
  Property Intelligence v0.1: versioned data, owner-verifiable, no model.

## 5. Builder checklist (TASK-0013 PR must show)

- [ ] Catalog release file with ≥2 archetypes, licenses filled
- [ ] Hash canonicalization implemented exactly as §1; replay test green
- [ ] Compatibility deny-rule demonstrably blocks one combination, with reason
- [ ] Zero-egress evidence (HAR or test)
- [ ] Golden screenshots mobile + desktop
