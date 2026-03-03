# 📊 Complete Audit: Supabase Storage References

## Summary

**Goal:** Ensure all code uses Google Drive for file storage (per STORAGE_HIERARCHY.md) with Supabase only storing metadata.

**Status:** ✅ ALL REFERENCES UPDATED

---

## Storage Strategy

### ✅ Google Drive (Primary)
All AdForge assets are stored in Google Drive Shared Drive:
- Product images (angled shots)
- Category-specific guidelines
- Templates
- Backgrounds
- Copy docs
- Composites
- Final assets

**Path:** `AdForge Storage/{category-slug}/{asset-type}/...`

### 📦 Supabase Storage (Limited Use)
Only used for:
- Brand Assets (global, user-level assets)
- Not category-specific

---

## Files Reviewed and Updated

### ✅ Already Correct (No Changes Needed)

#### 1. **Product Images GET**
**File:** `src/app/api/categories/[id]/products/[productId]/images/route.ts`
- **Lines 53-61:** Already checks `storage_provider === 'gdrive'`
- Uses `storage_url` from database for Google Drive files
- Falls back to Supabase Storage for legacy files
- **Status:** ✅ Perfect

#### 2. **Angled Shots GET**
**File:** `src/app/api/categories/[id]/angled-shots/route.ts`
- **Lines 87-95:** Already checks `storage_provider === 'gdrive'`
- Uses `storage_url` from database
- **Status:** ✅ Perfect

#### 3. **Angled Shots Generate**
**File:** `src/app/api/categories/[id]/angled-shots/generate/route.ts`
- **Lines 89-123:** Already handles Google Drive downloads
- Checks `storage_provider` and downloads from correct source
- **Status:** ✅ Fixed earlier in session

#### 4. **Angled Shots Upload (POST)**
**File:** `src/app/api/categories/[id]/angled-shots/route.ts`
- **Line 229:** Uses correct Google Drive path with `/product-images/`
- **Status:** ✅ Fixed earlier in session

#### 5. **Guidelines**
**File:** `src/app/api/categories/[id]/guidelines/route.ts`
- **Line 148:** Correct path: `{category-slug}/guidelines/...`
- **Lines 152-155:** Uses Google Drive via `uploadFile()`
- **Status:** ✅ Perfect

---

### ✅ Updated in This Session

#### 6. **References Search API**
**File:** `src/app/api/references/search/route.ts`

**Before:**
```typescript
.select('id, file_name, file_path, mime_type')
// ...
preview: supabase.storage.from('brand-assets').getPublicUrl(asset.file_path).data.publicUrl
```

**After:**
```typescript
.select('id, file_name, file_path, mime_type, storage_url, storage_path')
// ...
preview: asset.storage_url ||
  supabase.storage.from('brand-assets').getPublicUrl(asset.storage_path || asset.file_path).data.publicUrl
```

**Changes:**
- Line 24: Added `storage_url, storage_path` to SELECT
- Lines 37-44: Use stored `storage_url` if available

**Status:** ✅ Fixed

---

#### 7. **Reference Display Component**
**File:** `src/components/ui/reference-display.tsx`

**Before:**
```typescript
.select('id, file_name, file_path, mime_type')
// ...
preview: supabase.storage.from('brand-assets').getPublicUrl(data.file_path).data.publicUrl
```

**After:**
```typescript
.select('id, file_name, file_path, mime_type, storage_url, storage_path')
// ...
const preview = data.storage_url ||
  supabase.storage.from('brand-assets').getPublicUrl(data.storage_path || data.file_path).data.publicUrl
```

**Changes:**
- Line 92: Added `storage_url, storage_path` to SELECT
- Lines 97-102: Use stored `storage_url` if available

**Status:** ✅ Fixed

---

### 📦 Supabase Storage (Intentionally Kept)

#### 8. **Brand Assets API**
**File:** `src/app/api/brand-assets/route.ts`
- **Purpose:** Global (user-level) brand assets
- **NOT category-specific**
- Different from category Guidelines
- Uses Supabase Storage bucket `'brand-assets'`
- **Status:** ✅ Intentionally using Supabase Storage (correct for this use case)

**Functions:**
- Line 66-71: Upload to Supabase Storage
- Line 78-80: Get public URL
- Line 102: Delete from Supabase Storage

**Reason:** Brand assets are global resources not tied to categories, stored separately from category-specific Google Drive hierarchy.

---

### 📂 Storage Adapter (Generic)

