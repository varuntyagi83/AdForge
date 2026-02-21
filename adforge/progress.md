# AdForge Development Progress

> Last Updated: February 21, 2026

## 🎯 Project Overview

AdForge is an AI-powered ad creative pipeline that automates the generation of product photography, backgrounds, composites, and marketing copy for e-commerce brands.

**Live URL:** https://ad-forge-opal.vercel.app/

---

## ✅ Phase 0: Foundation & Setup (COMPLETED)

### Database & Infrastructure
- [x] Supabase project setup
- [x] Database schema with RLS policies
- [x] Storage buckets configuration
- [x] Environment variables configuration
- [x] Vercel deployment setup
- [x] Auto-deployment from GitHub (resolved by making repo public)

### Authentication System
- [x] Supabase Auth integration
- [x] Login page with email/password
- [x] Signup page with validation
- [x] Email confirmation callback handler
- [x] Protected route middleware
- [x] Session management
- [x] Redirect flows

### Core UI Framework
- [x] Next.js 14 App Router setup
- [x] Tailwind CSS configuration
- [x] shadcn/ui component library
- [x] Responsive layout structure
- [x] Dark mode support (via system)

---

## ✅ Phase 1: Category & Product Management (COMPLETED ✅ Feb 21, 2026)

### 1.1 Category Management (COMPLETED)
- [x] Categories list page
- [x] Create category dialog
- [x] Category detail page with tabs
- [x] Edit category functionality
- [x] Delete category functionality
- [x] Category slug generation
- [x] Look & Feel field for AI context

**API Endpoints:**
- `GET /api/categories` - List user's categories
- `POST /api/categories` - Create category
- `GET /api/categories/[id]` - Get single category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### 1.2 Brand Assets Management (COMPLETED)
- [x] Brand assets page
- [x] Multi-file upload to Supabase Storage
- [x] Image preview grid
- [x] Delete asset functionality
- [x] Upload progress indicators
- [x] File type validation
- [x] Storage bucket setup

**API Endpoints:**
- `GET /api/brand-assets` - List user's assets
- `POST /api/brand-assets/upload` - Upload files
- `DELETE /api/brand-assets/[id]` - Delete asset

### 1.3 Product Management (COMPLETED)
- [x] Products list within category
- [x] Create product dialog
- [x] Product cards with metadata
- [x] Delete product functionality
- [x] Product slug generation
- [x] Empty states

**API Endpoints:**
- `GET /api/categories/[id]/products` - List products in category
- `POST /api/categories/[id]/products` - Create product
- `GET /api/categories/[id]/products/[productId]` - Get product
- `PUT /api/categories/[id]/products/[productId]` - Update product
- `DELETE /api/categories/[id]/products/[productId]` - Delete product

### 1.4 Multi-Image Upload for Products (COMPLETED ✅ Feb 21, 2026)
- [x] Product image upload interface
- [x] Multiple image handling
- [x] Image preview and management
- [x] Set primary image
- [x] Delete individual images
- [x] Product-specific storage organization

### 1.5 @ Reference Picker Component (COMPLETED ✅ Feb 21, 2026)
- [x] Autocomplete component for @mentions
- [x] Reference brand assets from products
- [x] Reference products from other contexts
- [x] Visual preview of referenced items
- [x] Edit product functionality with reference support

**Components Created:**
- `ReferencePicker` - Rich text input with @ mention autocomplete
- `ReferenceDisplay` - Parses and displays references with previews
- `EditProductDialog` - Edit product with reference picker integration

**API Endpoints:**
- `GET /api/references/search?q=query` - Search brand assets and products for autocomplete

---

## ✅ Phase 2: AI Image Generation - Angled Shots (COMPLETED ✅ Feb 21, 2026)

### 2.1 Google Gemini Integration (COMPLETED)
- [x] Google Gemini 3 Pro Image Preview model integration
- [x] Image-to-image generation capabilities
- [x] Prompt generation for angle variations using look_and_feel
- [x] Error handling and retry logic
- [x] Base64 image encoding for API

