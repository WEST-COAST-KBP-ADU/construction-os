# PRODUCT-BOUNDARIES v1.0 — West Coast KBP / KBP OS

Status: `IN PROGRESS — SECTIONS A–C FROZEN; SECTIONS D–H NOT YET ADOPTED`

This file is the Product 2 product canon for `WEST-COAST-KBP-ADU/construction-os`.
It carries exactly what the Owner has adopted, and nothing else.

## Authority

[`../BOUNDARIES.md`](../BOUNDARIES.md) is **higher authority** than this file.
This product canon does not supersede it, cannot widen it, and cannot authorize
anything it prohibits. Where this file and `governance/BOUNDARIES.md` appear to
disagree, `governance/BOUNDARIES.md` wins, work stops, and the divergence is
reported rather than silently resolved.

This file changes only through an Owner-adopted decision carried by a bounded
packet, a single branch, a single Draft PR, and a non-author review at the exact
head. The Owner alone adopts and merges.

## Sources

| Source | Exact record |
| :--- | :--- |
| Mission brief — Product 2 boundaries session | <https://github.com/kbp-core-engineering/kbp-dev-office/issues/373#issuecomment-5273825219> |
| Owner decision record — Section A adopted | <https://github.com/kbp-core-engineering/kbp-dev-office/issues/373#issuecomment-5273946430> |
| Owner decision record — Section B adopted | <https://github.com/kbp-core-engineering/kbp-dev-office/issues/373#issuecomment-5273999441> |
| Owner decision record — Section C adopted | <https://github.com/kbp-core-engineering/kbp-dev-office/issues/373#issuecomment-5274068664> |
| Immutable upstream Product 1 canon, pinned to an exact commit | <https://github.com/kbp-core-engineering/kbp-dev-office/blob/a4f008d0cecaa10a561122f4f6a8affd94b70e24/docs/coordination/product/PRODUCT-BOUNDARIES-v1.0.md> |

## A. Canonical proposition — [ЗАМОРОЖЕНО · OWNER-ADOPTED]

The three records below are the Owner-adopted Section A V1, reproduced
byte-for-byte from the Owner decision record. A derivative never contradicts the
master and never introduces anything absent from it.

### A1 — master

> West Coast KBP — реальный ADU- и general-construction бизнес региона Большого Сакраменто, который работает AI-native на собственной платформе KBP OS: она ведёт цели, источники, ограничения, решения и работу через многоуровневый граф под контролем людей, а принятые результаты накапливаются в принадлежащую компании проверяемую сеть.

### A2 — conversational derivative

> West Coast KBP строит ADU и ведёт construction-бизнес как одну живую систему: платформа организует работу, люди принимают решения, а каждый принятый результат становится частью проверяемой памяти компании.

### A3 — engineering derivative

> KBP OS — управляемый владельцем операционный слой West Coast KBP, в котором цели, источники, ограничения, решения, работа и доказательства связаны в версионируемый многоуровневый граф; AI готовит кандидаты, человек принимает авторитетное состояние, и только принятое состояние входит в графовую память бизнеса.

### How this section is read

**West Coast KBP is the business. KBP OS is its platform.** The business is the
real ADU and general-construction operation; KBP OS is the owner-controlled
operating layer that business runs on. The two names are not interchangeable,
and neither is a synonym for the other.

**Section A defines identity and direction. It does not classify any capability
as shipping.** Nothing here asserts that a described capability is available on
a public or internal surface. The TODAY / DIRECTION / NOT OPENED classification
is defined by Section B below; Section A itself creates no availability claim.

**No commercial or integration claim arises from this section.** Section A
carries no Deedseal integration claim, no buyer claim, no deployment claim, no
commercial-relationship claim, and no price or availability claim.

**The public Product 1 ↔ Product 2 relationship wording is unchanged by this
packet.** The only current public relationship wording remains the
already-adopted first-user wording held byte-for-byte in
[`../../src/lib/deedsealCrossReference.ts`](../../src/lib/deedsealCrossReference.ts),
which is the wording the upstream Product 1 canon section D governs. This packet
does not widen, shorten, reword, or re-scope it.

## B. V1 boundary ledger — [ЗАМОРОЖЕНО · OWNER-ADOPTED]

### B1 — canonical v1 boundary

> V1 сегодня — публичная строительная поверхность West Coast KBP: опубликованные маршруты, три принадлежащие компании concept-only модели и анонимная детерминированная Concept Studio уже работают; live intake, аккаунты, клиентские данные, property conclusions и внешние бизнес-действия выключены. Полный KBP OS — многоуровневый граф работы, человеческое принятие решений и накопление принятого состояния в графовую память компании — является направлением продукта, а не заявлением о поставленной сегодня возможности.

