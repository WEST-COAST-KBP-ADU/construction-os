# DECISION — Product 2 is a controlled ADU sales system

- Status: **ACCEPTED BY OWNER**
- Owner decision date: 2026-08-06 (America/Los_Angeles)
- Repository record: Issue #70 / PRODUCT-002

## Decision

The commercial purpose of Product 2 is to produce qualified opportunities and
sell West Coast KBP ADU construction projects.

The platform is not built merely to display models, GIS layers, renders, or
engineering sophistication. Those capabilities exist to reduce customer
uncertainty, establish trust, qualify a real property and project intent, and
prepare a human-led sale.

The governing customer loop is:

```
address or phone intent
→ property and project context
→ source-backed preliminary screening
→ model and material scenario
→ explicit unknowns and conflicts
→ contact consent and qualification
→ human sales review
→ proposal / preconstruction agreement
→ ADU construction sale
```

## Product roles

- **Catalog** is the versioned inventory of West Coast KBP products,
  configurations, assemblies, evidence, and presentation artifacts. It supports
  trust and scenario selection; it is not a lead database.
- **GIS site snapshot** records cited, time-bound observed property facts. It is
  not a customer identity record and does not determine buildability.
- **Jurisdiction evaluation** compares known facts and reference requirements.
  It may block or report conflict; it never approves a parcel or creates a sales
  promise.
- **Studio** is the customer-facing product. It turns property intent into a
  reproducible scenario, exposes unknowns, and creates the conversion handoff.
- **Lead candidate** stores only the minimum personal, consent, attribution, and
  commercial fields required for follow-up. It references technical artifacts
  by opaque immutable IDs.
- **Sales handoff** is a human-reviewed transition from qualified candidate to
  contact, proposal, and construction opportunity.
- **Project record** begins only after human acceptance. It is not created
  automatically from a visitor or screening result.

## Mandatory funnel contribution

Every new public-facing feature must declare exactly one primary contribution:

1. **Acquisition** — brings an ADU/property-intent visitor to a relevant entry.
2. **Trust** — proves origin, limitations, process, or product capability.
3. **Qualification** — obtains or derives a fact needed to decide fit.
4. **Conversion** — asks for a bounded next action with informed consent.
5. **Handoff** — prepares a complete human-review packet.

A feature with no contribution is outside the Product 2 public critical path.
Internal engineering machinery may exist without a CTA, but its consuming
public feature must identify its funnel contribution.

## Entry paths

Two first-class paths are adopted:

- **Address-first:** the primary digital path. Start with a property, then
  screen, select/configure, and request human review.
- **Phone-first:** the primary human fallback and high-intent path. A published
  number and routing become active only through a separate verified production
  packet.

Both paths produce the same bounded lead candidate and human-review semantics.
A caller does not bypass consent, qualification, or commitment controls.

## Data separation

Technical truth and commercial identity are separate planes.

```
immutable technical plane
  model release + configuration + site snapshot + evaluation + scenario
                          │ opaque reference only
                          ▼
mutable commercial plane
  lead candidate + consent + attribution + qualification + sales state
```

Names, phone numbers, email addresses, street addresses tied to an inquiry,
messages, and sales notes are forbidden in Catalog releases, model geometry,
jurisdiction profiles, evaluation outputs, and public evidence.

A technical record may outlive or be shared without the commercial record. A
commercial record must be deletable or archived under the adopted retention
policy without invalidating technical digests.

## Minimum profitable v0

The first useful release is manual-first:

1. one clear `Start with your property` action;
2. one clear `Talk with an ADU specialist` action;
3. minimal property and project-intent questions;
4. name plus one contact method;
5. explicit contact/privacy consent;
6. a deterministic lead-candidate validator;
7. a sanitized human-review summary;
8. delivery to one owner-approved operational destination;
9. manual follow-up, qualification, and proposal;
10. stage counts sufficient to measure conversion.

A CRM, automated voice agent, ad platform, marketing automation suite, customer
account, and real-time pricing engine are not dependencies for this v0.

## Human commitment boundary

Only an authorized human may:

- contact the candidate;
- schedule or confirm an appointment;
- represent feasibility or suitability;
- quote or commit price, scope, or schedule;
- state permit, zoning, code, engineering, or buildability conclusions;
- issue a proposal or agreement;
- advance the opportunity to sold.

AI and deterministic evaluators may collect, validate, classify, summarize, and
recommend. They may not perform those commitments.

## Measurement

The funnel must be observable by stage, not by vanity traffic alone. The minimum
commercial measures are:

- property starts;
- valid lead submissions;
- qualified candidates;
- approved human handoffs;
- contacts completed;
- consultations held;
- proposals issued;
- agreements won;
- loss/abandonment reason by stage.

Third-party analytics, advertising tags, call recording, and cross-site
tracking remain closed until their own privacy and implementation gates.
Server-side first-party stage records are preferred for the minimum v0.

## Consequences

- Lead generation moves from a deferred phase to a cross-cutting acceptance
  requirement for Studio and every public product slice.
- Catalog and GIS work continues, but acceptance must now identify how the
  result supports trust, qualification, conversion, or handoff.
- The first code slice is a provider-neutral lead-candidate contract and tests.
- The second code slice is the address-first intake UI and its conversion
  states.
- Production storage/delivery, public phone activation, and analytics remain
  separate bounded gates because they introduce PII, retention, provider, and
  external-action consequences.
- Earlier statements that Product 2 is preview-only or that lead generation is
  last are superseded by this decision. Existing hard prohibitions remain in
  force until a specific implementation packet replaces them safely.

## Explicitly not decided

This decision does not select a CRM, mail provider, phone provider, analytics
provider, ad channel budget, retention duration, privacy-policy text, published
phone number, lead recipient, price model, contract terms, or production launch
date.
