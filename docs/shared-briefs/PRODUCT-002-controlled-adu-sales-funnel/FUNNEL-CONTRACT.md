# FUNNEL CONTRACT — controlled ADU sales loop v1

## 1. Contract boundary

This contract connects customer intent to a human sales decision without
allowing technical evidence or automation to make a commercial, permit, code,
engineering, price, or schedule commitment.

It defines records and transitions. It does not authorize production storage,
provider writes, automated contact, appointment booking, or advertising.

## 2. Records

### 2.1 `technical-scenario-ref/1`

Non-PII reference to an immutable technical scenario.

Required fields:

- `scenario_id` — immutable opaque identifier, never `latest`;
- `scenario_digest` — digest of the referenced technical artifact;
- `model_id` and exact `model_version`;
- `site_snapshot_id` when a snapshot exists;
- `evaluation_id` when an evaluation exists;
- `created_at`;
- `maturity` and explicit limitation summary.

It contains no name, phone, email, inquiry message, sales note, consent record,
or customer-linked street address.

### 2.2 `lead-candidate/1`

Mutable commercial record for minimum follow-up context.

Required fields:

- `lead_candidate_id` — random opaque identifier;
- `created_at` and `updated_at`;
- `source_channel` and `entry_path`;
- `service_area_candidate`;
- `project_intent`;
- `property_input` — address text supplied by the person, isolated here;
- `contact_name`;
- at least one of `phone` or `email`;
- `preferred_contact_method`;
- `consent_record_id`;
- `technical_scenario_ref` when a scenario exists;
- `state`;
- `qualification_reasons`;
- `owner_review_status`.

Optional v0 fields are restricted to broad ranges: project timing, financing
readiness, budget band, occupancy goal, and free-text note with a strict length
limit. No government ID, payment data, document upload, APN, permit number,
recording, transcript, or precise financial account data is collected.

### 2.3 `consent-record/1`

Required before submission:

- `consent_record_id`;
- exact consent-text version;
- affirmative contact consent;
- privacy notice version;
- timestamp;
- originating surface;
- allowed contact channels.

Consent is not inferred from clicking, browsing, an evaluator result, or a
pre-checked control.

### 2.4 `sales-handoff/1`

Sanitized review packet prepared from an accepted lead candidate:

- lead candidate ID;
- technical scenario reference, when present;
- project intent and service-area candidate;
- verified supplied contact channel;
- known facts;
- missing facts;
- evaluator limitations and conflicts;
- qualification reasons;
- recommended human next action;
- owner decision and decision timestamp.

No automatic follow-up occurs from creating this artifact.

## 3. Funnel state machine

```
anonymous_visit
→ property_intent
→ screening_candidate
→ lead_candidate
→ qualified_candidate
→ owner_review_required
→ approved_for_contact | rejected | archived
→ contacted
→ consultation
→ proposal
→ won | lost | archived
```

### Transition rules

| From | To | Required evidence | Authority |
|---|---|---|---|
| `anonymous_visit` | `property_intent` | explicit address or phone-path start | visitor |
| `property_intent` | `screening_candidate` | normalized property input and limitation notice | deterministic UI/service |
| `screening_candidate` | `lead_candidate` | valid contact method and affirmative consent | visitor + validator |
| `lead_candidate` | `qualified_candidate` | bounded fit rules satisfied; reasons recorded | deterministic classifier |
| `qualified_candidate` | `owner_review_required` | complete sanitized handoff packet | deterministic preparation |
| `owner_review_required` | `approved_for_contact` / `rejected` / `archived` | explicit human decision | authorized human |
| `approved_for_contact` | `contacted` | human contact outcome | authorized human |
| `contacted` | `consultation` | confirmed human appointment/outcome | authorized human |
| `consultation` | `proposal` | reviewed scope and offer authority | authorized human |
| `proposal` | `won` / `lost` | signed agreement or recorded loss | authorized human |

A technical `reference_consistent` result cannot skip any stage and cannot
directly create `qualified_candidate`, `approved_for_contact`, `proposal`,
or `won`.

## 4. Minimum qualification v0

A candidate is eligible for human review only when:

