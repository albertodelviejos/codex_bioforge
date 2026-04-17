"use client";

import { useMemo, useState } from "react";

type Tone = "professional" | "fun" | "bold" | "minimalist";

type BioResponse = {
  bios: string[];
};

const toneOptions: { label: string; value: Tone; hint: string }[] = [
  { label: "Professional", value: "professional", hint: "Clean and credible" },
  { label: "Fun", value: "fun", hint: "Friendly and playful" },
  { label: "Bold", value: "bold", hint: "Confident and sharp" },
  { label: "Minimalist", value: "minimalist", hint: "Simple and refined" }
];

export default function BioForgeForm() {
  const [profession, setProfession] = useState("");
  const [keywords, setKeywords] = useState(["", "", ""]);
  const [tone, setTone] = useState<Tone>("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bios, setBios] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isSubmitDisabled = useMemo(() => {
    const hasThreeKeywords = keywords.every((item) => item.trim().length > 0);
    return loading || !profession.trim() || !hasThreeKeywords;
  }, [loading, profession, keywords]);

  const updateKeyword = (index: number, value: string) => {
    setKeywords((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setCopiedIndex(null);
    setBios([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ profession, keywords, tone })
      });

      const data: BioResponse & { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate bios.");
      }

      setBios(data.bios);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (bio: string, index: number) => {
    try {
      await navigator.clipboard.writeText(bio);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1600);
    } catch {
      setError("Could not copy to clipboard. Try manual copy.");
    }
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[1.03fr_0.97fr]">
        <section className="panel soft-ring rounded-3xl p-5 sm:p-8">
          <div className="mb-8">
            <span className="section-title">BioForge Studio</span>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Build premium bios in seconds
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
              Designed for creators, founders, consultants, and teams who need polished one-line bios for socials,
              portfolios, and speaker profiles.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5">Dark mode first</span>
              <span className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5">5 copy-ready outputs</span>
              <span className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5">≤160 characters each</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleGenerate}>
            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Profession</span>
                <span className="text-xs text-slate-400">{profession.length}/60</span>
              </div>
              <input
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-cyan-400"
                placeholder="Product Designer"
                value={profession}
                onChange={(event) => setProfession(event.target.value)}
                maxLength={60}
                required
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {keywords.map((keyword, index) => (
                <label className="block" key={index}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">Keyword {index + 1}</span>
                    <span className="text-xs text-slate-400">{keyword.length}/25</span>
                  </div>
                  <input
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-cyan-400"
                    placeholder={index === 0 ? "Strategic" : index === 1 ? "Creative" : "Reliable"}
                    value={keyword}
                    onChange={(event) => updateKeyword(index, event.target.value)}
                    maxLength={25}
                    required
                  />
                </label>
              ))}
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-200">Tone</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {toneOptions.map((option) => {
                  const selected = tone === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border px-4 py-3 transition ${
                        selected
                          ? "border-cyan-400 bg-cyan-500/10"
                          : "border-slate-700/80 bg-slate-950/70 hover:border-slate-500"
                      }`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="tone"
                        value={option.value}
                        checked={selected}
                        onChange={() => setTone(option.value)}
                      />
                      <p className="text-sm font-medium text-slate-100">{option.label}</p>
                      <p className="text-xs text-slate-400">{option.hint}</p>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 via-sky-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitDisabled}
            >
              {loading ? "Generating bios..." : "Generate bios"}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-xl border border-rose-400/55 bg-rose-900/20 p-3 text-sm text-rose-200" role="alert">
              {error}
            </p>
          )}
        </section>

        <section className="panel rounded-3xl p-5 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="section-title">Output</span>
              <h2 className="mt-2 text-xl font-semibold">Your bio options</h2>
            </div>
            <span className="rounded-full border border-slate-700/80 bg-slate-900/65 px-3 py-1 text-xs text-slate-300">
              5 variations
            </span>
          </div>

          {loading && (
            <section className="space-y-3" aria-label="Loading bios" aria-live="polite">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-[86px] animate-pulse rounded-xl border border-slate-700 bg-slate-900/70" />
              ))}
            </section>
          )}

          {!loading && bios.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-400">
              Your generated bios will appear here. Enter your details and click <strong>Generate bios</strong>.
            </div>
          )}

          {bios.length > 0 && (
            <div className="space-y-3">
              {bios.map((bio, index) => (
                <article key={`${bio}-${index}`} className="bio-card rounded-xl p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Option {index + 1}</span>
                    <span>{bio.length}/160</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-100">{bio}</p>
                  <button
                    type="button"
                    onClick={() => handleCopy(bio, index)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                  >
                    <span aria-hidden>⧉</span>
                    {copiedIndex === index ? "Copied" : "Copy"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
