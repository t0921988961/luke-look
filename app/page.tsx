const nav = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const projects = [
  {
    index: "01",
    title: "Project one",
    note: "A selected piece of work will live here.",
  },
  {
    index: "02",
    title: "Project two",
    note: "A selected piece of work will live here.",
  },
  {
    index: "03",
    title: "Project three",
    note: "A selected piece of work will live here.",
  },
];

export default function Home() {
  return (
    <div id="top" className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <a
            href="#top"
            className="font-serif text-lg tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Luke Cheng
          </a>
          <nav aria-label="Sections" className="flex gap-6">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-line px-6 pt-16 pb-20 sm:px-10 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-medium tracking-[0.22em] text-accent uppercase">
              Taipei
            </p>
            <h1 className="mt-5 font-serif text-6xl leading-[0.92] tracking-tight sm:text-8xl">
              Luke Cheng
            </h1>
            <p className="mt-6 text-xl tracking-tight sm:text-2xl">
              Front-End Developer
            </p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
              Portfolio coming soon.
            </p>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 border-b border-line px-6 py-16 sm:px-10 sm:py-24"
        >
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-[10rem_1fr] sm:gap-12">
            <h2 className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
              About
            </h2>
            <div className="max-w-xl">
              <p className="font-serif text-3xl leading-snug tracking-tight sm:text-4xl">
                A front-end developer based in Taipei.
              </p>
              <p className="mt-6 leading-relaxed text-muted">
                A short introduction will go here — background, focus, and the
                kind of work Luke takes on. The words are not final yet.
              </p>
            </div>
          </div>
        </section>

        <section
          id="projects"
          className="scroll-mt-24 border-b border-line px-6 py-16 sm:px-10 sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 sm:grid-cols-[10rem_1fr] sm:gap-12">
              <h2 className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
                Projects
              </h2>
              <p className="max-w-xl leading-relaxed text-muted">
                Selected work will be added here. These cards are placeholders.
              </p>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {projects.map((project) => (
                <li
                  key={project.index}
                  className="flex min-h-44 flex-col justify-between rounded-2xl border border-line bg-card p-5"
                >
                  <span className="font-mono text-xs tracking-widest text-accent">
                    {project.index}
                  </span>
                  <div className="mt-8">
                    <h3 className="font-serif text-2xl tracking-tight">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {project.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="contact"
          className="scroll-mt-24 px-6 py-16 sm:px-10 sm:py-24"
        >
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-[10rem_1fr] sm:gap-12">
            <h2 className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
              Contact
            </h2>
            <div className="max-w-xl">
              <p className="font-serif text-3xl leading-snug tracking-tight sm:text-4xl">
                Say hello, once the details are in place.
              </p>
              <p className="mt-6 leading-relaxed text-muted">
                Email and other links will be listed here. For now, the public
                GitHub profile is the one real address.
              </p>
              <a
                href="https://github.com/t0921988961"
                className="mt-6 inline-flex items-center rounded-full border border-line bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                github.com/t0921988961
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Luke Cheng</p>
          <p>Portfolio coming soon.</p>
        </div>
      </footer>
    </div>
  );
}