### 2.2 Angled Shot Generation (COMPLETED)
- [x] Product selection dropdown
- [x] Product image selection from existing uploads
- [x] 7 predefined angle variations (front, left_30deg, right_30deg, top_45deg, three_quarter_left, three_quarter_right, isometric)
- [x] Custom angle selection (checkboxes)
- [x] Generate button with loading states
- [x] Preview generated angles in grid
- [x] Save individual angles
- [x] AI-powered generation using Gemini

### 2.3 Google Drive Migration (COMPLETED ✅ Feb 21, 2026)
- [x] Google Drive API integration
- [x] Service account setup and authentication
- [x] Storage adapter architecture (pluggable storage system)
- [x] Migrated from Supabase Storage to Google Drive
- [x] Folder structure: `/AdForge Assets/product-images/user-id/product-id/`
- [x] Automatic folder creation with proper permissions
- [x] File metadata tracking (gdrive_file_id, storage_url, storage_provider)
- [x] Thumbnail API URLs for proper image display
- [x] Removed 8 unused Supabase Storage buckets

**Storage Adapter:**
- `GoogleDriveAdapter` - Complete Drive integration
- `deleteFile()` - Multi-storage deletion support
- `uploadFile()` - Abstracted upload interface

### 2.4 Storage Sync System (COMPLETED ✅ Feb 21, 2026)
- [x] 3-layer sync architecture
- [x] Database triggers for automatic cleanup queueing
- [x] Deletion queue table with retry logic
- [x] Cron job for processing deletion queue (every 5 minutes)
- [x] Reconciliation API for manual sync
- [x] Cleanup scripts for trashed file metadata
- [x] Migration 006 - Deletion queue and triggers

**Deletion Scenarios Covered:**
1. UI Delete → Both Drive & DB deleted immediately ✅
2. Manual Drive Delete → Run reconciliation API ⚠️
3. Drive Trash → Run cleanup script 🗑️
4. Manual DB Delete → Queued for Drive deletion 🔄

**Cleanup Tools:**
- `scripts/cleanup-orphaned-local.ts` - Direct DB/Drive cleanup
- `scripts/cleanup-orphaned-metadata.ts` - API-based cleanup
- `/api/admin/cleanup-orphaned-metadata` - Admin endpoint
- `/api/admin/process-deletion-queue` - Cron endpoint

### 2.5 UI Improvements (COMPLETED ✅ Feb 21, 2026)
- [x] Angled shots display with AngledShotCard component
- [x] AngledShotsList with product filtering
- [x] Real category counts (products & angled shots)
- [x] Fixed image loading states
- [x] Download and view full size functionality
- [x] Proper Google Drive thumbnail URLs
- [x] Removed "Coming in Phase 2" placeholders

**API Endpoints:**
- `POST /api/categories/[id]/angled-shots/generate` - Generate angles using AI
- `GET /api/categories/[id]/angled-shots` - List angled shots (with product filter)
- `POST /api/categories/[id]/angled-shots` - Save generated angle
- `DELETE /api/categories/[id]/angled-shots/[angleId]` - Delete angle (synced deletion)
- `POST /api/categories/[id]/angled-shots/sync` - Reconciliation API
- `POST /api/admin/cleanup-orphaned-metadata` - Cleanup trashed files
- `POST /api/admin/process-deletion-queue` - Process deletion queue

**Components Created:**
- `AngledShotCard` - Individual shot display with actions
- `AngledShotsList` - Gallery view with filtering
- `generateAngledShots()` - Gemini integration
- `GoogleDriveAdapter` - Storage abstraction

---

## ✅ Phase 3: Background & Composite Generation (COMPLETED ✅ Feb 21, 2026)

**⚠️ CRITICAL:** All asset types MUST implement the same storage sync system as angled_shots (see `docs/STORAGE_SYNC_REQUIREMENTS.md`)

### 3.1 Database & Backend (COMPLETED ✅)
- [x] Migration 009 - backgrounds table with full storage sync
- [x] Migration 010 - composites table with full storage sync
- [x] Migration 011 - angled_shots storage sync fields (gdrive support)
- [x] Google Drive folder structure fixes (human-readable names)
- [x] Frontend image display fixes (use API public_url)
- [x] Cleanup scripts updated for new tables

