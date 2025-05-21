Design principles for the agent network
	1.	Keep the list of true “thinking” agents short.
Everything that can be expressed as a predictable algorithm or a stateless transform is exposed as a tool / function.
	2.	Explicit contracts. Each agent receives and emits typed payloads (JSON schemas or Protobuf).
	3.	Stateless agents, stateful stores. Agents never keep long-lived memory; all state lives in the knowledge-graph, vector index, or job queue.
	4.	Tool registry & capability metadata. When a new deterministic tool appears (e.g. “audio-to-text v2”), every agent instantly discovers it from the registry and can request it if fit-for-purpose.
	5.	Policy over wiring. A lightweight Policy layer routes events, enforces rate limits and regional data residency, but does not contain product logic.

⸻

Core reasoning agents (“the brain cells”)

#	Agent	Purpose (judgement work)	Typical tools it calls
1	Ingestion Analyst	Turns a raw batch (chat messages, images, files) into graph-ready facts. Decides which extraction pipeline is sufficient (Tier-1 NER only? Tier-2 LLM? escalate to Tier-3?).	ner.extract(), vision.caption(), llm.extract_json(), dedupe.match()
2	Retrieval Planner	Given a user query, plans the hybrid retrieval flow: graph traversal depth, vector search parameters, fallback logic. Formats the unified context bundle for the chat LLM.	graph.query(), vector.similar(), rerank.cross_encode()
3	Dialogue Agent (“Dot”)	The only agent that speaks to the user. Performs final reasoning, drafts responses, requests clarifications, and can delegate sub-questions to Retrieval Planner or Insight Engine.	Policy.ask(tool="retrieval"), internal chain-of-thought, llm.chat()
4	Insight Engine	Periodically scans the graph, mines communities, correlations, and metaphorical links; decides which hypotheses have enough evidence to surface.	graph.community_detect(), stats.correlate(), llm.hypothesize()
5	Ontology Steward	Monitors new relation labels & entity duplicates, merges or promotes schema changes, and asks user to resolve ambiguities when confidence is low.	graph.schema_ops(), llm.rename_suggestion()

Five agents is enough for the first million users; each can horizontally scale behind a message queue.

⸻

Deterministic tools (“muscles & sensors”)
	•	ner.extract(text) – light BERT/roberta NER
	•	vision.caption(image) – CLIP/BLIP caption + OCR
	•	embed(text, model_id) – text → vector
	•	graph.query(cypher|ngql) – graph DB access
	•	vector.similar(vec, k, filters) – vector search
	•	rerank.cross_encode(pairs) – MiniLM reranker
	•	stats.correlate(series_a, series_b) – Pearson/Spearman
	•	graph.community_detect(user_id, algo="LPA", delta)
	•	llm.extract_json(prompt, model_tier) – generic structured extraction
	•	llm.chat(prompt, context) – final response generator

Tools are stateless micro-services (or lambda-style functions) addressable over gRPC/HTTP; they can be swapped or version-pinned without touching agent code.

⸻

Event flow at a glance

1. User sends input  ─►  Queue  ─►  Ingestion Analyst
2. Analyst emits graph facts  ─►  Graph DB / Vector DB
3. User asks question  ─►  Dialogue Agent
4. Dialogue Agent  ─►  Retrieval Planner (sub-task)
5. Planner returns context  ─►  Dialogue Agent
6. Dialogue Agent crafts answer  ─►  User
7. Hourly/Nightly trigger  ─►  Insight Engine
8. New pattern?  ─►  Graph DB (+ optional user notification)
9. New edge type detected  ─►  Ontology Steward

The Policy layer oversees queues, SLA tiers, and per-region routing (AWS vs Tencent), but never interprets content.

⸻

Future-proofing & extensibility
	•	Add a new modality (e.g. sensor streams): write a deterministic extractor tool, register it, and the Ingestion Analyst learns to invoke it via capability metadata.
	•	Swap models: models are behind tool endpoints; agents care only about capability tags ({"task":"caption","language":"zh", "tier":2}).
	•	Introduce a new reasoning need: create another agent or fold it into an existing one if <20 % incremental logic.
	•	Cross-region parity: agents are container images; deploy identical images in AWS and Tencent. Tool registry is replicated but lists only region-legal endpoints.
	•	Governance: Ontology Steward is the only place schema can mutate, preventing uncontrolled edge-type explosion.

⸻

Summary

