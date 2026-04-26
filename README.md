MaternaMap
AI-powered maternal emergency resource allocation for NGO planners in India

What It Does
MaternaMap audits 1,180 maternal health facilities across India using AI-powered trust scoring to identify which facilities genuinely have emergency obstetric capability — and which ones only claim to.
89% of facilities claiming emergency OB care in India cannot be verified. 495 facilities are more than 50km from any verified facility. 408 cities have zero verified maternal emergency coverage, including Delhi, Pune, and Bangalore.
MaternaMap helps NGO program officers answer one question: where should we deploy our resources to save the most lives?

How It Works
Data Pipeline (Databricks)

10,000 facility records ingested from the VF Hackathon dataset
LLM extraction (Llama 3.3 70B via Databricks Foundation Models) reads unstructured facility notes and extracts genuine emergency capability signals
Trust Scorer assigns a 0–1 score based on evidence vs. red flags
Haversine distance calculation identifies facilities more than 50/100/200km from verified care
Outputs: map_data_enriched.json, state_planning.json, upgradeable_facilities.json

Resource Planning Agent (Next.js + OpenAI + Tavily)

NGO planners describe their organization, budget, and constraints in natural language
Agent fetches live facility intelligence from Databricks
Agent uses Tavily web search to find real intervention costs, government co-funding schemes, and recent facility news
Agent returns a structured intervention plan with specific named facilities, trust scores, intervention types, and budget allocation
All recommendations cite real data — no invented numbers

Frontend (v0 + Vercel)

Interactive heatmap of India colored by gap rate severity
Zoom in to see individual facility dots colored by trust score
Click any state to filter to regional facilities
Click any facility for full trust score breakdown, evidence, red flags, and tap-to-call
Get Directions opens Google Maps navigation directly


Key Findings
MetricValueFacilities audited1,180Verified capable129 (11%)Confirmed gaps969 (89%)Cities with zero verified coverage408Facilities >50km from verified care495Facilities >100km from verified care268States with 100% gap rate35Avg distance to verified care in Assam300km

Tech Stack
LayerTechnologyData processingDatabricks Free Edition, Python, pandasLLM extractionDatabricks Foundation Models (Llama 3.3 70B)Agent reasoningOpenAI GPT-4o-miniWeb searchTavily APIFrontendNext.js, v0, React-LeafletHostingVercelData storageDatabricks Unity Catalog Volumes

Architecture
10,000 facility records
        ↓
Databricks LLM extraction pipeline
        ↓
Trust scoring + distance calculation
        ↓
Enriched JSON outputs → Databricks Volume
        ↓
Next.js API routes fetch live data
        ↓
OpenAI agent reasons over data
        ↓
Tavily supplements with web intelligence
        ↓
NGO planner receives intervention brief

Running Locally
bashgit clone https://github.com/yourusername/maternamap
cd maternamap
pnpm install
Create .env.local:
DATABRICKS_HOST=your_host
DATABRICKS_TOKEN=your_token
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key
bashpnpm dev
