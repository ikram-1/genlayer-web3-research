"use client";

import { useState } from "react";
import {
  connectMetaMask,
  getContractAddress,
  getStudioUrl,
} from "@/lib/genlayer/client";
import Web3Research from "@/lib/contracts/Web3Research";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [projectName, setProjectName] = useState("");
  const [website, setWebsite] = useState("");
  const [savedProject, setSavedProject] = useState("");
  const [researchResult, setResearchResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenResult, setTokenResult] = useState("");
  const [showTokenExplorer, setShowTokenExplorer] = useState(false);
  const [tokenHistory, setTokenHistory] = useState<any[]>([]);

  const contract = walletAddress
    ? new Web3Research(
        getContractAddress(),
        walletAddress,
        getStudioUrl()
      )
    : null;

    async function addProject() {
    if (!projectName || !website || !contract) return;

    try {
      setLoading(true);

      const feeEstimate = await contract.estimateAddProjectFees(
        projectName,
        website,
        "standard"
      );

      await contract.addProject(
        projectName,
        website,
        feeEstimate
      );

      setSavedProject(
        `${projectName} — ${website}`
      );
    } catch (error) {
      console.error(error);
      alert("Failed to add project");
        } finally {
      setLoading(false);
    }
  }
    async function getResearch() {
  if (!projectName || !contract) return;

  try {
    setLoading(true);

    const research = await contract.getResearch(projectName);

    console.log("GET RESEARCH RESULT:", research);

    setResearchResult(research);
    setShowTokenExplorer(true);
    setTimeout(() => {
  document
    .getElementById("token-explorer")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
}, 300);
    
    } catch (error: any) {
      console.error("GET RESEARCH ERROR:", error);
      console.error(
        "GET RESEARCH ERROR MESSAGE:",
        error?.message
      );
      console.error(
        "GET RESEARCH ERROR FULL:",
        JSON.stringify(error, null, 2)
      );

      alert(
        error?.message ||
          "Failed to get research result. Check the browser console."
      );
    } finally {
      setLoading(false);
    }
    }
   // getResearch ends


