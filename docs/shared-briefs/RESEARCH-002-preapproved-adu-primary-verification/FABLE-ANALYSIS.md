# FABLE-ANALYSIS — RESEARCH-002 primary verification of pre-approved ADU plans

Lane B independent verification author: Fable 5.
Packet: `RESEARCH-002`. Issue #53. Draft PR #54.

---

## 1. Method, environment, and review anchor

| Item | Value |
| :-- | :-- |
| Repository | `WEST-COAST-KBP-ADU/construction-os` |
| Product base | `main@af3beac2f24f7585de031cd3d46ac6fe6c9d9830` |
| Packet branch head read | `research/preapproved-adu-primary-verification-v1@391b982d7c4e7ebf6abbf6c5942dd3f63980f73c` |
| Brief read | `docs/shared-briefs/RESEARCH-002-preapproved-adu-primary-verification/BRIEF.md`, in full, at that head |
| Predecessor result | `RESEARCH-001@66dd0018e810d6dd9acf3b957e406c68a5113c3c` |
| Predecessor verdict | `ACCEPT AS EVIDENCE-BLOCKED` |
| Execution window (UTC) | 2026-08-07T03:41:20Z – 2026-08-07T03:41:38Z |
| Product/governance mutation | none |
| Files added by this packet after the brief | this file only |

Base and head were verified locally before execution. The branch adds only
`BRIEF.md` on top of `af3beac`.

### 1.1 Method actually executed

The brief sets a single evidence standard: "Terminal facts require direct
primary official retrieval. Search results and engine synthesis may locate
sources but cannot support a terminal fact." Gate A was therefore executed as
direct retrieval only. **No search-mediated material was used to support any
determination in this packet**, and none is reported as evidence below.

Gate A was attempted first, before any plan-level work, as required. It did not
clear. Per the brief's own stop rule, no Gate B work was performed and no packet
effort was spent on rights extraction for unverified programs.

### 1.2 Environment and the controlling method deviation

This session's egress runs through a policy-enforcing proxy. Every Gate A host
was refused at CONNECT with `403 Forbidden` before any TLS session was
established. Raw trace for a representative host:

```
* Establish HTTP proxy tunnel to www.citrusheights.net:443
> CONNECT www.citrusheights.net:443 HTTP/1.1
< HTTP/1.1 403 Forbidden
* CONNECT tunnel failed, response 403
```

The proxy's own status endpoint independently recorded each refusal as
`connect_rejected — "gateway answered 403 to CONNECT (policy denial or upstream
failure)"`. That machine-generated record is reproduced verbatim as the ledger
in section 3; it is the primary evidence this packet does possess.

The managed-environment operating instructions state that a 403/407 from the
proxy means "the destination host is not allowed by your organization's egress
policy for this session," and direct that it be reported rather than retried or
routed around. The brief imposes the identical rule: "A policy or network denial
must be reported as a method deviation. Do not route around an access control."

**No access control was circumvented.** No alternate transport, mirror, cache,
archive, text-extraction relay, or third-party fetch service was attempted. The
managed page-fetch tool was tested once against a Gate A URL and returned the
same `403`, confirming the denial is environmental rather than tool-specific.

This is the same constraint that blocked `RESEARCH-001`, unchanged. It is also
the same constraint that blocked RP-0008 in this lane, where the work closed
only after a lane with egress executed the probes. Section 8 addresses the
routing problem directly.

---

## 2. Gate A — U-2 currency matrix and terminal decision

Gate A required, for each of the five scoped jurisdictions, retrieval of the
current official program and plan-index pages, plus the Lincoln AB 130 page and
the California code-cycle source, and then a currency disposition drawn from
that retrieved wording.

**Zero of the twelve required retrievals succeeded.** No official wording,
HTTP 200, or response body was obtained for any jurisdiction. Every currency
disposition is therefore the third option the brief provides, and no other
disposition is available on this evidence.

