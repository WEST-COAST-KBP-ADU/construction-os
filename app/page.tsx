import Hero from "@/src/components/Hero";
import TrustBar from "@/src/components/TrustBar";
import CheckMyLotForm from "@/src/components/CheckMyLotForm";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <TrustBar />
      <CheckMyLotForm />

      <section
        id="process"
        aria-labelledby="process-heading"
        className="w-full scroll-mt-24 border-b border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B4332] dark:text-[#C9A84C]">
            Process
          </p>
          <h2
            id="process-heading"
            className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[#1C1B19] dark:text-zinc-50"
          >
            Review before commitments
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
            Check My Lot starts with a property address and project intent, then routes to manual
            owner/admin review before any scope, price, schedule, feasibility, or permit-path
            statement.
          </p>
        </div>
      </section>

      <section
        id="projects"
        aria-labelledby="projects-heading"
        className="w-full scroll-mt-24 border-b border-black/[.06] bg-[#F7F6F2] dark:border-white/[.08] dark:bg-[#1C1B19]"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B4332] dark:text-[#C9A84C]">
            Projects
          </p>
          <h2
            id="projects-heading"
            className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[#1C1B19] dark:text-zinc-50"
          >
            Work examples pending approval
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
            Public project photos, client names, addresses, testimonials, and case studies are not
            shown unless approved and verified.
          </p>
        </div>
      </section>

      <section
        id="resources"
        aria-labelledby="resources-heading"
        className="w-full scroll-mt-24 bg-white dark:bg-zinc-950"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B4332] dark:text-[#C9A84C]">
            Resources
          </p>
          <h2
            id="resources-heading"
            className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[#1C1B19] dark:text-zinc-50"
          >
            ADU planning guidance, not final advice
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700 dark:text-zinc-300">
            Future resources can explain the planning path without making legal, code, permit,
            eligibility, price, or timeline conclusions.
          </p>
        </div>
      </section>
    </main>
  );
}