### 3.2 Background Generation Backend (COMPLETED ✅ Feb 21, 2026)
- [x] `generateBackgrounds()` AI function in gemini.ts
- [x] Category look_and_feel integration
- [x] Support for style reference images
- [x] Multiple background variations (customizable count)
- [x] **Storage sync:** Google Drive integration ✅
- [x] **Storage sync:** Database triggers for deletion queue ✅
- [x] **Storage sync:** Cleanup scripts support ✅
- [x] **Storage sync:** Thumbnail API URLs ✅

**API Endpoints:**
- `POST /api/categories/[id]/backgrounds/generate` - Generate backgrounds using Gemini AI
- `GET /api/categories/[id]/backgrounds` - List backgrounds for category
- `POST /api/categories/[id]/backgrounds` - Save generated background to Google Drive
- `DELETE /api/categories/[id]/backgrounds/[backgroundId]` - Delete background (synced deletion)

### 3.3 Background Generation UI (COMPLETED ✅ Feb 21, 2026)
- [x] Background generation page/tab
- [x] **Look & Feel textarea** with category default value
- [x] User prompt textarea for specific background description
- [x] Background count slider (1-4 variations)
- [x] Generate button with loading states
- [x] Preview grid for generated backgrounds
- [x] Save individual backgrounds with custom naming
- [x] Save all backgrounds batch action
- [x] Backgrounds gallery with search and filters
- [x] Download individual backgrounds
- [x] Delete backgrounds (synced deletion)
- [x] Real-time count updates in category tabs

**Components Created:**
- `BackgroundGenerationWorkspace` - Main workspace with tabs
- `BackgroundGenerationForm` - Form with Look & Feel + User Prompt inputs
- `BackgroundPreviewGrid` - Preview and save generated backgrounds
- `BackgroundGallery` - Display saved backgrounds with actions

**Key Features:**
- **Look & Feel Integration:** Pre-populated from category, editable per generation
- Character limits: 500 chars for look & feel, 300 for user prompt
- Batch operations: Save all, discard all
- Inline prompt display for each generated background
- Empty states with helpful messaging
- Toast notifications for all actions

**E2E Test Results (Feb 21, 2026):**
- ✅ All 7 tests passed
- ✅ Category look_and_feel field verified
- ✅ Backgrounds table schema correct (all storage sync fields present)
- ✅ API endpoints accessible (GET /api/categories/[id]/backgrounds)
- ✅ All 4 UI components exist and integrated
- ✅ Google Drive integration verified (1 background in greenworld)
- ✅ UI successfully integrated into category page
- 📝 Test script: `scripts/test-background-ui.ts`

### 3.4 Composite Creation Backend (COMPLETED ✅ Feb 21, 2026)
- [x] `generateComposite()` AI function in gemini.ts
- [x] Product × background intelligent compositing with Gemini
- [x] Multi-image input support (product + background)
- [x] Preserves product appearance (labels, branding, colors)
- [x] Preserves background scene elements (models, props)
- [x] Natural lighting and shadow integration
- [x] Optional user placement instructions
- [x] **Storage sync:** Google Drive integration ✅
- [x] **Storage sync:** Database triggers for deletion queue ✅
- [x] **Storage sync:** Cleanup scripts support ✅
- [x] **Storage sync:** Thumbnail API URLs ✅
- [x] Two generation modes: "All Combinations" & "Selected Pairs"
- [x] Batch processing with 50-composite limit
- [x] Links angled_shot_id + background_id in database

**API Endpoints:**
- `POST /api/categories/[id]/composites/generate` - Generate composites (all or selected pairs)
- `GET /api/categories/[id]/composites` - List composites with related data (joins)
- `POST /api/categories/[id]/composites` - Save generated composite to Google Drive
- `DELETE /api/categories/[id]/composites/[compositeId]` - Delete composite (synced deletion)

**Key Implementation Details:**
- Gemini prompt engineered to preserve asset integrity while creating natural compositions
- Temperature: 0.4 (lower for precise compositing vs. 0.7 for creative backgrounds)
- Downloads images from Google Drive for compositing (supports both gdrive and Supabase storage)
- Auto-generates composite names: "{angled_shot_name} on {background_name}"
- Validates that both angled shot and background belong to the category

