"use client";

import { FormEvent, useState } from "react";

import { siteConfig } from "@/src/lib/siteConfig";

type FormState = {
  property_address: string;
  adu_type: string;
  goal: string;
  approximate_size: string;
  budget_range: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

type LeadDraft = FormState & {
  lead_id: string;
  created_at: string;
  source_platform: string;
  utm_source: string;
  utm_campaign: string;
  landing_page: string;
  city: string;
  lead_status: "NEW";
  admin_notes: string;
};

const initialState: FormState = {
  property_address: "",
  adu_type: "Detached ADU",
  goal: "",
  approximate_size: "",
  budget_range: "",
  timeline: "",
  name: "",
  email: "",
  phone: "",
  consent: false,
};

const requiredFields: Array<keyof FormState> = [
  "property_address",
  "adu_type",
  "goal",
  "approximate_size",
  "budget_range",
  "timeline",
  "name",
  "email",
  "phone",
];

function fieldLabel(field: keyof FormState) {
  return field
    .replace("property_address", "Property address")
    .replace("adu_type", "ADU type")
    .replace("approximate_size", "Approximate size")
    .replace("budget_range", "Budget range")
    .replaceAll("_", " ");
}

function describedBy(field: keyof FormState, errors: Partial<Record<keyof FormState, string>>) {
  return errors[field] ? `${field}-error` : undefined;
}

export default function CheckMyLotForm() {
  const { aduTypes, budgetRanges, goals, intake, timelines } = siteConfig;
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [leadDraft, setLeadDraft] = useState<LeadDraft | null>(null);

  const selectedType = aduTypes.find((type) => type.title === form.adu_type) ?? aduTypes[0];
  const errorList = Object.entries(errors).filter((entry): entry is [keyof FormState, string] =>
    Boolean(entry[1]),
  );

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setLeadDraft(null);
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    for (const field of requiredFields) {
      if (!String(form[field]).trim()) {
        nextErrors[field] = `${fieldLabel(field)} is required.`;
      }
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.consent) {
      nextErrors.consent = "Consent is required before creating a local draft.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const draft: LeadDraft = {
      ...form,
      lead_id: `LOCAL-${Date.now()}`,
      created_at: new Date().toISOString(),
      source_platform: "west-coast-kbp-public-portal",
      utm_source: "direct",
      utm_campaign: "check-my-lot-v0.1",
      landing_page: "/",
      city: "",
      lead_status: "NEW",
      admin_notes: "Frontend-only local draft. TODO: connect approved backend persistence.",
    };

    // TODO: Replace local-only draft state with approved backend persistence.
    setLeadDraft(draft);
  }

  return (
    <section
      id="check-my-lot"
      aria-labelledby="check-my-lot-heading"
      className="w-full scroll-mt-24 border-b border-black/[.06] bg-[#F0EFE9] dark:border-white/[.08] dark:bg-zinc-950"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.86fr_1.14fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B4332] dark:text-[#C9A84C]">
            Address-first intake
          </p>
          <h2
            id="check-my-lot-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-[#1C1B19] dark:text-zinc-50 sm:text-4xl"
          >
            {intake.heading}
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-700 dark:text-zinc-300">
            {intake.subheading}
          </p>

          <div id="adu-types" className="mt-8 scroll-mt-24">
            <p className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
              Choose an ADU type
            </p>
            <div className="mt-4 grid gap-3">
              {aduTypes.map((type) => {
                const isSelected = type.title === form.adu_type;
                return (
                  <button
                    key={type.title}
                    type="button"
                    onClick={() => updateField("adu_type", type.title)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-[#1B4332] bg-white shadow-sm"
                        : "border-[#D4D1CA] bg-[#F7F6F2] hover:border-[#C9A84C]"
                    } dark:border-white/[.12] dark:bg-zinc-900`}
                    aria-pressed={isSelected}
                  >
                    <span className="block text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                      {type.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {type.description}
                    </span>
                    <span className="mt-3 inline-flex text-sm font-semibold text-[#1B4332] dark:text-[#C9A84C]">
                      {isSelected ? "Selected" : "Select"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#D4D1CA] bg-white p-5 shadow-xl shadow-black/[.05] dark:border-white/[.12] dark:bg-zinc-900 sm:p-6"
        >
          <div className="flex flex-col gap-2 border-b border-[#D4D1CA] pb-5 dark:border-white/[.10] sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                Lot review draft
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Selected: {selectedType.title}
              </p>
            </div>
            <span className="w-fit rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1B4332] dark:text-[#F7F6F2]">
              Frontend-only
            </span>
          </div>

          {errorList.length > 0 && (
            <div
              role="alert"
              className="mt-5 rounded-2xl border border-red-700/20 bg-red-50 p-4 text-sm leading-6 text-red-900 dark:border-red-300/20 dark:bg-red-300/10 dark:text-red-100"
            >
              <p className="font-semibold">Review required fields</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errorList.map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="property_address" className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                Property address <span aria-hidden="true">*</span>
              </label>
              <input
                id="property_address"
                name="property_address"
                autoComplete="street-address"
                required
                value={form.property_address}
                onChange={(event) => updateField("property_address", event.target.value)}
                aria-invalid={Boolean(errors.property_address)}
                aria-describedby={describedBy("property_address", errors)}
                className="mt-2 h-12 w-full rounded-xl border border-[#D4D1CA] bg-[#F7F6F2] px-3 text-base text-[#1C1B19] outline-none transition-colors focus:border-[#1B4332] dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-50"
                placeholder="Street address, city"
              />
              {errors.property_address && (
                <p id="property_address-error" className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {errors.property_address}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="adu_type" className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                ADU type <span aria-hidden="true">*</span>
              </label>
              <select
                id="adu_type"
                name="adu_type"
                required
                value={form.adu_type}
                onChange={(event) => updateField("adu_type", event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-[#D4D1CA] bg-[#F7F6F2] px-3 text-base text-[#1C1B19] outline-none focus:border-[#1B4332] dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-50"
              >
                {aduTypes.map((type) => (
                  <option key={type.title} value={type.title}>
                    {type.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="goal" className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                Project goal <span aria-hidden="true">*</span>
              </label>
              <select
                id="goal"
                name="goal"
                required
                value={form.goal}
                onChange={(event) => updateField("goal", event.target.value)}
                aria-invalid={Boolean(errors.goal)}
                aria-describedby={describedBy("goal", errors)}
                className="mt-2 h-12 w-full rounded-xl border border-[#D4D1CA] bg-[#F7F6F2] px-3 text-base text-[#1C1B19] outline-none focus:border-[#1B4332] dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="">Select goal</option>
                {goals.map((goal) => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
              {errors.goal && <p id="goal-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.goal}</p>}
            </div>

            <div>
              <label htmlFor="approximate_size" className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                Approximate size <span aria-hidden="true">*</span>
              </label>
              <input
                id="approximate_size"
                name="approximate_size"
                required
                value={form.approximate_size}
                onChange={(event) => updateField("approximate_size", event.target.value)}
                aria-invalid={Boolean(errors.approximate_size)}
                aria-describedby={describedBy("approximate_size", errors)}
                className="mt-2 h-12 w-full rounded-xl border border-[#D4D1CA] bg-[#F7F6F2] px-3 text-base text-[#1C1B19] outline-none focus:border-[#1B4332] dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-50"
                placeholder="Example: 750 sq ft"
              />
              {errors.approximate_size && (
                <p id="approximate_size-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.approximate_size}</p>
              )}
            </div>

            <div>
              <label htmlFor="budget_range" className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                Budget range <span aria-hidden="true">*</span>
              </label>
              <select
                id="budget_range"
                name="budget_range"
                required
                value={form.budget_range}
                onChange={(event) => updateField("budget_range", event.target.value)}
                aria-invalid={Boolean(errors.budget_range)}
                aria-describedby={describedBy("budget_range", errors)}
                className="mt-2 h-12 w-full rounded-xl border border-[#D4D1CA] bg-[#F7F6F2] px-3 text-base text-[#1C1B19] outline-none focus:border-[#1B4332] dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="">Select range</option>
                {budgetRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              {errors.budget_range && (
                <p id="budget_range-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.budget_range}</p>
              )}
            </div>

            <div>
              <label htmlFor="timeline" className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                Timeline <span aria-hidden="true">*</span>
              </label>
              <select
                id="timeline"
                name="timeline"
                required
                value={form.timeline}
                onChange={(event) => updateField("timeline", event.target.value)}
                aria-invalid={Boolean(errors.timeline)}
                aria-describedby={describedBy("timeline", errors)}
                className="mt-2 h-12 w-full rounded-xl border border-[#D4D1CA] bg-[#F7F6F2] px-3 text-base text-[#1C1B19] outline-none focus:border-[#1B4332] dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="">Select timing</option>
                {timelines.map((timeline) => (
                  <option key={timeline.value} value={timeline.value}>
                    {timeline.label}
                  </option>
                ))}
              </select>
              {errors.timeline && (
                <p id="timeline-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.timeline}</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                Name <span aria-hidden="true">*</span>
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy("name", errors)}
                className="mt-2 h-12 w-full rounded-xl border border-[#D4D1CA] bg-[#F7F6F2] px-3 text-base text-[#1C1B19] outline-none focus:border-[#1B4332] dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-50"
              />
              {errors.name && <p id="name-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                Email <span aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describedBy("email", errors)}
                className="mt-2 h-12 w-full rounded-xl border border-[#D4D1CA] bg-[#F7F6F2] px-3 text-base text-[#1C1B19] outline-none focus:border-[#1B4332] dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-50"
              />
              {errors.email && <p id="email-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-semibold text-[#1C1B19] dark:text-zinc-50">
                Phone <span aria-hidden="true">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy("phone", errors)}
                className="mt-2 h-12 w-full rounded-xl border border-[#D4D1CA] bg-[#F7F6F2] px-3 text-base text-[#1C1B19] outline-none focus:border-[#1B4332] dark:border-white/[.12] dark:bg-zinc-950 dark:text-zinc-50"
              />
              {errors.phone && <p id="phone-error" className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.phone}</p>}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#D4D1CA] bg-[#F7F6F2] p-4 dark:border-white/[.10] dark:bg-zinc-950">
            <label htmlFor="consent" className="flex gap-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                checked={form.consent}
                onChange={(event) => updateField("consent", event.target.checked)}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={describedBy("consent", errors)}
                required
                className="mt-1 size-4 rounded border-[#D4D1CA] text-[#1B4332]"
              />
              <span>
                I agree that this is a preliminary review request and that West Coast KBP must
                manually review details before any commitment.
              </span>
            </label>
            {errors.consent && <p id="consent-error" className="mt-2 text-sm text-red-700 dark:text-red-300">{errors.consent}</p>}
          </div>

          <p className="mt-5 rounded-2xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 p-4 text-sm leading-6 text-[#1C1B19] dark:text-zinc-200">
            {intake.disclaimer}
          </p>

          <button
            type="submit"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1B4332] px-7 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#153527] sm:w-auto"
          >
            Create local Check My Lot draft
          </button>

          {leadDraft && (
            <div
              role="status"
              className="mt-5 rounded-2xl border border-emerald-700/20 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-100"
            >
              <p className="font-semibold">{intake.successHeading}</p>
              <p className="mt-1">{intake.successText}</p>
              <p className="mt-2 font-mono text-xs">Lead status: {leadDraft.lead_status}</p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