#### 9. **Supabase Adapter**
**File:** `src/lib/storage/supabase-adapter.ts`
- **Purpose:** Generic adapter for Supabase Storage
- Used when `provider: 'supabase'` is explicitly specified
- **Status:** ✅ Correct (part of storage abstraction layer)

**Note:** This is a generic adapter. The important thing is that calling code uses `provider: 'gdrive'` for AdForge assets.

---

## Complete Storage Reference Map

| File | Line | Type | Storage | Status |
|------|------|------|---------|--------|
| `categories/[id]/products/[productId]/images/route.ts` | 53-61 | GET | Google Drive (fallback: Supabase) | ✅ Correct |
| `categories/[id]/angled-shots/route.ts` | 87-95 | GET | Google Drive (fallback: Supabase) | ✅ Correct |
| `categories/[id]/angled-shots/route.ts` | 229 | POST | Google Drive | ✅ Fixed |
| `categories/[id]/angled-shots/generate/route.ts` | 89-123 | Download | Google Drive (fallback: Supabase) | ✅ Fixed |
| `categories/[id]/guidelines/route.ts` | 148-155 | POST | Google Drive | ✅ Correct |
| `references/search/route.ts` | 37-44 | GET | Uses stored URL | ✅ Fixed |
| `components/ui/reference-display.tsx` | 97-102 | GET | Uses stored URL | ✅ Fixed |
| `brand-assets/route.ts` | 66-102 | All | Supabase Storage | ✅ Intentional |
| `lib/storage/supabase-adapter.ts` | 46, 99 | Generic | Supabase Storage | ✅ Adapter |

---

## Key Patterns Used

### Pattern 1: Check storage_provider (GET endpoints)
```typescript
if (item.storage_provider === 'gdrive' && item.storage_url) {
  publicUrl = item.storage_url  // Use Google Drive URL
} else {
  // Fallback to Supabase Storage
  publicUrl = supabase.storage.from('bucket').getPublicUrl(item.storage_path).data.publicUrl
}
```

**Used in:**
- Product Images GET
- Angled Shots GET
- Angled Shots Generate (download)

### Pattern 2: Direct upload to Google Drive (POST endpoints)
```typescript
const fileName = `${category.slug}/{asset-type}/{filename}`
const storageFile = await uploadFile(buffer, fileName, {
  contentType: file.type,
  provider: 'gdrive',
})
```

**Used in:**
- Angled Shots POST
- Guidelines POST
- Product Images POST

### Pattern 3: Use stored storage_url (Components/Search)
```typescript
const preview = item.storage_url ||
  supabase.storage.from('bucket').getPublicUrl(item.storage_path || item.file_path).data.publicUrl
```

**Used in:**
- References Search API
- Reference Display Component

---

## Database Fields Used

All tables storing file references have these fields:

```sql
storage_provider TEXT    -- 'gdrive' or 'supabase'
storage_path TEXT        -- File path in storage system
storage_url TEXT         -- Public URL (Google Drive or Supabase)
gdrive_file_id TEXT      -- Google Drive file ID (for fast operations)
```

**Tables:**
- `product_images`
- `angled_shots`
- `guidelines`
- `brand_assets` (Supabase Storage intentionally)
- `backgrounds`
- `templates`
- `composites`
- `final_assets`

---

## Testing Checklist

After these changes:

- [x] Product images load from Google Drive
- [x] Angled shots load from Google Drive
- [x] Angled shots generation downloads from Google Drive
- [x] New uploads go to correct Google Drive paths
- [x] Guidelines use Google Drive
- [x] Brand assets still work (Supabase Storage)
- [x] Reference search displays correct URLs
- [x] Reference display component shows correct previews
- [ ] **User to test:** All images display correctly in UI
- [ ] **User to test:** No broken image links

---

## Google Drive Folder Structure (Reference)

```
AdForge Storage (Shared Drive)
└── {category-slug}/
    ├── templates/{aspect-ratio}/
    ├── guidelines/
    ├── backgrounds/{background-name}/{aspect-ratio}/
    ├── {product-slug}/product-images/angled-shots/{aspect-ratio}/
    ├── copy-docs/{headline|hooks|cta}/
    ├── composites/{aspect-ratio}/
    └── final-assets/{aspect-ratio}/
```

**Important:** Format uses `x` not `:` (e.g., `4x5` not `4:5`)

---

## Files Modified in This Audit

1. `src/app/api/references/search/route.ts` - Added storage_url support
2. `src/components/ui/reference-display.tsx` - Added storage_url support

**All other files were already correct!**

---

*Audit completed: 2026-02-22*
*All storage references verified and updated*
*System now correctly uses Google Drive for AdForge assets*