| # | Jurisdiction | Program page retrieved | Plan-index retrieved | Official code-cycle wording obtained | Gate A disposition |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | City of Sacramento | no — 403 | no — 403 | none | `CURRENT STATUS NOT ESTABLISHED` |
| 2 | Unincorporated Sacramento County | no — 403 | no — 403 | none | `CURRENT STATUS NOT ESTABLISHED` |
| 3 | City of Elk Grove | no — 403 | no — 403 | none | `CURRENT STATUS NOT ESTABLISHED` |
| 4 | City of Citrus Heights | no — 403 | no — 403 | none | `CURRENT STATUS NOT ESTABLISHED` |
| 5 | City of Roseville | no — 403 | no — 403 | none | `CURRENT STATUS NOT ESTABLISHED` |
| — | City of Lincoln (comparison source only) | no — 403 | n/a | none | AB 130 wording conflict **UNRESOLVED** |
| — | California code-cycle source (`dgs.ca.gov`, `leginfo`) | no — 403 | n/a | none | 2026-01-01 transition **UNVERIFIED** |

**Programs supported as current by primary evidence: 0 of 5.** The brief's
threshold is two. Gate A does not clear, and Gate B was not entered.

### 2.1 What is explicitly *not* claimed

No program is asserted to be expired. `CURRENT STATUS NOT ESTABLISHED` is a
statement about this packet's evidence, not about the jurisdictions. The
libraries may well have been reissued under the 2025 Code; nothing here supports
or contradicts that. U-2 is untouched — neither advanced nor closed.

The Lincoln AB 130 contradiction carried forward from `RESEARCH-001` is
**preserved unreconciled**, per the brief's instruction to preserve
contradictions rather than resolve them by inference. Reading Lincoln's sentence
in its original official context was the one operation that could have settled
it, and it was refused at CONNECT.

---

## 3. Primary-source retrieval ledger

Every Gate A retrieval attempt, in execution order. Timestamps are the
proxy's own, not this analysis's.

| # | Official URL | Attempt (UTC) | HTTP | Proxy record | SHA-256 |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | `https://adu.cityofsacramento.org/Shelf-ready-plans` | 03:41:20.364Z | 403 at CONNECT | `connect_rejected` | not computable |
| 2 | `https://www.cityofsacramento.gov/community-development/building/building-programs/preapproved-adu-program-ab1332` | 03:41:20.652Z | 403 at CONNECT | `connect_rejected` | not computable |
| 3 | `https://building.saccounty.gov/pages/adu.aspx` | 03:41:20.971Z | 403 at CONNECT | `connect_rejected` | not computable |
| 4 | `https://development.saccounty.gov/us/en/building-permits-inspection/news/shelf-ready-adu-plans-now-available.html` | 03:41:21.290Z | 403 at CONNECT | `connect_rejected` | not computable |
| 5 | `https://elkgrove.gov/accessory-dwelling-units/city-pre-approved-adu-plans-and-submittal-requirements` | 03:41:21.617Z | 403 at CONNECT | `connect_rejected` | not computable |
| 6 | `https://www.citrusheights.net/1108/Permit-Ready-ADU-Program` | 03:41:21.902Z | 403 at CONNECT | `connect_rejected` | not computable |
| 7 | `https://www.roseville.ca.us/government/departments/development_services/building/preapproved_a_d_u_plans___a_b_1332_` | 03:41:22.186Z | 403 at CONNECT | `connect_rejected` | not computable |
| 8 | `https://www.lincolnca.gov/business-and-development/planning-and-development/pre-approved-adu-plans-ab-1332/` | 03:41:22.633Z | 403 at CONNECT | `connect_rejected` | not computable |
| 9 | `https://www.dgs.ca.gov/en/BSC/Codes` | 03:41:22.960Z | 403 at CONNECT | `connect_rejected` | not computable |
| 10 | `https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB130` | 03:41:23.251Z | 403 at CONNECT | `connect_rejected` | not computable |
| 11 | `https://www.citrusheights.net/1108/Permit-Ready-ADU-Program` (managed fetch tool, second path) | 03:41:38.765Z | 403 | `connect_rejected` | not computable |

**Primary sources retrieved: 0 of 11 attempts across 10 distinct hosts.**

`SHA-256` is recorded as `not computable` rather than omitted or filled: no
response body was received, so there are no bytes to hash. A content hash is
stated here only when it was actually computed from retrieved bytes, and none
was.

The denial is host-scoped, not path-scoped or credential-related. It applies
uniformly to municipal (`.gov`, `.net`, `.us`, `.org`) and state
(`dgs.ca.gov`, `leginfo.legislature.ca.gov`) sources alike, and it is not an
authentication or robots condition — the refusal occurs before any request
reaches the destination.

