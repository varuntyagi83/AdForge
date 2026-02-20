# AdForge — AI Ad Creative Pipeline
## Master Plan Document

> **Purpose**: This document is the entry point for Claude Code. Read this first, then read each phase file sequentially. Build each phase completely before moving to the next. Ask the user to commit and push after each phase.

---

## Project Overview

AdForge is an end-to-end AI-powered ad creative generation platform. Users upload product images, generate AI variations (angles, backgrounds), create marketing copy, apply brand guidelines, and export production-ready ads in multiple aspect ratios.

**The entire image pipeline is powered by Nano Banana Pro (Gemini 3 Pro Image — `gemini-3-pro-image-preview`)**. Text/copy generation uses **Claude Sonnet 4.5 via Anthropic API**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router) with TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, Database, Storage, Edge Functions) |
| Image AI | Nano Banana Pro (`gemini-3-pro-image-preview`) via Google Gemini API |
| Text AI | Claude Sonnet 4.5 via Anthropic API |
| State | Zustand for client state |
| File handling | Sharp.js for local image processing where needed |

---

## Supabase Storage Buckets (8 total)

| Bucket | Scope | Purpose |
|--------|-------|---------|
| `brand_assets` | Global (across all categories) | Logos, brand fonts, universal elements |
| `assets` | Per category | Raw product images uploaded by user |
| `angled_shots` | Per category | AI-generated angle variations of products |
| `backgrounds` | Per category | AI-generated backgrounds matching category look & feel |
| `angled_product_background` | Per category | Composites: angled product + background |
| `copy_doc` | Per category | AI-generated marketing copy (hooks, CTAs, text) |
| `guidelines` | Per category | User-uploaded design guidelines, safe zones |
| `final_assets` | Per category | Fully composed creatives (image + text + layout) |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `categories` | Category metadata (name, description, look & feel) |
| `brand_assets` | Brand-level asset metadata (logos, fonts) |
| `products` | Products within a category |
| `product_assets` | Raw product images linked to products |
| `angled_shots` | AI-generated angled shot metadata |
| `backgrounds` | AI-generated background metadata |
| `composites` | Product + background composite metadata |
| `copy_docs` | Generated marketing copy entries |
| `guidelines` | Uploaded guideline metadata |
| `final_assets` | Final composed creative metadata |
| `ad_exports` | Exported ads with aspect ratio info |
| `asset_references` | @ reference lookup table for all assets |

---

## The @ Reference System

Every asset across all buckets gets a unique, human-readable reference ID following this pattern:

```
@{category_slug}/{asset_type}/{descriptive_name}
```

Examples:
- `@greenworld/product/vitamin-d-front`
- `@greenworld/angled/vitamin-d-left-30deg`
- `@greenworld/bg/tropical-leaves-warm`
- `@greenworld/composite/vitamin-d-left-30deg_tropical-leaves`
- `@global/logo/sunday-natural-primary`

The `asset_references` table maps these to actual storage URLs. A searchable dropdown triggers on `@` in any text field.

---

## Phase Execution Order

Read and execute each phase file in order:

1. **`PHASE_0_FOUNDATION.md`** — Project scaffold, Supabase setup, auth, base UI shell
2. **`PHASE_1_CATEGORIES_ASSETS.md`** — Category CRUD, brand assets, product image upload
3. **`PHASE_2_ANGLED_SHOTS.md`** — AI angled shot generation with Nano Banana Pro
4. **`PHASE_3_BACKGROUNDS_COMPOSITES.md`** — AI background generation + product×background compositing
5. **`PHASE_4_COPY_GENERATION.md`** — AI marketing copy generation with Claude
6. **`PHASE_5_GUIDELINES_REFERENCES.md`** — Guideline upload + @ reference system
7. **`PHASE_6_FINAL_COMPOSITES.md`** — Final composite generation (visual + copy + guidelines)
8. **`PHASE_7_AD_EXPORT.md`** — Multi-aspect ratio ad export

---

## Ralph Loop Protocol (Apply Within Each Phase)

Each phase file contains multiple implementation steps. After every significant step:

1. **Context Snapshot**: Save a brief summary of what was built and current state
2. **Validation**: Run the specified tests/checks before proceeding
3. **Commit Point**: Ask user to `git add . && git commit -m "message" && git push`
4. **Reset Point**: If context is getting heavy, summarize state and suggest starting a new Claude Code session with a "Continue from Phase X, Step Y" instruction

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Gemini API (for Nano Banana Pro)
GOOGLE_GEMINI_API_KEY=

# Anthropic API (for Claude copy generation)
ANTHROPIC_API_KEY=
```

---

## Git Strategy

- Branch: `main` for each phase merge
- Commit after each phase step completion
- Tag after each full phase: `v0.1.0` (Phase 0), `v0.2.0` (Phase 1), etc.

---

## BEGIN: Read `PHASE_0_FOUNDATION.md` now.
