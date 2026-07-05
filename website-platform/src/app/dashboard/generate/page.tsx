"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wand2, Loader2, Sparkles, Palette, Globe, CheckSquare, Square, 
  Building2, HelpCircle, Terminal, Monitor, Smartphone, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { saveGeneratedSite } from "./actions";

const COLORS = [
  { name: "Clean Minimalist Dark", class: "bg-slate-900 border-slate-700 text-white" },
  { name: "Neon Cyberpunk", class: "bg-purple-950 border-purple-500 text-pink-400" },
  { name: "Warm Pastel Retro", class: "bg-orange-50 border-orange-200 text-orange-900" },
  { name: "Vibrant Corporate Blue", class: "bg-blue-950 border-blue-600 text-blue-100" }
];

const AVAILABLE_FEATURES = [
  "Online Shop / Storefront",
  "Booking & Reservation Calendar",
  "Contact & Lead Forms",
  "Live Customer Chat Support"
];

interface GeneratedSite {
  id: string;
  name: string;
  url: string;
  html_content: string;
}

export default function GenerateSite() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // In-depth Questionnaire States
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [prompt, setPrompt] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [colorScheme, setColorScheme] = useState("Clean Minimalist Dark");
  const [location, setLocation] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  // Generated Site details
  const [generatedSite, setGeneratedSite] = useState<GeneratedSite | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  // Simulated Live Bot Builder Terminal logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  const logsSequence = [
    "🚀 Initializing AI Website Agent...",
    "🔑 Handshaking with Claude 3.5 Sonnet model...",
    `🎨 Designing themed layout using the "${colorScheme}" color palette...`,
    `🏢 Customizing workspace files for ${businessName}...`,
    "🛠️ Crafting responsive header, footer, and navigation components...",
    features.includes("Online Shop / Storefront") ? "🛍️ Injecting e-commerce product grids and mock checkout flow..." : null,
    features.includes("Booking & Reservation Calendar") ? "📅 Compiling dynamic appointment and calendar scheduler blocks..." : null,
    features.includes("Contact & Lead Forms") ? "📨 Integrating lead capture forms and database endpoints..." : null,
    features.includes("Live Customer Chat Support") ? "💬 Embedding Live Support chat widget into page footer..." : null,
    `📍 Setting up location meta info for "${location || 'Seattle, WA'}"...`,
    "⚡ Compiling Tailwind CSS stylesheet and inline animations...",
    "📦 Bundling package builds and deploying preview bundle to CDN...",
    "🎉 Site generated successfully! Transferring to dashboard..."
  ].filter(Boolean) as string[];

  // Trigger terminal logs simulation when generating
  useEffect(() => {
    if (isGenerating && logIndex < logsSequence.length) {
      const delay = logIndex === 0 ? 300 : Math.random() * 800 + 400;
      const timer = setTimeout(() => {
        setTerminalLogs((prev) => [...prev, logsSequence[logIndex]]);
        setLogIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, logIndex, logsSequence]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTerminalLogs([]);
    setLogIndex(0);
    setGeneratedSite(null);

    // Call server action to save the site
    const result = await saveGeneratedSite(
      businessName || "Unnamed Business",
      industry || "Technology",
      prompt || "A beautiful placeholder landing page",
      targetAudience || "General Public",
      features,
      colorScheme,
      location || "Seattle, WA"
    );

    if (result.error) {
      alert(result.error);
      setIsGenerating(false);
      return;
    }

    setGeneratedSite(result.site);

    // Keep displaying the builder logs until finished
    const finishInterval = setInterval(() => {
      setTerminalLogs((prev) => {
        if (prev.length < logsSequence.length) {
          return prev;
        } else {
          clearInterval(finishInterval);
          setTimeout(() => {
            setIsGenerating(false);
            setStep(5); // Go to preview page
          }, 800);
          return prev;
        }
      });
    }, 500);
  };

  const toggleFeature = (feat: string) => {
    setFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const reloadIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      {step < 5 && (
        <header className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            AI Website Generator
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete our in-depth configuration questionnaire to let the bot construct a custom landing page.
          </p>
        </header>
      )}

      <div className="relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: General Business Identity */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-secondary/20 border border-border/50 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl backdrop-blur-sm space-y-6"
            >
              <div className="flex items-center gap-3 mb-2 text-primary border-b border-border/30 pb-4">
                <Building2 className="w-6 h-6" />
                <h2 className="text-xl font-bold">1. Business Identity</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Business Name</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    placeholder="e.g. Pixelcraft Studio"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Location / City</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    placeholder="e.g. Seattle, WA (optional)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Select Industry</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Technology", "E-Commerce", "Portfolio", "Agency"].map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setIndustry(ind)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        industry === ind 
                          ? "bg-primary/20 border-primary/50 text-primary scale-105" 
                          : "bg-secondary/50 border-border hover:border-primary/30"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!businessName || !industry}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue Setup
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Theme & Features */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-secondary/20 border border-border/50 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl backdrop-blur-sm space-y-6"
            >
              <div className="flex items-center gap-3 mb-2 text-primary border-b border-border/30 pb-4">
                <Palette className="w-6 h-6" />
                <h2 className="text-xl font-bold">2. Theme & Features</h2>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-muted-foreground">Color Vibe / Palette</label>
                <div className="grid md:grid-cols-2 gap-4">
                  {COLORS.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setColorScheme(col.name)}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        colorScheme === col.name 
                          ? "ring-2 ring-primary border-transparent scale-[1.02]" 
                          : "opacity-75 hover:opacity-100"
                      } ${col.class}`}
                    >
                      <span className="font-bold text-sm">{col.name}</span>
                      <span className="text-[10px] mt-1 opacity-70">Custom design scheme</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-muted-foreground">Interactive Features to Inject</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {AVAILABLE_FEATURES.map((feat) => {
                    const isChecked = features.includes(feat);
                    return (
                      <button
                        key={feat}
                        onClick={() => toggleFeature(feat)}
                        className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                          isChecked 
                            ? "bg-primary/10 border-primary/40 text-primary" 
                            : "bg-secondary/40 border-border hover:border-primary/20"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-primary shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-500 shrink-0" />
                        )}
                        <span className="text-sm font-medium">{feat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl font-semibold hover:bg-secondary/80 transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Almost Done
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Stance & Goal */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-secondary/20 border border-border/50 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl backdrop-blur-sm space-y-6"
            >
              <div className="flex items-center gap-3 mb-2 text-primary border-b border-border/30 pb-4">
                <HelpCircle className="w-6 h-6" />
                <h2 className="text-xl font-bold">3. Audience & Focus</h2>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Target Audience</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  placeholder="e.g. Tech founders, local foodies, gamers..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">What is the core message / description?</label>
                <textarea
                  className="w-full bg-background border border-border rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm resize-none"
                  placeholder="Provide any details about services offered, unique values, or details you want prominently shown..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl font-semibold hover:bg-secondary/80 transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!prompt || !targetAudience}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Builder
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Ready & Live Builder Terminal Preview */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-secondary/20 border border-border/50 rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl"
            >
              {!isGenerating ? (
                <div className="text-center space-y-6">
                  <Wand2 className="w-16 h-16 text-primary mx-auto" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Ready to run builder?</h2>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      The AI Bot will consume 1 credit to structure, style, and inject layout configurations into your new website.
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-3 rounded-xl font-medium hover:bg-secondary/80 transition-colors text-sm"
                    >
                      Modify Details
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      Build Website
                    </button>
                  </div>
                </div>
              ) : (
                /* LIVE Terminal Output */
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border/30 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Website Bot Builder Logs</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running live compile...
                    </div>
                  </div>

                  <div className="bg-[#0b0f19] rounded-2xl p-5 font-mono text-xs text-green-400 border border-border/40 min-h-[220px] max-h-[300px] overflow-y-auto space-y-2.5 font-semibold">
                    {terminalLogs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="leading-relaxed"
                      >
                        {log}
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground text-center animate-pulse">
                    The bot is organizing code components and embedding selected plugins...
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 5: Success Preview (Full high-fidelity rendering) */}
          {step === 5 && generatedSite && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header Details */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-secondary/10 border border-border/50 rounded-3xl p-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-primary w-6 h-6 animate-pulse" /> Site Generated Successfully!
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your page is fully compiled and hosted under the domain: <strong className="text-primary">{generatedSite.url}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={reloadIframe}
                    className="p-2.5 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
                    title="Reload Preview Frame"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload
                  </button>
                  <Link href="/dashboard" className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition-all flex items-center gap-1.5 shadow-lg shadow-primary/10">
                    <Globe className="w-4 h-4" /> Go to Dashboard
                  </Link>
                </div>
              </div>

              {/* Viewport Width Control Bar */}
              <div className="flex justify-between items-center bg-[#0e1422]/60 border border-border/40 rounded-2xl px-6 py-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Preview Mode</span>
                  <div className="flex gap-1.5 bg-black/35 p-1 rounded-xl border border-border/30">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                        previewMode === 'desktop' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" /> Desktop
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                        previewMode === 'mobile' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile
                    </button>
                  </div>
                </div>
                
                <span className="text-[10px] text-gray-500 font-mono hidden md:inline">
                  Viewport: {previewMode === 'desktop' ? '100% (Responsive)' : '375px x 680px'}
                </span>
              </div>

              {/* High-Fidelity Browser Mockup containing the real generated HTML */}
              <div className="rounded-3xl border border-border/50 bg-[#0e1422]/60 overflow-hidden shadow-2xl flex flex-col">
                {/* Browser Toolbar Chrome */}
                <div className="bg-secondary/40 px-4 py-3 flex items-center justify-between border-b border-border/50 text-xs text-muted-foreground select-none">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  
                  <div className="bg-black/35 rounded-lg px-24 py-1.5 text-center truncate max-w-md mx-auto font-mono text-[10px] text-gray-300 border border-border/30">
                    {generatedSite.url}
                  </div>

                  <div className="w-12 shrink-0" />
                </div>
                
                {/* Iframe Viewport Container */}
                <div className="bg-slate-900 p-6 flex justify-center min-h-[600px] items-start transition-all duration-300">
                  <div 
                    className={`w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 ${
                      previewMode === 'mobile' ? 'max-w-[375px] h-[680px]' : 'max-w-full h-[650px]'
                    }`}
                  >
                    <iframe 
                      key={iframeKey}
                      srcDoc={generatedSite.html_content} 
                      className="w-full h-full border-0" 
                      title="Generated Website Preview"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