### 3.5 Composite Creation UI (COMPLETED ✅ Feb 21, 2026)
- [x] Composite generation workspace in category page
- [x] **Mode selection:** "All Combinations" or "Select Specific Pairs"
- [x] Angled shot multi-select with checkboxes
- [x] Background multi-select with checkboxes
- [x] Optional placement instructions textarea (200 chars)
- [x] Real-time combination calculator
- [x] Warning for large batches (>20 composites)
- [x] Hard limit enforcement (50 composites max)
- [x] Generate button with loading states
- [x] Preview grid for generated composites
- [x] Save individual composites with custom naming
- [x] Save all composites batch action
- [x] Download composites without saving
- [x] Composites gallery with source info
- [x] Shows angled shot + background names for each composite
- [x] Delete composites (synced deletion)
- [x] Real-time count updates in category tabs

**Components Created:**
- `CompositeWorkspace` - Main workspace container
- `CompositeGenerationForm` - Mode selection, asset picker, and generation controls
- `CompositePreviewGrid` - Preview and save generated composites
- `CompositeGallery` - Display saved composites with source metadata

**Key Features:**
- Smart defaults: "Selected Pairs" mode recommended to avoid accidentally generating too many
- Asset availability checking: Shows "No angled shots" or "No backgrounds" warnings
- Combination preview: "{X} shots × {Y} backgrounds = {Z} composites"
- Individual save dialog with name customization
- Batch save with auto-generated names
- Gallery shows relationships: Which shot + which background = this composite
- Empty states with helpful next-step messaging
- Toast notifications for all actions

**E2E Test Results (Feb 21, 2026):**
- ✅ All 9 tests passed
- ✅ Composites table schema correct (all storage sync fields present)
- ⚠️  0 angled shots available (need to generate some first)
- ✅ 1 background available
- ⚠️  Need both angled shots and backgrounds to generate composites
- ✅ API endpoints accessible (GET /api/categories/[id]/composites)
- ✅ All 4 UI components exist and integrated
- ✅ generateComposite function implemented in gemini.ts
- ✅ UI successfully integrated into category page
- 📝 Test script: `scripts/test-composite-generation.ts`

**Next Steps to Use:**
1. Generate some angled shots first in the "Angled Shots" tab
2. Ensure backgrounds exist in the "Backgrounds" tab
3. Navigate to "Composites" tab
4. Select generation mode and assets
5. Add optional placement instructions (e.g., "Place product in model's hands")
6. Generate and save composites

---

## 📋 Phase 4: Copy Generation with GPT-4o (PLANNED)

**⚠️ CRITICAL:** All asset types MUST implement the same storage sync system (see `docs/STORAGE_SYNC_REQUIREMENTS.md`)

### 4.1 OpenAI Integration
- [ ] GPT-4o API setup
- [ ] Marketing copy generation
- [ ] Multiple copy variations
- [ ] Copy templates

### 4.2 Copy Management
- [ ] Copy library per product
- [ ] Edit and refine copy
- [ ] Version history
- [ ] Export copy
- [ ] **Storage sync:** If copy stored as files, implement full sync
- [ ] **Storage sync:** Database triggers for deletion queue
- [ ] **Storage sync:** Cleanup scripts support

---

## 📋 Phase 5: Design Guidelines & Safe Zones (PLANNED)

**⚠️ CRITICAL:** All asset types MUST implement the same storage sync system (see `docs/STORAGE_SYNC_REQUIREMENTS.md`)

### 5.1 Guidelines Upload
- [ ] PDF/image upload for guidelines
- [ ] Parse safe zones
- [ ] Store guideline specs
- [ ] **Storage sync:** Google Drive integration
- [ ] **Storage sync:** Database triggers for deletion queue
- [ ] **Storage sync:** Cleanup scripts support
- [ ] **Storage sync:** Thumbnail API URLs for image guidelines

### 5.2 Safe Zone Application
- [ ] Apply safe zones to composites
- [ ] Visual safe zone overlay
- [ ] Validation against guidelines

---

## 📋 Phase 6: Final Asset Assembly (PLANNED)

**⚠️ CRITICAL:** All asset types MUST implement the same storage sync system (see `docs/STORAGE_SYNC_REQUIREMENTS.md`)

