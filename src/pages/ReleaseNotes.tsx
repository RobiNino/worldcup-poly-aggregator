import { Navbar } from "../components/Navbar";

type Release = {
  date: string;
  changes: string[];
};

const RELEASES: Release[] = [
  {
    date: "2026-06-23",
    changes: [
      "Show each team's FIFA ranking and total squad value in the schedule's expandable match view",
      "Show previous match scores in the schedule's expandable match view",
      "Split the Overall tab into separate Overall Winner and Golden Boot pages",
      "Golden Boot page now shows each player's current goal count next to their odds",
    ],
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
        <div className="mb-8 flex items-center justify-center gap-3">
          <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Release <span className="text-accent">Notes</span>
          </h1>
          <a
            href="https://github.com/RobiNino/worldcup-poly-aggregator"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-border hover:text-text"
            aria-label="View source on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </div>

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
