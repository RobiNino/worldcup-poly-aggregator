import { Navbar } from "../components/Navbar";

type Release = {
  date: string;
  changes: string[];
};

const RELEASES: Release[] = [
  {
    date: "2026-06-23",
    changes: ["Show previous match scores in the schedule's expandable match view"],
  },
  {
    date: "2026-06-13",
    changes: [
      "Schedule is now the main landing page; Predictions tab renamed to Overall",
      "Finished games are hidden from the schedule",
    ],
  },
  {
    date: "2026-06-08",
    changes: [
      "Initial release: World Cup match schedule with Polymarket odds aggregation",
      "Top goalscorer (Golden Boot) prediction",
      "GitHub source link in the navbar",
      "Page-visit counter in the footer",
    ],
  },
];

function formatDate(date: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export function ReleaseNotes() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Release <span className="text-accent">Notes</span>
        </h1>

        <div className="space-y-6">
          {RELEASES.map((release) => (
            <section
              key={release.date}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <h2 className="mb-3 border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-accent">
                {formatDate(release.date)}
              </h2>
              <ul className="space-y-2">
                {release.changes.map((change) => (
                  <li key={change} className="flex gap-2 text-sm text-text">
                    <span className="text-accent">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="mt-10 flex flex-col items-center gap-2 text-text-muted">
          <span className="text-xs">Page visits</span>
          <img
            src="https://count.getloli.com/@worldcup-poly-aggregator?theme=3d-num"
            alt="Page visit count"
            className="h-8"
          />
        </footer>
      </main>
    </>
  );
}
