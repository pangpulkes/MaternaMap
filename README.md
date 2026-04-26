MaternaMap
AI-powered maternal emergency resource allocation for NGO planners in India

What It Does
MaternaMap audits 1,180 maternal health facilities across India using AI-powered trust scoring to identify which facilities genuinely have emergency obstetric capability and which ones only claim to.
89% of facilities claiming emergency OB care in India cannot be verified. 495 facilities are more than 50km from any verified facility. 408 cities have zero verified maternal emergency coverage, including Delhi, Pune, and Bangalore.
MaternaMap helps NGO program officers answer one question: where should we deploy our resources to save the most lives?

How It Works
Data Pipeline runs on Databricks. 10,000 facility records are ingested from the VF Hackathon dataset. LLM extraction using Llama 3.3 70B via Databricks Foundation Models reads unstructured facility notes and extracts genuine emergency capability signals. A Trust Scorer assigns a 0-1 score based on evidence vs red flags. Haversine distance calculation identifies facilities more than 50, 100, and 200km from verified care. Outputs are map_data_enriched.json, state_planning.json, and upgradeable_facilities.json.

The Resource Planning Agent is built with Next.js, OpenAI, and Tavily. NGO planners describe their organization, budget, and constraints in natural language. The agent fetches live facility intelligence from Databricks, uses Tavily web search to find real intervention costs and government co-funding schemes, and returns a structured intervention plan with specific named facilities, trust scores, intervention types, and budget allocation.

The Frontend is built with v0 and deployed on Vercel. It includes an interactive heatmap of India colored by gap rate severity, individual facility dots colored by trust score when zoomed in, state filtering, facility detail panels with trust score breakdown and tap-to-call, and Google Maps directions integration.

Key Findings
Facilities audited: 1,180. Verified capable: 129 (11%). Confirmed gaps: 969 (89%). Cities with zero verified coverage: 408. Facilities more than 50km from verified care: 495. Facilities more than 100km from verified care: 268. States with 100% gap rate: 35. Average distance to verified care in Assam: 300km.

Tech Stack
Data processing: Databricks Free Edition, Python, pandas. LLM extraction: Databricks Foundation Models Llama 3.3 70B. Agent reasoning: OpenAI GPT-4o-mini. Web search: Tavily API. Frontend: Next.js, v0, React-Leaflet. Hosting: Vercel. Data storage: Databricks Unity Catalog Volumes.

Architecture
10,000 facility records flow into the Databricks LLM extraction pipeline, then through trust scoring and distance calculation, producing enriched JSON outputs stored in Databricks Volumes. Next.js API routes fetch this live data. The OpenAI agent reasons over the data while Tavily supplements with web intelligence. The NGO planner receives a structured intervention brief.

Running Locally
Clone the repo and run pnpm install. Create a .env.local file with DATABRICKS_HOST, DATABRICKS_TOKEN, OPENAI_API_KEY, and TAVILY_API_KEY set to your values. Then run pnpm dev.