### 6.1 Asset Combination
- [ ] Combine all elements (image + copy + guidelines)
- [ ] Preview final creatives
- [ ] Multiple layout options
- [ ] Final asset library
- [ ] **Storage sync:** Google Drive integration
- [ ] **Storage sync:** Database triggers for deletion queue
- [ ] **Storage sync:** Cleanup scripts support
- [ ] **Storage sync:** Thumbnail API URLs

---

## 📋 Phase 7: Export & Ad Formats (PLANNED)

### 7.1 Multi-Format Export
- [ ] Export in multiple aspect ratios (1:1, 4:5, 16:9, 9:16)
- [ ] Platform-specific formats (FB, IG, Google Ads)
- [ ] Bulk export functionality
- [ ] Download as ZIP

---

## 🐛 Issues Resolved

### Critical Issues
1. **Dynamic Route Naming Conflict** (Fixed: Feb 21, 2026)
   - Problem: Mixed usage of `[id]` and `[categoryId]` caused build errors
   - Solution: Standardized to `[id]` for categories, `[productId]` for products
   - Commit: `a02da33`

2. **Email Confirmation 404 Error** (Fixed: Feb 21, 2026)
   - Problem: Missing callback handler for email verification
   - Solution: Created `/auth/callback` route handler
   - Commit: `2214bdd`

3. **Build Error - useSearchParams** (Fixed: Feb 21, 2026)
   - Problem: `useSearchParams()` not wrapped in Suspense boundary
   - Solution: Wrapped LoginForm in Suspense component
   - Commit: `b48d0c6`

4. **Vercel Auto-Deploy Not Working** (Fixed: Feb 21, 2026)
   - Problem: Private repo not triggering deployments
   - Solution: Made repository public
   - Status: ✅ Auto-deployment now working

### Storage & Sync Issues (Fixed: Feb 21, 2026)
5. **UI Showing "Coming in Phase 2"** (Fixed: Commit `f0af9d5`)
   - Problem: No UI for viewing generated angled shots
   - Solution: Created AngledShotCard and AngledShotsList components

6. **Storage Sync Inconsistency** (Fixed: Commit `9ed5440`)
   - Problem: Deletions in one system (UI/Drive/Supabase) not synced across all
   - Solution: Implemented 3-layer sync system with deletion queue and triggers

7. **Images Stuck on "Loading..." - Bucket Not Found** (Fixed: Commit `6d9a3ca`)
   - Problem: GET endpoint generating Supabase Storage URLs for Drive files
   - Solution: Check storage_provider and use storage_url from database

8. **Category Counts Showing Zero** (Fixed: Commit `dac72c4`)
   - Problem: CategoryCard had hardcoded "0 products" and "0 assets"
   - Solution: Added count fetching to GET /api/categories endpoint

9. **Images Downloading Instead of Displaying** (Fixed: Commit `6c95277`)
   - Problem: Google Drive URLs using export=download format
   - Solution: Changed to thumbnail API format (`/thumbnail?id={ID}&sz=w2000`)
   - Fixed 42 existing database records with script

10. **Orphaned Metadata After Trash** (Fixed: Commit `0978f60`)
    - Problem: Files in Google Drive trash still had Supabase metadata
    - Solution: Created cleanup scripts and API endpoint
    - Result: Successfully cleaned 28 orphaned records

11. **Google Drive UUID Folders Instead of Human-Readable Names** (Fixed: Feb 21, 2026)
    - Problem: Files stored in UUID-named folders (e.g., `00d3f3b1-9da5-44ac-b5b1-fcbd50039273`)
    - Solution: Implemented slug-based folder structure
    - Before: `product-images/gummy-bear-test/{UUID}/angled-shots/`
    - After: `gummy-bear/vitamin-c-gummies/product-images/vitamin-c-gummies-angled-shots/`
    - Result: All 7 angled shots reorganized, human-readable folder names
    - Scripts: `fix-gdrive-folder-structure.ts`, `reorganize-gdrive-structure.ts`
    - Commits: `dd5b12a`, `caad33d`