- ADU or related residential construction intent is explicit;
- the property is supplied and appears within the declared core service region,
  or is deliberately marked for manual geographic review;
- a valid phone or email is supplied;
- the person affirmatively consents to contact;
- no prohibited content or malformed field is present;
- missing technical facts are recorded rather than invented.

Budget and desired timing may prioritize review but do not independently reject
a candidate. GIS or jurisdiction uncertainty blocks technical claims, not the
ability to request a human conversation.

## 5. Public surface mapping

| Surface | Primary funnel role | Required action |
|---|---|---|
| Search/service page | Acquisition | `Start with your property` |
| Homepage | Conversion | address-first start plus human phone fallback |
| Catalog family | Trust | `Check this model for my property` |
| Model comparison | Qualification | select an exact family/configuration |
| GIS/site view | Qualification | confirm supplied property and show sources/unknowns |
| Jurisdiction evaluation | Trust | show limitations/conflicts; request human review |
| Studio scenario | Conversion | save exact scenario and continue to contact consent |
| Report/summary | Handoff | submit the bounded scenario for specialist review |
| Phone path | Handoff | capture equivalent consent/context; human owns commitments |

Calls to action must describe the actual next step. They may not say
`approved`, `eligible`, `buildable`, `instant quote`, `guaranteed
price`, or `permit ready` unless a separately authorized professional record
supports the exact statement.

## 6. Attribution and measurement

Provider-neutral first-party fields:

- `source_channel`: organic_search, direct, referral, paid_search,
  local_services, business_profile, social, partner, phone, unknown;
- `entry_path`: exact first-party route;
- optional UTM values after validation and length limits;
- first observed timestamp;
- last qualifying action.

Minimum stage events:

- `property_start`;
- `screening_completed`;
- `lead_submitted`;
- `lead_validated`;
- `handoff_prepared`;
- `contact_approved`;
- `contact_completed`;
- `consultation_completed`;
- `proposal_issued`;
- `agreement_won`;
- `lead_lost` with bounded reason.

No raw form payload, phone, email, address, note text, or scenario contents may
be emitted into analytics events.

Core measures:

- start-to-submit conversion;
- submit-to-qualified conversion;
- qualified-to-contact conversion;
- contact-to-consultation conversion;
- consultation-to-proposal conversion;
- proposal-to-win conversion;
- median human response time;
- loss/abandonment reason by stage and entry surface.

## 7. Failure and safety rules

Fail closed when:

- required contact or consent is missing;
- a field is malformed or exceeds its limit;
- an unknown key appears in a contract-owned object;
- a mutable model alias is used;
- a technical reference digest does not match;
- a caller attempts an unauthorized state transition;
- a provider delivery is not acknowledged;
- a duplicate/idempotency conflict exists;
- a retention or recipient policy is not configured.

On delivery failure, the UI must not claim that a request was received. The
candidate remains retryable without duplicate creation through an idempotency
key.

## 8. Privacy and retention gates

Before production collection is enabled, a separate packet must fix:

- exact public privacy/contact-consent copy;
- data controller and verified recipient;
- storage/delivery provider;
- encryption and access boundary;
- retention/deletion period;
- abuse/rate-limit controls;
- incident and failed-delivery behavior;
- request export/deletion handling;
- production environment and secret management.

Until those items are adopted and verified, lead intake may be implemented and
tested behind an inactive production feature flag, but it may not collect real
PII.

## 9. Ordered implementation slices

1. **LEAD-CONTRACT-001** — TypeScript records, exact-key validators, state
   transition rules, sanitizer, and adversarial tests; no UI or provider.
2. **LEAD-INTAKE-001** — address-first `/start` flow, consent UX, accessible
   validation, and exact scenario reference; transport disabled by default.
3. **LEAD-DELIVERY-001** — one owner-approved server-side destination,
   idempotency, acknowledgement, rate limiting, retention, and evidence.
4. **PHONE-HANDOFF-001** — verified published number and equivalent human
   handoff; no automated commitment.
5. **FUNNEL-MEASUREMENT-001** — first-party non-PII stage events and conversion
   report.
6. **ACQUISITION-001** — Google-first organic/business/search activation;
   campaign spend remains an owner gate.