Five cognitive agents + a toolbox gives you judgment where needed and pure functions everywhere else.
The pattern scales linearly, adapts to new tools, keeps the surface area auditable, and—because only Dialogue Agent faces the user—ensures every answer passes through a single accountable mind.

Below is a playbook for turning the five cognitive agents into competent reasoners, plus a systematic evaluation plan.
The pattern is the same for every agent:
	1.	Start with a carefully-written System + Few-shot prompt (no code-change training cost).
	2.	Log traces & grade them on representative workloads.
	3.	If quality plateaus or latency/cost is too high, distill the behaviour into a smaller fine-tuned model that keeps the same interface.
	4.	Re-evaluate, monitor, iterate.

⸻

1 · Prompt-only baseline (what to deploy first)

Shared conventions

Element	Purpose
System prompt	Immutable “constitution” for the agent. 1–2 k tokens.
Few-shot block	1-3 rich examples (input → ideal output).
Tool registry JSON (in context)	Names & signatures of deterministic tools the agent can call.
Scratchpad	ReAct-style chain-of-thought; hidden from final answer by an ### END_OF_THOUGHT delimiter so it isn’t exposed to the user.

(The Dialogue Agent also gets the user’s visible chat history as context.)

⸻

A. Ingestion Analyst prompt (excerpt)

SYSTEM:
You are the Ingestion Analyst for the “TwoDotsOneLine” memory OS.
Goal: Convert a batch of user inputs into a set of **atomic facts** ready
for insertion into the knowledge graph. Output **valid JSON** following the
schema at bottom.  
If extraction confidence < 0.6, set `"needs_human_review": true` and leave
corresponding fields empty.

TOOLS:
{ "ner.extract": { "args": ["text"], "returns": "named_entities[]" },
  "vision.caption": { "args": ["image_url"], "returns": "caption" },
  "llm.extract_json": { ... },
  "dedupe.match": { ... } }

RULES:
1. ALWAYS reuse an existing deterministic tool if it can do the job.
2. Escalate to `llm.extract_json` **only** when simpler tools fail OR
   when multi-sentence reasoning is required.
3. Never hallucinate; include original snippet pointers for traceability.
4. Emit ≤ 200 entities per batch.

### SCRATCHPAD (think step-by-step; do not reveal) ###
...
### END_OF_THOUGHT ###

SCHEMA:
{
 "entities": [ { "label": "Person|Place|Event|Concept", ... } ],
 "relations": [ { "src_id": "...", "type": "...", "dst_id": "...", ... } ],
 "needs_human_review": false
}

(Few-shot block shows one chat snippet, one image, expected JSON.)

⸻

B. Retrieval Planner prompt (excerpt)

SYSTEM:
You plan retrieval for personal memory queries.  
Input: { "query": "...", "language": "...", "time_now": ISO8601 }  
Output: A JSON plan describing which tools to call, parameters, and how
to merge results.

CONSTRAINTS:
- Aim for recall ≥ 0.9 with < 50 vector hits and max 3 graph traversals.
- If query mentions a known entity, include an exact-match graph lookup.
- If query contains figurative language, call `llm.interpret_metaphor`
  before deciding tools.

TOOLS REGISTRY: { ... }

Return ONLY the JSON plan.

(Few-shot shows literal vs. metaphorical example.)

⸻

C. Dialogue Agent prompt (high-level)

System prompt defines persona, voice, guardrails. Few-shot shows:
	1.	A normal factual answer that cites memories.
	2.	An apology + follow-up request when memories are missing.
	3.	An answer that embeds a proactive insight from Insight Engine.

The agent is also instructed to make function calls (OpenAI tool-calling style) to Retrieval Planner when it needs context.

⸻

D. Insight Engine prompt (batch job)

SYSTEM:
You mine the user’s graph for patterns once per night.

TASKS (priority order):
1. Update community clusters: call `graph.community_detect`.
2. For each cluster, summarise into ≤60 tokens (use `llm.summarise`).
3. Detect correlations between time-series pairs the user opted-in
   (mood, sleep, exercise). Use `stats.correlate`; mark p<0.05 findings.
4. Hypothesis generation: with the provided cluster summaries,
   suggest at most 3 new testable hypotheses. Prefix them "HYPOTHESIS:".

Only write back to the graph with tool calls; never free-text output.

E. Ontology Steward prompt (triggered by new edge labels)