---

## 4. Current plan/version matrix

**Not executed.** Gate A did not clear, and the brief directs that plan-level
work stop rather than proceed on unverified programs. No plan identifier,
sheet index, revision date, printed expiration, or stated code cycle was
obtained for any plan in any jurisdiction.

The `RESEARCH-001` plan-level matrix remains the current state of knowledge and
remains entirely at status `S` (search-mediated) or `X` (absent). Nothing in
this packet promotes any cell to `P`.

---

## 5. Sacramento City / County U-3 comparison

**Not executed.** Resolving U-3 requires comparing official plan identifiers
and sheet sets directly, which requires retrieving both plan-index pages. Both
were refused (ledger rows 1–4).

U-3 stands exactly as recorded in `RESEARCH-001`: the City and County
shelf-ready size ladders are reported as near-identical (460 / 870 / 1,000 /
1,184 sf), and whether these are one shared plan family or two distinct
programs is undetermined. The catalog de-duplication consequence is unchanged
and unaddressed.

---

## 6. Plan-level rights matrix

**Not executed**, and deliberately so. The brief is explicit: "Do not spend the
packet on rights extraction for expired or unverified programs."

No official terms, licence, or copyright language was retrieved for any plan.
The `RESEARCH-001` rights classification is carried forward **unchanged and
unadvanced**:

