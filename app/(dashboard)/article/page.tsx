"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle2 } from "lucide-react";

export default function ArticlePage() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 24, paddingBottom: 160, maxWidth: 900, margin: "0 auto" }}>
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "#e8ecf4",
          borderRadius: 24,
          padding: "36px 40px",
          boxShadow: "8px 8px 18px rgba(163,177,198,0.6), -8px -8px 18px rgba(255,255,255,0.95)",
          display: "flex",
          alignItems: "center",
          gap: 30
        }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: "linear-gradient(135deg, #f15a2b, #e14d24)",
          boxShadow: "4px 4px 12px rgba(241,90,43,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <FileText size={40} color="white" />
        </div>
        
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f15a2b", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 8 }}>
            CompileFuture
          </span>
          <h1 style={{
            fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: 32,
            color: "#1e2a3a", margin: 0, marginBottom: 8, letterSpacing: "-0.5px"
          }}>
            0 Jobs to ₹4L/Month: The AI Business That Changed My Life
          </h1>
          <p style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "#636e72", margin: 0
          }}>
            May 29, 2026 · 16 min read
          </p>
        </div>
      </motion.div>

      {/* ── Content ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "#e8ecf4",
          borderRadius: 20,
          boxShadow: "6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.9)",
          padding: "40px",
          fontFamily: "DM Sans, sans-serif",
          color: "#2d3748",
          lineHeight: 1.8,
          fontSize: 16
        }}
      >
        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 0 }}>
          CompileFuture Website Checklist
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {[
            "Create Website with Prompt (give competitor url)",
            "Use (logofa.st) for the logo & favicon",
            "Add Favicon (use real favicon generator)",
            "Website should be mobile responsive",
            "Do SEO with prompt (write about the tool 600 words)",
            "Add FAQ section",
            "Add privacy policy, about us, terms & conditions, contact us pages",
            "Add error pages (404, 500)",
            "robots.txt & sitemap.xml",
            "Add Google Analytics code",
            "Add _headers file for Cloudflare pages"
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <CheckCircle2 size={20} color="#10b981" style={{ marginTop: 4, flexShrink: 0 }} />
              <span>{item}</span>
            </div>
          ))}
        </div>



        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          Prompts
        </h2>

        <div style={{ background: "rgba(255,255,255,0.6)", padding: "20px", borderRadius: 12, marginBottom: 24, border: "1px solid rgba(163,177,198,0.2)" }}>
          <h3 style={{ marginTop: 0, fontFamily: "Nunito", color: "#1e2a3a" }}>Website Creation Prompt</h3>
          <p style={{ fontStyle: "italic", margin: 0, color: "#4a5568" }}>
            I have initialized a new astrojs project, use astro docs mcp and tailwind-4-docs & web-design-guidelines skills for creating the website. Also use @DESIGN.md file and keep the website design like vercel.<br/><br/>
            Name: Real Online Ruler<br/>
            Domain: realonlineruler.com<br/><br/>
            Create an online ruler website that will have ruler on the edges, user can select where to place the ruler. we want these 3 calibration methods<br/>
            Method 1: Auto-Detect Device<br/>
            Method 2: Screen Diagonal<br/>
            Method 3: Credit Card Calibration<br/><br/>
            My competitor website is https://anruler.com/ and it have some features which we need and we need to make a website better than it. Give me ideas how to make it better. go on to this website and check what exactly we need to make. Do not copy design or ui from that website.
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.6)", padding: "20px", borderRadius: 12, marginBottom: 24, border: "1px solid rgba(163,177,198,0.2)" }}>
          <h3 style={{ marginTop: 0, fontFamily: "Nunito", color: "#1e2a3a" }}>SEO Prompt</h3>
          <p style={{ fontStyle: "italic", margin: 0, color: "#4a5568" }}>
            Do the On Page SEO of this Website for<br/><br/>
            Main Keyword: Online Ruler<br/>
            Supporting Keywords: online ruler inches, online ruler in cm, online ruler mm, online ruler cm, free online ruler, online ruler in mm, online ruler camera, mm online ruler, accurate online ruler, 12 inch online ruler, online ruler inches actual size, online ruler to scale, online ruler 12 inch, online ruler tool, online ruler actual size, real online ruler, actual size online ruler<br/><br/>
            these above keywords, also use proper og meta tags for SEO<br/>
            on home page write 600 words about the tool for SEO
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.6)", padding: "20px", borderRadius: 12, marginBottom: 24, border: "1px solid rgba(163,177,198,0.2)" }}>
          <h3 style={{ marginTop: 0, fontFamily: "Nunito", color: "#1e2a3a" }}>FAQ Section Prompt</h3>
          <p style={{ fontStyle: "italic", margin: 0, color: "#4a5568" }}>
            add seo friendly FAQ section for these below questions:<br/><br/>
            Can I use my phone as a ruler?<br/>
            Is there a ruler online?<br/>
            How to identify 1 inch?<br/>
            How to measure cm online?<br/>
            Can a smart phone measure?<br/>
            Can I use my camera as a ruler?<br/>
            Can we measure online?<br/><br/>
            NOTE: Use JSON-LD for FAQ SEO
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.6)", padding: "20px", borderRadius: 12, marginBottom: 24, border: "1px solid rgba(163,177,198,0.2)" }}>
          <h3 style={{ marginTop: 0, fontFamily: "Nunito", color: "#1e2a3a" }}>_headers file</h3>
          <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748" }}>
https://project.pages.dev/*
  X-Robots-Tag: noindex
          </pre>
        </div>

        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          Step 5: Building the Website with AI
        </h2>
        <h3 style={{ fontFamily: "Nunito", color: "#1e2a3a" }}>Installing AstroJS</h3>
        <p>In your VS Code terminal (not the Claude Code terminal — open a separate one):</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>npm create astro@latest .</pre>
        <p>Press Enter for all defaults. Choose the “Basic” template. Say Yes to initialize Git. AstroJS is now installed in your project root.</p>

        <h3 style={{ fontFamily: "Nunito", color: "#1e2a3a" }}>Adding Vercel’s design.md</h3>
        <p>Vercel publishes a design system document that trains AI agents to produce clean, professional UI. Download it:</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>npx shadcn@latest init</pre>
        <p>Or search for “Vercel design.md” on Google and follow the install command in the description. This single file dramatically improves the visual quality of AI-generated websites.</p>

        <h3 style={{ fontFamily: "Nunito", color: "#1e2a3a" }}>Installing AI Skills</h3>
        <p>Claude Code supports “skills” — specialized knowledge packs that guide the AI. Install two:</p>
        <p>1. Web Design Guidelines (for consistent, professional UI):</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>claude mcp add web-design-guidelines</pre>
        <p>2. Tailwind 4 Docs (AI agents know Tailwind v3 well but struggle with v4 — this skill fixes that):</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>claude mcp add tailwind-v4-docs</pre>

        <h3 style={{ fontFamily: "Nunito", color: "#1e2a3a" }}>Adding the Astro JS MCP Server</h3>
        <p>AI agents are trained on older versions of Astro. The Astro JS MCP server gives Claude Code access to the latest Astro documentation in real time:</p>
        <p>Search “Astro JS MCP” on Google → go to the first link → copy the install command → paste it in VS Code terminal.</p>
        <p>This ensures Claude Code writes modern, correct Astro syntax.</p>

        <h3 style={{ fontFamily: "Nunito", color: "#1e2a3a" }}>Writing the Prompt</h3>
        <p>In Claude Code, paste this prompt (adapt it to your tool):</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>
{`I have initialized a new AstroJS project. Use the astro-docs MCP, tailwind-4-docs skill, 
and web-design-guidelines skill. Also use @DESIGN.md. Keep the website design like Vercel.

Name: [Your Tool Name]
Domain: [yourdomain.com]

Create a [describe your tool]. My competitor is [URL] — analyze it, identify its weaknesses, 
and build a better version. Use MPA (multi-page application) architecture for best SEO.`}
        </pre>
        <p>Press Enter. Claude Code will analyze the competitor, generate ideas, and start building your website automatically. It will fix errors as they appear and even run automated tests.</p>

        <h3 style={{ fontFamily: "Nunito", color: "#1e2a3a" }}>Reviewing and Iterating</h3>
        <p>Once done, run:</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>npm run dev</pre>
        <p>Open the local URL in your browser. Test everything. For each issue you find:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Type /clear in Claude Code to start a fresh session (saves token usage)</li>
          <li>Describe the problem precisely</li>
          <li>Claude Code fixes it</li>
        </ul>
        <p>Common additions at this stage:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Dark mode toggle — essential for modern websites</li>
          <li>Mobile responsiveness — test using Chrome DevTools (right-click → Inspect → mobile icon)</li>
          <li>Multiple language support — creates separate URL paths for each language, boosting international SEO</li>
        </ul>
        <p>Keep iterating until your website is clearly better than every competitor on the first page.</p>

        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          Step 6: On-Page SEO Optimization
        </h2>
        <p>Run this SEO prompt in Claude Code after /clear:</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>
{`Do the on-page SEO of this website for:
Main Keyword: [your keyword]
Supporting Keywords: [comma-separated list from Ahrefs]

Also add proper OG meta tags. Write 600 words about the tool on the home page for SEO.`}
        </pre>
        <p>The 600-word section on your home page is critical. Google needs textual content to understand what your page is about. Pure tool pages with no text almost never rank.</p>
        <p>Also ensure:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>{"<title>"} tag contains your primary keyword</li>
          <li>{"<meta description>"} is under 160 characters and contains the keyword</li>
          <li>All images have descriptive alt attributes</li>
          <li>The page URL is clean (e.g., /online-ruler not /page?id=123)</li>
        </ul>

        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          Step 7: Adding an FAQ Section
        </h2>
        <p>The FAQ section serves two purposes:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>It answers questions people are actually searching for — bringing additional long-tail traffic</li>
          <li>Structured FAQ data (JSON-LD) can trigger rich results in Google, increasing your click-through rate significantly</li>
        </ul>
        <p>Prompt for Claude Code:</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>
{`Add an SEO-friendly FAQ section using JSON-LD structured data for these questions:
[paste your questions from Ahrefs "Questions" tab and Google's "People Also Ask"]`}
        </pre>
        <p>Your competitors almost certainly do not have an FAQ section. This alone can tip the ranking in your favor.</p>

        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          Step 8: Required Pages for AdSense Approval
        </h2>
        <p>Google AdSense will reject your site without these four pages. Ask Claude Code to generate them all in one prompt:</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>
{`Create these pages as separate MPA routes for best SEO:
- Privacy Policy
- Terms & Conditions  
- About Us
- Contact Us

Make these pages visible and linked in the home page footer and header. 
This website should be a multi-page application (MPA) for best SEO.`}
        </pre>
        <p>These pages must be clearly accessible from the home page — AdSense reviewers check this.</p>
        <p>Other technical requirements:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Add robots.txt with a sitemap link</li>
          <li>Generate sitemap.xml with all your page URLs</li>
          <li>Add error pages (404, 500) so broken URLs don’t show the default Astro error screen</li>
          <li>Add Google Analytics tracking code</li>
        </ul>
        <p>Google Analytics setup: Go to analytics.google.com → create a property → get your tracking tag → paste it into Claude Code: “Add this Google Analytics code to the site header” → run npm run deploy.</p>
        <p>Commit your changes regularly using VS Code’s Source Control panel (the Git icon). Stage changes, write a commit message (e.g., “added FAQ section”), and commit. This protects your work and lets you roll back if Claude Code introduces a bug.</p>

        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          Step 9: Deploying to Cloudflare Pages
        </h2>
        <p>Login to Cloudflare Wrangler:</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>npx wrangler login</pre>
        <p>Your browser opens — authorize your Cloudflare account.</p>
        <p>Add a deploy command to package.json: Ask Claude Code: “Deploy this website to Cloudflare Pages and add a deploy command to package.json.”</p>
        <p>Claude Code will configure everything. Your site goes live at a *.pages.dev subdomain instantly — for free.</p>
        <p>Cloudflare Pages vs Workers:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Use Pages for static websites (no backend logic) — which applies to all simple micro-tools</li>
          <li>Use Workers if your tool needs server-side logic (database, APIs, authentication)</li>
        </ul>
        <p>For most micro-tools, Cloudflare Pages is the right choice.</p>
        <p>Every future update:</p>
        <pre style={{ margin: 0, padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: 8, overflowX: "auto", fontFamily: "monospace", fontSize: 14, color: "#2d3748", marginBottom: 16 }}>npm run deploy</pre>
        <p>That’s it. All changes go live in seconds.</p>

        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          The Micro-Tool Website Strategy Explained
        </h2>
        <p>
          The concept is simple: find a small, real-world problem → build a focused web tool that solves it → rank it on Google → earn passive income through Google AdSense.
        </p>
        <p>
          These are not SaaS products requiring teams or funding. A “micro-tool” is a single-page utility — an online ruler, a word counter, a percentage calculator, a color picker. Small, focused, and genuinely useful. The process to build one takes 3 to 4 days using AI, not months. And the cost to keep it live? Under ₹1,000 per year (just the domain). Hosting is completely free through Cloudflare.
        </p>
        
        <h3 style={{ fontFamily: "Nunito", color: "#1e2a3a", marginTop: 24 }}>Here’s the plan:</h3>
        <ul style={{ paddingLeft: 20 }}>
          <li>Build one project per month</li>
          <li>In a year, you have 12 live, real-world applications</li>
          <li>Even if only 1–2 go viral and start ranking on Google, you begin earning passive income</li>
          <li>The others still generate traffic, and you can monetize them all with Google AdSense</li>
        </ul>

        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          Why This Is a Win-Win for Everyone
        </h2>
        <p>
          Even if none of your 12 tools go viral (which is unlikely if you follow this guide), you still win. Interviewers today ask for live projects. Not GitHub repos — actual deployed, working applications with real users. Having 12 live projects on your resume puts you in a completely different league from every other candidate.
        </p>

        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          How We Earn: Google AdSense + SEO
        </h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>SEO drives free, organic traffic from Google and Bing</li>
          <li>Google AdSense places relevant ads on your website</li>
          <li>Every time a visitor sees or clicks an ad, you earn revenue</li>
        </ul>
        <p>
          We specifically target US traffic. The reason: the US CPM (cost per thousand impressions) rate is very high. You can earn from 1,000 US visitors as much as you’d earn from a much larger number of Indian visitors.
        </p>

        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          Why AstroJS for SEO-First Websites
        </h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>AstroJS generates pure static HTML by default — the fastest possible output for search engine crawlers</li>
          <li>No JavaScript hydration overhead on pages that don’t need it</li>
          <li>Perfect Core Web Vitals scores out of the box</li>
        </ul>

        <h2 style={{ fontFamily: "Nunito, sans-serif", fontSize: 24, fontWeight: 800, color: "#1e2a3a", marginTop: 40 }}>
          Links
        </h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>Logo & Favicon: <a href="https://logofa.st/" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://logofa.st/</a></li>
          <li>Ahrefs Keyword Generator: <a href="https://ahrefs.com/keyword-generator" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://ahrefs.com/keyword-generator</a></li>
          <li>Domain Search: <a href="https://instantdomainsearch.com/" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://instantdomainsearch.com/</a></li>
          <li>Vercel Design MD: <a href="https://getdesign.md/vercel/design-md" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://getdesign.md/vercel/design-md</a> – npx getdesign@latest add vercel</li>
          <li>Web design guidelines skill: <a href="https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines</a></li>
          <li>Tailwind v4 Docs: <a href="https://www.skills.sh/lombiq/tailwind-agent-skills/tailwind-4-docs" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://www.skills.sh/lombiq/tailwind-agent-skills/tailwind-4-docs</a> or <a href="https://github.com/Lombiq/Tailwind-Agent-Skills" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://github.com/Lombiq/Tailwind-Agent-Skills</a></li>
          <li>AstroJS Docs: <a href="https://docs.astro.build/en/getting-started/" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://docs.astro.build/en/getting-started/</a></li>
          <li>Google Analytics: <a href="https://analytics.google.com" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://analytics.google.com</a></li>
          <li>AstroJS Cloudflare Deploy: <a href="https://docs.astro.build/en/guides/deploy/cloudflare/" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://docs.astro.build/en/guides/deploy/cloudflare/</a></li>
          <li>AstroJS MCP Server: <a href="https://docs.astro.build/en/guides/build-with-ai/#astro-docs-mcp-server" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://docs.astro.build/en/guides/build-with-ai/#astro-docs-mcp-server</a></li>
          <li>Cloudflare: <a href="https://dash.cloudflare.com/login" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://dash.cloudflare.com/login</a></li>
          <li>Google Search Console: <a href="https://search.google.com/search-console/about" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://search.google.com/search-console/about</a></li>
          <li>Bing Webmaster: <a href="https://www.bing.com/webmasters/about" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://www.bing.com/webmasters/about</a></li>
          <li>Google Adsense: <a href="https://adsense.google.com/start/" target="_blank" rel="noreferrer" style={{ color: "#f15a2b", textDecoration: "none" }}>https://adsense.google.com/start/</a></li>
        </ul>

      </motion.div>
    </div>
  );
}
