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

## 📋 Phase 3: Background & Composite Generation (PLANNED)

**⚠️ CRITICAL:** All asset types MUST implement the same storage sync system as angled_shots (see `docs/STORAGE_SYNC_REQUIREMENTS.md`)

### 3.1 Background Generation
- [ ] Style extraction from category look & feel
- [ ] Background prompt generation
- [ ] Multiple background variations
- [ ] Background library per category
- [ ] **Storage sync:** Google Drive integration
- [ ] **Storage sync:** Database triggers for deletion queue
- [ ] **Storage sync:** Cleanup scripts support
- [ ] **Storage sync:** Thumbnail API URLs

### 3.2 Composite Creation
- [ ] Product + background compositing
- [ ] Multiple composite variations
- [ ] Composites gallery
- [ ] Regeneration options
- [ ] **Storage sync:** Google Drive integration
- [ ] **Storage sync:** Database triggers for deletion queue
- [ ] **Storage sync:** Cleanup scripts support
- [ ] **Storage sync:** Thumbnail API URLs

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

5. **angled_shots** (Phase 2 - COMPLETED)
   - id, product_id, product_image_id, angle_name, description
   - storage_provider ('gdrive' or 'supabase'), storage_path, storage_url
   - gdrive_file_id (Google Drive file ID for fast deletion)
   - prompt_used, created_at

5b. **deletion_queue** (Phase 2 - Storage Sync)
   - id, resource_type, resource_id, user_id
   - storage_provider, storage_path, storage_url, gdrive_file_id
   - status ('pending', 'completed', 'failed')
   - retry_count, max_retries, error_message
   - created_at, processed_at, metadata (JSONB)
   - Triggers: Auto-queues deletions from angled_shots, product_images

6. **backgrounds** (Phase 3)
   - id, category_id, style_name, file_path, prompt_used

7. **composites** (Phase 3)
   - id, product_id, background_id, angled_shot_id, file_path

8. **copy_docs** (Phase 4)
   - id, product_id, copy_text, version, prompt_used

9. **final_assets** (Phase 6)
   - id, composite_id, copy_doc_id, layout_type, file_path

### Storage Systems

**Google Drive** (Primary - Phase 2):
- All images stored in shared Google Drive folder
- Folder: `/AdForge Assets/product-images/{user_id}/{product_id}/`
- Thumbnail API URLs for fast, embeddable images
- Service account with domain-wide delegation
- Automatic folder creation with proper permissions

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