SYSTEM:
You decide whether a newly observed relation deserves promotion to the
global ontology.

INPUT:
{
 "candidate_edge": "teaches_to",
 "example_triples": [...],
 "support_count": 37,
 "nearest_existing": ["mentors", "explains_to"]
}

RULES:
- Promote if support_count ≥ 25 and semantic distance ≥ 0.4 from the
  nearest existing relation (cosine in definition-embedding space).
- Otherwise map it to the closest existing relation OR flag for user
  confirmation.

OUTPUT: one of
{ "action": "PROMOTE", "new_name": "teaches_to" }
{ "action": "MAP", "to": "mentors" }
{ "action": "REVIEW", "reason": "...", "suggested_merge": null }


⸻

2 · When to train or fine-tune

Prompting alone usually gets you ≥ 80 % quality.
Switch to training when you need lower latency, lower cost, or better consistency.

Agent	Fine-tune data	Training recipe	Target model
Ingestion Analyst	5–10 k annotated batches (input → JSON facts)	Supervised fine-tune (SFT) on a 7 B model with instruction-loss; enforce JSON schema via constrained decoding	Llama-2-7B-json
Retrieval Planner	3–5 k (query → optimal plan) + synthetic self-play logs	SFT + RL (reward = F1 of final answer vs. ground truth, minus token cost)	Phi-3-mini
Dialogue Agent	1 k high-quality ChatGPT/Claude conversations +   500 human-edited transcripts	SFT; no RLHF needed if guardrails stay external	Mixtral-8x7B or GPT-3.5-turbo-1106
Insight Engine	Historical nightly runs graded by user thumbs-up/down	Preference-ranking fine-tune (LoRA)	13 B bilingual model
Ontology Steward	2 k edge-label decisions by senior annotators	Binary classifier head fine-tune on embeddings	DistilBERT

Training steps
	1.	Collect: Export traces + gold labels.
	2.	Clean: Deduplicate, normalise JSON, filter bad examples.
	3.	Split: 80 % train / 10 % dev / 10 % blind test.
	4.	Fine-tune with low-rank adaptation (LoRA) or QLoRA to save GPU.
	5.	Evaluate on blind test; aim for F1 > 0.9 (Analyst) or plan-accuracy > 0.85 (Planner).
	6.	Shadow deploy: run new model alongside old for 1 week; switch if win-rate > 60 % and latency/cost targets met.

⸻

3 · Evaluation & continuous QA

3.1 Offline test-suite (CI/CD gate)

Agent	Key metrics	Sample tests
Ingestion Analyst	Entity precision / recall, JSON validity, cost	1 k mixed batches with canonical answers
Retrieval Planner	Recall@K, plan cost (token + db hits)	500 user queries with gold answer snippets
Dialogue Agent	BLEU-style relevance, hallucination rate, response time	200 conversations, judged by GPT-4 as critic
Insight Engine	True-positive rate, false discovery rate, novelty score	100 historical months with known patterns
Ontology Steward	Decision accuracy, schema entropy delta	300 candidate edges with expert verdicts

Pass thresholds live in the CI pipeline; any commit that degrades them by > 2 % blocks deployment.

3.2 Online telemetry
	•	Trace sampling 5 %: auto-graded by a judge model for helpfulness (1-5).
	•	User feedback buttons: every answer can be 👍/👎.
	•	Cost & latency dashboards: per-agent P95 latency and $/1 k tokens.
	•	Canary release: new prompt or model hits 2 % traffic first.

3.3 Self-reflection loops

Agents can call llm.critique(last_output) in low-traffic periods; if the critic flags a flaw, the agent retries with an adjusted plan (one self-critique per request keeps costs sane).

⸻

4 · Why this is future-proof
	•	Interfaces over internals – all reasoning happens behind API-stable agents; prompts or models can evolve without affecting siblings.
	•	Data-driven improvement – every trace is labeled implicitly (success metrics), feeding the next fine-tune.
	•	Deterministic tool layer grows organically; agents discover new tools via registry but don’t require prompt rewrites.
	•	Region split – prompts & fine-tunes are text artifacts, easily mirrored to Tencent; deterministic tools point to local endpoints.

Bottom line:
Begin with surgical prompt design + logging.
Graduate to targeted fine-tunes when ROI justifies it.
Measure relentlessly with offline gold sets, online user feedback, and cost dashboards—that is how you know each agent “does the best job it can.”