12. **Frontend Images Not Displaying from Google Drive** (Fixed: Feb 21, 2026)
    - Problem: Frontend components ignored `public_url` from API, generated wrong Supabase URLs
    - Root Cause: `ProductImageGallery` and `ProductCard` bypassed API and generated own URLs
    - Solution: Components now use `public_url` field from API response
    - Fixed Components: `ProductImageGallery.tsx`, `ProductCard.tsx`
    - Added: Error handlers with fallback placeholders
    - Verified: All 8 files have correct Google Drive permissions (200 OK)
    - Commit: `81d2b83`

### Configuration Issues
1. **Root Page Redirect** (Fixed: Feb 20, 2026)
   - Moved redirect from component to `next.config.ts`
   - Prevents static generation errors

2. **Middleware Deprecation Warning**
   - Status: ⚠️ Warning present but not critical
   - Next.js recommends migration to "proxy" convention
   - Action: Can address in future optimization phase

---

## 🧪 Testing Status

### Manual Testing (Completed: Feb 21, 2026)
- ✅ Authentication flow - redirects working correctly
- ✅ Login page - rendering with proper form elements
- ✅ Signup page - working with email confirmation
- ✅ Protected routes - middleware protecting dashboard
- ✅ Category CRUD - all operations verified
- ✅ Brand assets - upload and delete working
- ✅ Product CRUD - all operations verified

### Automated Testing
- [ ] E2E tests for critical flows
- [ ] API endpoint tests
- [ ] Component tests

---

## 🔧 Technical Stack

### Frontend
- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **State:** React Hooks
- **Notifications:** Sonner (toast)

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Google Drive (via Service Account)
- **API:** Next.js API Routes
- **Cron Jobs:** Vercel Cron (deletion queue processing)

### AI Services
- **Image Generation:** Google Gemini 3 Pro Image Preview (image-to-image)
- **Copy Generation:** OpenAI GPT-4o (Planned - Phase 4)

### Deployment
- **Platform:** Vercel
- **Domain:** ad-forge-opal.vercel.app
- **CI/CD:** Automatic deployment from GitHub main branch

---

## 📊 Database Schema

### Tables
1. **categories**
   - id, user_id, name, slug, description, look_and_feel
   - RLS: Users can only access their own categories

2. **products**
   - id, category_id, name, slug, description
   - RLS: Users can only access products in their categories

3. **brand_assets**
   - id, user_id, file_name, file_path, file_size, mime_type
   - RLS: Users can only access their own assets

4. **product_images**
   - id, product_id, file_name, file_path, file_size, is_primary
   - RLS: Users can only access images for their products

5. **angled_shots** (Phase 2 - COMPLETED, Updated Phase 3)
   - id, product_id, product_image_id, category_id, user_id
   - angle_name, angle_description, prompt_used
   - storage_provider ('gdrive' or 'supabase'), storage_path, storage_url
   - gdrive_file_id (Google Drive file ID for fast deletion)
   - metadata (JSONB), created_at
   - Migration 011: Added storage sync fields

5b. **deletion_queue** (Phase 2 - Storage Sync)
   - id, resource_type, resource_id, user_id
   - storage_provider, storage_path, storage_url, gdrive_file_id
   - status ('pending', 'completed', 'failed')
   - retry_count, max_retries, error_message
   - created_at, processed_at, metadata (JSONB)
   - Triggers: Auto-queues deletions from angled_shots, product_images, backgrounds, composites

6. **backgrounds** (Phase 3 - COMPLETED)
   - id, category_id, user_id, name, slug, description
   - prompt_used
   - storage_provider ('gdrive'), storage_path, storage_url
   - gdrive_file_id (Google Drive file ID for fast deletion)
   - metadata (JSONB), created_at
   - Migration 009: Full storage sync implementation

7. **composites** (Phase 3 - SCHEMA READY, NOT USED)
   - id, category_id, product_id, angled_shot_id, background_id, user_id
   - storage_provider ('gdrive'), storage_path, storage_url
   - gdrive_file_id (Google Drive file ID for fast deletion)
   - metadata (JSONB), created_at
   - UNIQUE(angled_shot_id, background_id) - prevents duplicates
   - Migration 010: Full storage sync implementation

8. **copy_docs** (Phase 4)
   - id, product_id, copy_text, version, prompt_used

9. **final_assets** (Phase 6)
   - id, composite_id, copy_doc_id, layout_type, file_path