async function exploreToken() {
  if (!tokenName || !tokenSymbol) return;

  try {
    setTokenResult("Loading live token data...");

    const response = await fetch(
      `/api/token?symbol=${tokenSymbol.toUpperCase()}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Token data request failed");
    }

    if (!data.found) {
  throw new Error(
    data.message || "Token market data is currently unavailable."
  );
}

const token = data.token;
setTokenHistory(
  (data.history || []).map((item: any) => ({
    date: new Date(item.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    price: item.quote?.USD?.price ?? null,
  }))
);

if (!token) {
  throw new Error("Token data not available.");
}

    const quote = token.quote?.USD;

    setTokenResult(
      `Token: ${token.name}
Symbol: ${token.symbol}
Rank: #${token.cmc_rank ?? "N/A"}
Current Price: $${quote?.price?.toFixed(6) ?? "N/A"}
24h Change: ${quote?.percent_change_24h?.toFixed(2) ?? "N/A"}%
Market Cap: $${quote?.market_cap?.toLocaleString() ?? "N/A"}
24h Volume: $${quote?.volume_24h?.toLocaleString() ?? "N/A"}`
    );
  } catch (error) {
    console.error("Token Explorer Error:", error);

    setTokenResult(
      error instanceof Error
        ? error.message
        : "Unable to fetch live token data."
    );
  }
}

    async function researchProject() {
  if (!projectName || !contract) return;

  try {
    setLoading(true);
    setResearchResult("");

    const receipt = await contract.researchProject(projectName);

    console.log("RESEARCH SUCCESS:", receipt);

    setResearchResult(
      "Research transaction completed successfully. Click Get Research to load the verified result."
    );
  } catch (error: any) {
    console.error("RESEARCH ERROR:", error);

    const message =
      error?.message || "Research transaction failed";

    if (message.includes("WEBSITE_ACCESS_DENIED")) {
      alert(
        "⚠️ Website Access Denied\n\n" +
        "The project's website is blocking GenLayer's web renderer."
      );
    } else if (message.includes("WEBSITE_NOT_FOUND")) {
      alert(
        "❌ Website Not Found\n\n" +
        "The project's website returned HTTP 404. Please check the URL."
      );
    } else if (message.includes("WEBSITE_SERVER_ERROR")) {
      alert(
        "⚠️ Website Server Error\n\n" +
        "The project's website is currently returning a server error. Please try again later."
      );
    } else if (message.includes("WEBSITE_UNREACHABLE")) {
      alert(
        "❌ Website Unreachable\n\n" +
        "The project's website could not be reached. Please check the URL."
      );
    } else {
      alert(
        "❌ Research Failed\n\n" +
        message
      );
    }
  } finally {
    setLoading(false);
  }
}
  return (
    <main className="min-h-screen bg-[#050509] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 font-bold">
              G
            </div>

            <div>
              <h1 className="text-lg font-bold">
                GenLayer
              </h1>

              <p className="text-xs text-gray-400">
                Web3 Research
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                const address = await connectMetaMask();
                setWalletAddress(address);
              } catch (error) {
                console.error(error);
                alert("Wallet connection failed");
              }
            }}
            className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-5 py-2 text-sm font-medium text-purple-200 transition hover:bg-purple-600/30"
          >
            {walletAddress
              ? `${walletAddress.slice(
                  0,
                  6
                )}...${walletAddress.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
            Intelligent Contract Demo
          </p>

          <h2 className="text-5xl font-bold tracking-tight">
            Web3 Project Research
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
            Add a Web3 project and let a GenLayer intelligent
            contract research its website using web data and AI.
          </p>
        </div>
      </section>

      {/* Research Card */}
      <section className="mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-8 shadow-2xl">
          <h3 className="text-2xl font-semibold">
            Research a Web3 Project
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Enter the project name and official website.
          </p>

          <div className="mt-8 space-y-5">
            {/* Project Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Project Name
              </label>

              <input
                type="text"
                value={projectName}
                onChange={(e) =>
                  setProjectName(e.target.value)
                }
                placeholder="e.g. GenLayer"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-purple-500"
              />
            </div>

            {/* Website */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Official Website
              </label>

              <input
                type="url"
                value={website}
                onChange={(e) =>
                  setWebsite(e.target.value)
                }
                placeholder="https://www.genlayer.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-purple-500"
              />
            </div>

            {/* Buttons */}
<div className="grid gap-3 pt-2 sm:grid-cols-3">
  {/* Add Project */}
  <button
    onClick={addProject}
    disabled={
      !projectName ||
      !website ||
      !walletAddress ||
      loading
    }
    className="group rounded-xl bg-purple-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-purple-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-500 hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
  >
    <span className="flex items-center justify-center gap-2">
      <span>＋</span>
      Add Project
    </span>
  </button>

  {/* Research Project */}
  <button
    onClick={researchProject}
    disabled={
      !projectName ||
      !walletAddress ||
      loading
    }
    className="group rounded-xl border border-purple-400/30 bg-purple-500/10 px-5 py-3.5 font-semibold text-purple-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400/50 hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
  >
    <span className="flex items-center justify-center gap-2">
      <span>🧠</span>
      {loading ? "Researching..." : "Research Project"}
    </span>
  </button>

  {/* Get Research */}
  <button
    onClick={getResearch}
    disabled={
      !projectName ||
      !walletAddress ||
      loading
    }
    className="group rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3.5 font-semibold text-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
  >
    <span className="flex items-center justify-center gap-2">
      <span>📄</span>
      Get Research
    </span>
  </button>
</div>

            {/* Research Progress */}
            {loading && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-300/80">
                  <span>🔄 Researching...</span>
                  <span>Processing</span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-purple-500/10">
                  <div className="h-full w-1/3 rounded-full bg-purple-400 animate-[progress_1.5s_ease-in-out_infinite]" />
                </div>

                <p className="text-xs text-purple-300/60">
                  Analyzing website &amp; consensus...
                </p>
              </div>
            )}
          </div>

          {/* Saved Project */}
          {savedProject && (
            <div className="mt-8 rounded-xl border border-green-500/20 bg-green-500/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-green-400">
                Project Retrieved
              </p>

              <p className="mt-2 text-sm text-gray-200">
                {savedProject}
              </p>
            </div>
          )}

          {/* Research Result */}
{researchResult && (
  <div className="mt-6 overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-[#0d0d18] to-blue-500/5 shadow-lg shadow-purple-950/20">

    {/* Header */}
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-lg">
          🧠
        </div>

        <div>
          <p className="text-sm font-semibold text-white">
            AI Research Result
          </p>

          <p className="text-xs text-gray-500">
            Verified through GenLayer
          </p>
        </div>
      </div>

      <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[11px] font-medium text-green-400">
        Onchain
      </span>
    </div>
    {/* Token / Coin Explorer */}
    {showTokenExplorer && (
<div className="mt-6 overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-[#0d0d18] to-orange-500/5 shadow-lg shadow-yellow-950/10">

  <div className="border-b border-white/10 px-5 py-4">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/15 text-lg">
        🪙
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
  <div>
    <p className="text-sm font-semibold text-white">
      Token Explorer
    </p>
    <p className="mt-1 text-xs text-gray-500">
      Live market data from CoinMarketCap
    </p>
  </div>

  <button
    type="button"
    onClick={exploreToken}
    className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-medium text-yellow-300 transition hover:bg-yellow-500/20"
  >
    ↻ Refresh
  </button>
</div>

        <p className="text-xs text-gray-500">
          Explore detailed information about a Web3 token or coin
        </p>
      </div>
    </div>
  </div>

  <div className="space-y-5 px-5 py-5">

    {/* Token Name */}
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">
        Token / Coin Name
      </label>

      <input
        type="text"
        value={tokenName}
        onChange={(e) => setTokenName(e.target.value)}
        placeholder="e.g. GenLayer"
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
      />
    </div>

    {/* Token Symbol */}
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">
        Symbol
      </label>

      <input
        type="text"
        value={tokenSymbol}
        onChange={(e) => setTokenSymbol(e.target.value)}
        placeholder="e.g. GEN"
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-yellow-500"
      />
    </div>

    {/* Explore Button */}
    <button
      onClick={exploreToken}
      disabled={!tokenName || !tokenSymbol}
      className="w-full rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-3.5 font-semibold text-yellow-200 transition-all hover:-translate-y-0.5 hover:border-yellow-400/50 hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="flex items-center justify-center gap-2">
        🔍
        Explore Token
      </span>
    </button>
    {showTokenExplorer && (
  <div
    id="token-explorer"
    className="mt-6 overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-[#0d0d18] to-orange-500/5 shadow-lg shadow-yellow-950/20"
    >
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-400">
      Token Explorer Result
    </p>
    <div className="mb-4">
  <p className="text-xl font-bold text-white">
    {tokenResult.match(/Token: ([^\n]+)/)?.[1] ?? "Token"}
    <span className="ml-2 text-sm font-medium text-gray-400">
      ({tokenResult.match(/Symbol: ([^\n]+)/)?.[1] ?? "N/A"})
    </span>
  </p>
  <p className="mt-1 text-xs text-gray-500">
    Live market data from CoinMarketCap
  </p>
</div>
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5">
  <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs text-gray-500">Rank</p>
    <p className="mt-1 break-words text-base font-bold text-white">
      {tokenResult.match(/Rank: #([^\n]+)/)?.[1] ?? "N/A"}
    </p>
  </div>

  <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs text-gray-500">Price</p>
    <p className="mt-1 break-words text-base font-bold text-white">
      {tokenResult.match(/Current Price: \$([^\n]+)/)?.[1]
        ? `$${tokenResult.match(/Current Price: \$([^\n]+)/)?.[1]}`
        : "N/A"}
    </p>
  </div>

 <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-4">
  <p className="text-xs text-gray-500">24h Change</p>
  <p
    className={`mt-1 text-base font-bold ${
      (() => {
        const change = Number(
          tokenResult.match(/24h Change: (-?[\d.]+)/)?.[1]
        );

        if (change > 0) return "text-green-400";
        if (change < 0) return "text-red-400";
        return "text-gray-300";
      })()
    }`}
  >
    {tokenResult.match(/24h Change: ([^\n]+)/)?.[1] ?? "N/A"}
  </p>
</div>

  <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs text-gray-500">Market Cap</p>
    <p className="mt-1 break-words text-base font-bold text-white">
      {tokenResult.match(/Market Cap: \$([^\n]+)/)?.[1]
        ? `$${tokenResult.match(/Market Cap: \$([^\n]+)/)?.[1]}`
        : "N/A"}
    </p>
  </div>

  <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs text-gray-500">24h Volume</p>
    <p className="mt-1 break-words text-base font-bold text-white">
      {tokenResult.match(/24h Volume: \$([^\n]+)/)?.[1]
        ? `$${tokenResult.match(/24h Volume: \$([^\n]+)/)?.[1]}`
        : "N/A"}
    </p>
  </div>
</div>
    {tokenHistory.length > 0 && (
  <div className="mt-5 h-72 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={tokenHistory}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis
  tickFormatter={(value) => `$${value.toFixed(4)}`}
  tick={{ fill: "#d1d5db", fontSize: 12 }}
  width={65}
/>
        <Tooltip
  contentStyle={{
    backgroundColor: "#111827",
    border: "1px solid #374151",
    borderRadius: "8px",
    color: "#f3f4f6",
  }}
  labelStyle={{ color: "#d1d5db" }}
  formatter={(value: any) =>
    `$${Number(value).toFixed(6)}`
  }
/>
        <Line
          type="monotone"
          dataKey="price"
          stroke="#facc15"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}
  </div>
)}

  </div>
</div>
)}

    {/* Research Content */}
    <div className="px-5 py-5">

      <div className="mb-5 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
          Project
        </p>

        <p className="mt-1 text-sm font-medium text-gray-200">
          {projectName}
        </p>
      </div>

      {(() => {
        try {
          const data = JSON.parse(researchResult);

          const summary = data?.summary;

          return (
            <div className="space-y-6">

              {/* Purpose */}
              {summary?.purpose && (
                <div>
                  <h4 className="mb-2 text-lg font-semibold text-white">
                    🎯 Purpose
                  </h4>

                  <p className="text-sm leading-7 text-gray-300">
                    {summary.purpose}
                  </p>
                </div>
              )}

              {/* Technology */}
              {summary?.technology && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">
                    ⚙️ Technology
                  </h4>

                  <div className="rounded-xl border border-white/5 bg-black/20 p-4">

                    {summary.technology.network && (
                      <p className="mb-4 text-sm leading-7 text-gray-300">
                        {summary.technology.network}
                      </p>
                    )}

                    {summary.technology.key_components && (
                      <div className="grid gap-3">
                        {summary.technology.key_components.map(
                          (component: any, index: number) => (
                            <div
                              key={index}
                              className="rounded-lg border border-purple-500/10 bg-purple-500/5 p-4"
                            >
                              <h5 className="font-semibold text-purple-300">
                                {component.name}
                              </h5>

                              <p className="mt-1 text-sm leading-6 text-gray-400">
                                {component.description}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Main Use Cases */}
              {summary?.main_use_case && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">
                    🚀 Main Use Cases
                  </h4>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {summary.main_use_case.map(
                      (useCase: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4"
                        >
                          <h5 className="font-semibold text-blue-300">
                            {useCase.scenario}
                          </h5>

                          <p className="mt-1 text-sm leading-6 text-gray-400">
                            {useCase.description}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Value Proposition */}
              {summary?.value_proposition && (
                <div>
                  <h4 className="mb-2 text-lg font-semibold text-white">
                    💡 Value Proposition
                  </h4>

                  <div className="rounded-xl border border-green-500/10 bg-green-500/5 p-4">
                    <p className="text-sm leading-7 text-gray-300">
                      {summary.value_proposition}
                    </p>
                  </div>
                </div>
              )}

            </div>
          );
        } catch {
          return (
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
              {researchResult}
            </p>
          );
        }
      })()}

    </div>
  </div>
)}

  </div>
   </section>

      {/* How It Works */}

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h3 className="text-2xl font-bold">
          How It Works
        </h3>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-6">
            <div className="text-2xl font-bold text-purple-400">
              01
            </div>

            <h4 className="mt-4 text-lg font-semibold">
              Add a Project
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Store a Web3 project name and its official website.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-6">
            <div className="text-2xl font-bold text-purple-400">
              02
            </div>

            <h4 className="mt-4 text-lg font-semibold">
              Research Onchain
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              The GenLayer intelligent contract reads web data
              and processes it with an AI model.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d0d18] p-6">
            <div className="text-2xl font-bold text-purple-400">
              03
            </div>

            <h4 className="mt-4 text-lg font-semibold">
              Get the Result
            </h4>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Validators reach an equivalent result using
              GenLayer&apos;s Equivalence Principle.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-sm text-gray-500">
          Built with GenLayer Intelligent Contracts
        </p>
      </footer>
    </main>
  );
}