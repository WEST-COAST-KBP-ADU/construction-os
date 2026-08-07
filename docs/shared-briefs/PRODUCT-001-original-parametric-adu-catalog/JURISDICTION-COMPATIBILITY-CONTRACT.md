# JURISDICTION COMPATIBILITY CONTRACT

## Separation rule

Municipal information is stored as `jurisdiction-profile/1` reference evidence.
An evaluator produces `jurisdiction-evaluation/1`. Neither object may modify an
`adu-model/1` release or generate geometry.

## `jurisdiction-profile/1`

Required fields:

| Field | Contract |
| --- | --- |
| `jurisdiction_id` | Stable authority identifier. |
| `authority_name` | Human-readable issuing authority. |
| `profile_version` | Immutable version. |
| `code_cycle` | Stated applicable code-cycle evidence; never inferred from a model. |
| `effective_window` | `valid_from`, optional `valid_to`, and `checked_at`. |
| `sources` | Official URLs/documents, retrieval timestamps, titles, and available digests. |
| `requirements` | Normalized reference predicates with source and section/page anchors. |
| `submission` | Reference checklist, forms, review path, and known site-specific inputs. |
| `limitations` | Missing facts, conflicts, inaccessible evidence, and interpretation boundaries. |
| `review` | Reviewer, review date, and currency state. |

Search results may locate official evidence but cannot support a terminal fact.
Unavailable or conflicting primary evidence is recorded as a limitation, not
filled by inference.

## Reference requirement shape

Each normalized requirement contains a stable ID, topic, operator, value/unit,
applicability predicate, official evidence anchor, effective date, and
interpretation note. Initial topics may include dimensional envelopes, height,
setbacks, fire/access routing, parking exceptions, utility/submission items,
and required forms.

Only requirements expressible without importing external geometry belong in
this layer. A municipal drawing can be cited as evidence that a program exists,
but its geometry and layout cannot be parsed into the product model.

## `jurisdiction-evaluation/1`

An evaluation binds:

- exact `model_id@version`;
- exact configuration hash when applicable;
- exact `jurisdiction_id@profile_version`;
- versioned site-fact input or explicit absence of site facts;
- evaluator version;
- per-requirement results and evidence anchors;
- terminal status and disclaimer version.

Allowed terminal statuses are:

- `not_evaluated`;
- `blocked_missing_facts`;
- `blocked_stale_profile`;
- `reference_consistent`;
- `reference_conflict`.

`reference_consistent` means only that supplied facts did not conflict with the
encoded, current reference predicates. It does not mean approved, eligible,
buildable, code compliant, preapproved, permit ready, or suitable for a parcel.

## Fail-closed rules

The evaluator returns a blocked or conflict result when:

- a required site fact is absent;
- official evidence is stale, inaccessible, or conflicting;
- units or identifiers are unknown;
- the model/configuration/profile version is not exact;
- a predicate cannot be evaluated deterministically;
- a rule would require geometry mutation or professional interpretation.

Every public presentation of an evaluation must expose the bound versions,
currency date, missing facts, source links, and non-approval disclaimer.

## Change control

A source or rule change creates a new profile version and invalidates cached
evaluations. A jurisdiction change never rewrites an existing model release.
If West Coast KBP chooses to change a model after reviewing a jurisdiction, the
change enters the normal owned-design process and produces a new model version
with independent provenance and validation.