### Storage Systems

**Google Drive** (Primary - Phase 2 & 3):
- All images stored in AdForge Shared Drive
- **Human-Readable Folder Structure** (NOT UUIDs):
  ```
  AdForge Shared Drive/
  └── {category-slug}/                              (e.g., gummy-bear)
      └── {product-slug}/                           (e.g., vitamin-c-gummies)
          └── product-images/                       (container)
              ├── {image-filename}.jpg              (original uploads)
              └── {image-name}-angled-shots/        (AI variations per image)
                  ├── left_30deg_{timestamp}.jpg
                  └── ...
  ```
- **Path Examples:**
  - Original: `gummy-bear/vitamin-c-gummies/product-images/vitamin-c-gummies.jpg`
  - Angled: `gummy-bear/vitamin-c-gummies/product-images/vitamin-c-gummies-angled-shots/left_30deg.jpg`
  - Background: `gummy-bear/backgrounds/tropical-warm.jpg`
- Thumbnail API URLs: `https://drive.google.com/thumbnail?id={FILE_ID}&sz=w2000`
- Service account with domain-wide delegation
- Automatic folder creation with proper permissions
- All files have public "anyone with link" permissions

**Supabase Storage** (Legacy - Removed):
- ❌ 8 unused buckets removed (brand-assets, product-images, angled-shots, etc.)
- Database now stores Google Drive URLs and file IDs
- storage_provider field tracks which system stores each file

**Database Fields for Storage:**
- `storage_provider`: 'gdrive' or 'supabase'
- `storage_path`: File path in storage system
- `storage_url`: Public URL (Google Drive thumbnail API)
- `gdrive_file_id`: Drive file ID for deletion/updates

---

## 🚀 Next Steps

### Immediate (Storage Sync for Existing Assets)
1. **Apply storage sync to product_images**
   - Add storage fields (provider, path, url, gdrive_file_id)
   - Update DELETE endpoint to sync with Google Drive
   - Create database trigger for deletion queue
   - Update cleanup scripts
2. **Apply storage sync to brand_assets**
   - Add storage fields
   - Update DELETE endpoint
   - Create database trigger
   - Update cleanup scripts

### Phase 3-7 Requirements
- **EVERY new asset type MUST:**
  - Follow `docs/STORAGE_SYNC_REQUIREMENTS.md`
  - Implement 3-layer sync (UI ↔ Supabase ↔ Google Drive)
  - Support all 4 deletion scenarios
  - Include cleanup script support

### Short Term (Phase 2 - Next 1-2 weeks)
1. Set up Google Gemini API integration
2. Implement angled shot generation
3. Create preview and selection interface
4. Build angled shots gallery

### Medium Term (Phases 3-4)
1. Background generation system
2. Composite creation pipeline
3. GPT-4o copy generation
4. Copy management interface

### Long Term (Phases 5-7)
1. Guidelines and safe zones
2. Final asset assembly
3. Multi-format export
4. Bulk operations

---

## 📝 Notes

### General
- Repository is now public for automatic Vercel deployments
- Supabase redirect URLs configured for both local and production
- All RLS policies tested and working
- Product CRUD uses consistent naming: `[id]` for category, `[productId]` for product
- Email confirmation flow fully functional

### Storage & Sync (Feb 21, 2026)
- **Migrated to Google Drive** - All new images stored in Drive
- **Cleanup System** - Run `npx tsx scripts/cleanup-orphaned-local.ts --execute` weekly
- **Deletion Queue** - Automatic cleanup via cron job every 5 minutes
- **Storage Adapter Pattern** - Pluggable storage system for future flexibility
- **28 Orphaned Records Cleaned** - First successful cleanup run removed trashed file metadata
- **CRON_SECRET** - Set in Vercel env vars: `450b64484cf23ccc927f8a2354fb5b78ba120f9f48b1c448887283bc6ac08eb0`

### Documentation
- Complete storage sync documentation in `docs/STORAGE_SYNC.md`
- Updated README with cleanup instructions
- All deletion scenarios documented with test procedures

---

## 🤝 Contributing

This is a solo project developed with AI assistance (Claude).

For questions or issues, check the commit history or deployment logs.