### Status grammar

- **TODAY** — capability or surface exists in the exact current repository state and, where a public-runtime claim is made, is separately observed on the canonical public domain.
- **DIRECTION** — Owner-adopted product direction; not a claim that the capability is shipped, public, integrated, or production-enabled.
- **NOT OPENED** — no current authority to operate or represent the capability as available.

#### Binding NOT OPENED rule

The product canon, a roadmap entry, the presence of code, or an ordinary task packet cannot open a **NOT OPENED** capability.

A capability may leave **NOT OPENED** only when the proposed flow conforms to the current `governance/BOUNDARIES.md`. If the current boundary prohibits that flow, `governance/BOUNDARIES.md` must first be changed through a separate Owner-adopted decision record. A separate Owner-approved bounded implementation packet is still required afterward.

`governance/BOUNDARIES.md` remains higher authority and is not superseded by this product canon.

### V1 ledger

| Contour | Status | Frozen boundary |
| :--- | :--- | :--- |
| Public portal | **TODAY** | Home, Services, Service Areas, Process, FAQ, About, Compare, Models, model pages, and Studio are published surfaces. |
| Owned model catalog | **TODAY** | `adu-s-450`, `adu-a-600`, and `adu-b-800`; all are `concept_only`, with no construction-readiness claim. |
| Concept Studio | **TODAY** | Anonymous deterministic work on a synthetic sample property; no address/contact collection and no real-property conclusion. |
| Public P1↔P2 relationship | **TODAY** | Only the frozen first-user wording; no public integration record is claimed. |
| Multi-level work graph and business graph memory | **DIRECTION** | KBP OS north star; not represented as a fully shipped production contour. |
| Intake, qualification, GIS, estimating, takeoff, permit/admin, scheduling, and inspection workflows | **DIRECTION · NOT OPENED** | Every contour remains subject to the binding NOT OPENED rule above. |
| CRM writes, client messages, calls, booking, or other external actions | **NOT OPENED** | Disabled and unauthorized under current v1 and current repository boundaries. |

## C. Closed anti-scope — [ЗАМОРОЖЕНО · OWNER-ADOPTED]

1. Просто сайт, лендинг, портфолио или цифровая брошюра. Сайт — публичная поверхность живого бизнеса.
2. Одноразовый лидогенератор или рекламная воронка. Лид — начало управляемого бизнес-графа, а не продаваемая запись.
3. Маркетплейс, каталог подрядчиков, брокер заявок или перепродавец лидов.
4. Универсальная CRM, ERP, таск-трекер или обычная система управления строительными проектами. Такие системы могут стать источниками или потребителями KBP OS, но не определяют продукт.
5. Каталог домов, конфигуратор или один конкретный ADU. Модели и Concept Studio — входные поверхности; ни A600, ни другой статичный дом не является сущностью продукта.
6. Товарный handyman-бренд, поток дешёвых ремонтов или массовая низкоценовая строительная воронка. Позиционирование — ADU и серьёзный general construction.
7. В v1 — универсальный SaaS для сторонних подрядчиков. Возможное внешнее лицензирование требует отдельного решения Владельца и не выводится из существования KBP OS.
8. Витрина, white-label оболочка или доказательство интеграции Deedseal. P1 и P2 имеют отдельные идентичности; публичная связь ограничена принятой first-user формулировкой.
9. Чат-бот, AI-помощник или AI-шоу. AI находится под капотом и не заменяет строительный бизнес как главный предмет продукта.
10. Автономный управляющий, подрядчик или профессиональный авторитет. AI не утверждает scope, цену, срок, permit/code/zoning/buildability, юридический или инженерный вывод и не запускает внешнее действие.
11. Графовая память не является историей чатов, свалкой документов, обычным RAG, векторной базой или неуправляемым журналом. В память бизнеса входит только принятое человеком, связанное с источниками состояние.
12. Принятая запись не является гарантией качества строительства, законности, buildability, стоимости, срока, безопасности или прибыльности. Она фиксирует проверяемое состояние работы, но не подменяет профессиональную ответственность.

Список закрытый: добавление, удаление или ослабление пункта — только новым решением Владельца.

`governance/BOUNDARIES.md` остаётся выше этого раздела и не superseded.

## Sections not yet adopted

Only Sections A–C are adopted and frozen in this repository canon. Sections D–H
carry no adopted, proposed, provisional, or skeletal content here, and none may
be invented, stubbed as a decision, or implemented ahead of its own bounded
landing packet. Each enters this canon only from its exact Owner-adopted record,
after its predecessor is Owner-merged.
