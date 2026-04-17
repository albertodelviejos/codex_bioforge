"use client";

import { useMemo, useState } from "react";

type Tone = "professional" | "fun" | "bold" | "minimalist";

type BioResponse = {
  bios: string[];
};

const toneOptions: Tone[] = ["professional", "fun", "bold", "minimalist"];

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
        body: JSON.stringify({
          profession,
          keywords,
          tone
        })
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
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      setError("Could not copy to clipboard. Try manual copy.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-bg via-slate-950 to-bg px-4 py-8">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-card/90 p-5 card-glow sm:p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-accentAlt">BioForge</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Create bios that fit your vibe</h1>
          <p className="mt-2 text-sm text-slate-300">
            Enter your profession, three keywords, and a tone. Get five short, copy-ready bios.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleGenerate}>
          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-200">Profession</span>
              <span className="text-xs text-slate-400">{profession.length}/60</span>
            </div>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-accent"
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
                  <span className="text-sm text-slate-200">Keyword {index + 1}</span>
                  <span className="text-xs text-slate-400">{keyword.length}/25</span>
                </div>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-accent"
                  placeholder={index === 0 ? "Creative" : index === 1 ? "Curious" : "Reliable"}
                  value={keyword}
                  onChange={(event) => updateKeyword(index, event.target.value)}
                  maxLength={25}
                  required
                />
              </label>
            ))}
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">Tone</span>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm capitalize focus:border-accent"
              value={tone}
              onChange={(event) => setTone(event.target.value as Tone)}
            >
              {toneOptions.map((option) => (
                <option key={option} value={option} className="capitalize">
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-accent to-accentAlt px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitDisabled}
          >
            {loading ? "Generating bios..." : "Generate"}
          </button>
        </form>

        {error && <p className="mt-4 rounded-lg border border-rose-400/50 bg-rose-900/20 p-3 text-sm text-rose-200">{error}</p>}

        {loading && (
          <section className="mt-7 space-y-3" aria-label="Loading bios">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl border border-slate-700 bg-slate-900/60" />
            ))}
          </section>
        )}

        {bios.length > 0 && (
          <section className="mt-7 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Your bios</h2>
            {bios.map((bio, index) => (
              <article
                key={`${bio}-${index}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3"
              >
                <div className="space-y-2">
                  <p className="text-sm text-slate-100">{bio}</p>
                  <p className="text-xs text-slate-400">{bio.length}/160 characters</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bio, index)}
                  className="shrink-0 rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-200 transition hover:border-accentAlt"
                >
                  {copiedIndex === index ? "Copied" : "Copy"}
                </button>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