| Right | Model A agency libraries | Model B AB 1332 registries |
| :-- | :-- | :-- |
| Permit-application use | `RESTRICTED` (party- and geography-limited) | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` |
| Modification | `RESTRICTED` | `RESTRICTED` |
| Commercial contractor use | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` |
| Republication | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` |
| **Derivative 2D/3D Studio model creation and display** | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` |
| Designer / plan / municipal name or mark use | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` | `UNKNOWN — OWNER/COUNSEL CLEARANCE REQUIRED` |

Those prior classifications rest on programme structure and confirmed private
authorship, not on retrieved licence text. **Absence of published terms remains
an evidence finding, not permission** — and this packet did not even reach the
point of establishing absence, since no terms page was retrieved.

---

## 7. Owner / counsel gates

These are decisions, not research outputs. No amount of retrieval closes them,
so they are stated in full despite Gate A blocking. They are unchanged by this
packet and remain open.

**U-4 — no published terms located for any plan in any jurisdiction.**
Whether the Owner will proceed on plans whose reuse terms are unpublished, and
on what written basis. Note the asymmetry: silence is not permission, and a
municipality that never held the underlying rights cannot convey them by
silence or by publication.

**U-5 — derivative 2D/3D Studio model creation and display.**
The single right the Concept Studio product thesis depends on, `UNKNOWN` in
every cell above. Two routes exist, both Owner decisions and both outside any
research packet's authority:
- obtain a written licence from each plan's author; or
- commission original West Coast KBP plans and submit them for AB 1332
  preapproval, which every scoped jurisdiction is statutorily obliged to accept
  from any applicant. This inverts the problem — West Coast KBP becomes the
  plan owner with unambiguous rights to model, display and market its own
  designs.

Recorded as an evidenced structural option. **Not recommended, adopted, or
priced by this packet.**

**U-10 — municipal marks and designer names.**
Endorsement-confusion exposure independent of copyright. Displaying a city
name, seal, or designer's name against a commercial configurator may imply
municipal endorsement even where the underlying plan is licensed.

---

## 8. Recommended next operational action

The block is environmental and precisely bounded. It is not a research
shortfall and it is not a finding about the jurisdictions.

### 8.1 Root cause, stated plainly

`RESEARCH-001` and `RESEARCH-002` were both dispatched to a lane whose
environment cannot reach any non-GitHub host. Both returned blocked, for the
identical reason, having consumed two packet cycles without advancing U-2 by a
single retrieved byte. RP-0008 previously followed the same pattern in this
lane and closed only when a lane with egress executed the probes.

**This is a dispatch-routing problem, not a research problem.** The corrective
belongs in the operating model: before a packet requiring external retrieval is
assigned, the assigned lane's egress capability should be confirmed. A one-line
reachability probe against a single representative host settles it in seconds
and would have prevented both cycles.

### 8.2 Immediate unblock — route the packet to a lane with egress

Re-dispatch `RESEARCH-002` unchanged to a lane with unrestricted outbound
access. The brief needs no revision; only the executing lane changes. The
twelve targets are already enumerated in section 3 and need no re-derivation.
Precedent is direct: RP-0008 closed exactly this way.

### 8.3 Durable fix — allowlist the official hosts

If verification work is to remain in this lane, the environment's network
policy must permit these ten hosts. Environment network policy is an Owner
setting for this managed environment and is documented with the rest of the
environment configuration at `code.claude.com/docs/en/claude-code-on-the-web`.

```
adu.cityofsacramento.org        www.roseville.ca.us
www.cityofsacramento.gov        www.lincolnca.gov
building.saccounty.gov          www.dgs.ca.gov
development.saccounty.gov       leginfo.legislature.ca.gov
elkgrove.gov                    www.citrusheights.net
```

All are official municipal or California state sources. All are read-only
retrieval targets. No credential, form submission, or municipality contact is
involved.

### 8.4 Sequencing once unblocked

Unchanged from the brief and from the predecessor's §11: **Gate A first.** If
the regional libraries prove expired, the launch question changes shape and all
Gate B effort is wasted. Within Gate A, Lincoln's AB 130 sentence should be read
in its original context early, because it is the one source that can resolve the
contradiction rather than restate it.

### 8.5 What should not happen next

Do not re-dispatch this packet to this lane without one of 8.2 or 8.3. The
result would be a third identical block. Do not treat `RESEARCH-001`'s
search-mediated matrices as verified in the interim — they remain at `S`/`X` and
are explicitly not promoted by this packet.

---

## 9. Non-goals honoured

No application, Studio catalog, design, asset, dependency, navigation,
deployment, governance, production, pricing, CRM, lead-capture, or
construction-operations file was modified. `BRIEF.md` untouched. No municipality
or designer was contacted. No licence purchased. No legal conclusion drawn. No
shortlist adopted. No merge. No access control circumvented. This packet's diff
contains exactly this file.

---

## 10. Terminal recommendation

# BLOCKED — PRIMARY RETRIEVAL

Zero of eleven retrieval attempts across ten distinct official hosts succeeded.
Every attempt was refused by egress policy at CONNECT with HTTP 403, before any
request reached its destination, and each refusal is independently recorded by
the proxy with a timestamp (section 3). Gate A required primary retrieval as its
first operation and obtained none.

### Why this terminal and not `BLOCKED — CURRENCY`

Gate A's stop rule states that if fewer than two of the five programs can be
supported as current by primary evidence, the packet returns
`BLOCKED — CURRENCY`. Read literally, that threshold is met — zero of five.

`BLOCKED — PRIMARY RETRIEVAL` is nonetheless the accurate terminal, and the
distinction is not cosmetic. `BLOCKED — CURRENCY` asserts a finding *about the
programs*: that their currency was examined and found insufficient. Nothing was
examined. The five programs were never reached, their pages never opened, their
stated code cycles never read. Returning `BLOCKED — CURRENCY` would misattribute
an environmental failure in this lane to a deficiency in the jurisdictions, and
would leave a reader of the governance record believing U-2 had been tested when
it was not.

The brief supplies `BLOCKED — PRIMARY RETRIEVAL` as a distinct terminal, and
this scenario — total retrieval failure with no evidence obtained either way —
is precisely the condition it exists to describe. Reporting the true cause is
worth more to the record than literal conformance to a rule written for the case
where retrieval succeeded and the evidence came back thin.

### Gates left open

U-2 currency (untested, not merely unresolved), U-3 Sacramento City/County
duplication, U-4 published terms, U-5 derivative Studio rights, U-10 marks and
names, and the Lincoln AB 130 wording conflict — preserved unreconciled.

Nothing in this packet promotes any `RESEARCH-001` factual cell from `S` or `X`
to `P`. The evidence position is materially unchanged; what this packet
establishes with certainty is *why*, with a timestamped machine-generated
record, and exactly what it would take to change it.

---

Verdict pins to the result SHA reported in Issue #53. Any new commit invalidates
it. The result author cannot issue its own acceptance verdict; a non-author lane
must review at the exact result SHA. Tony alone adopts any shortlist, approves
counsel outreach, and merges.
