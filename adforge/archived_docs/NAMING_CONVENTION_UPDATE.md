# 🏷️ Angled Shots Naming Convention Update

**Date:** 2026-02-22
**Status:** ✅ COMPLETE

---

## 📋 Overview

Updated the angled shots naming convention to include product name prefix in display names.

### Old Convention
- Display Name: `"Front"`, `"Left 30deg"`, `"Top 45deg"`, etc.
- No product context in the name

### New Convention
- Display Name: `"{Product Name}_Front"`, `"{Product Name}_Left 30deg"`, etc.
- Product name included for better organization and clarity

---

## 🎯 Examples

| Angle Name | Old Display Name | New Display Name |
|------------|------------------|------------------|
| `front` | `"Front"` | `"Vitamin C Gummies_Front"` |
| `left_30deg` | `"Left 30deg"` | `"Vitamin C Gummies_Left 30deg"` |
| `right_30deg` | `"Right 30deg"` | `"Vitamin C Gummies_Right 30deg"` |
| `top_45deg` | `"Top 45deg"` | `"Vitamin C Gummies_Top 45deg"` |
| `three_quarter_left` | `"Three Quarter Left"` | `"Vitamin C Gummies_Three Quarter Left"` |
| `three_quarter_right` | `"Three Quarter Right"` | `"Vitamin C Gummies_Three Quarter Right"` |
| `isometric` | `"Isometric"` | `"Vitamin C Gummies_Isometric"` |

---

## 🔧 Implementation Details

### 1. Database Schema Changes

**Migration:** `supabase/migrations/018_add_display_name_to_angled_shots.sql`

Added new column to `angled_shots` table:
```sql
ALTER TABLE angled_shots
  ADD COLUMN IF NOT EXISTS display_name TEXT;
```

### 2. Helper Functions

**File:** `src/lib/ai/format-angle-name.ts`

Created utility functions:
- `formatAngleNameForDisplay(angleName)` - Converts `front` → `"Front"`
- `createDisplayName(productName, angleName)` - Creates `"Product_Angle"`

### 3. API Updates

**File:** `src/app/api/categories/[id]/angled-shots/route.ts`

**GET Endpoint:**
- Added `display_name` to SELECT query (line 50)
- Returns `display_name` in API response

**POST Endpoint:**
- Fetches product `name` (not just `slug`)
- Generates `display_name` using `createDisplayName()` helper
- Saves `display_name` to database when creating new angled shots

### 4. Migration Scripts

Created 3 migration/update scripts:

**a) `scripts/exec-migration-018.ts`**
- Adds `display_name` column to database
- ✅ Executed successfully

**b) `scripts/update-angled-shot-display-names.ts`**
- Updates all existing records with product-prefixed names
- Supports `--dry-run` flag for preview
- ✅ Updated 35 records successfully

**c) `scripts/run-migration-018.ts`** (helper)
- Checks if migration needed
- Provides manual SQL if needed

---

## 📊 Migration Results

### Database Migration
```
✅ Column added: angled_shots.display_name TEXT
✅ Comment added: 'Display name with product prefix'
```

### Data Update
```
Total Records:     35
Updated:          35
Skipped:           0
Products:          2 (Vitamin C Gummies, All in one Premium)
```

**Products Updated:**
- ✅ Vitamin C Gummies: 28 angled shots
- ✅ All in one Premium: 7 angled shots

---

## 🔍 Database Fields

The `angled_shots` table now has:

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `angle_name` | TEXT | Standardized identifier | `front`, `left_30deg` |
| `angle_description` | TEXT | Human-readable description | `"Front view, straight on"` |
| `display_name` | TEXT | **NEW** - Product-prefixed name | `"Vitamin C Gummies_Front"` |

**Important:**
- `angle_name` - Never changes, used for programmatic identification
- `display_name` - User-facing name with product prefix
- Frontend should display `display_name` instead of formatting `angle_name`

---

## ✅ What's Working Now

### Backend (API)
- ✅ New angled shots automatically get `display_name` with product prefix
- ✅ GET endpoint returns `display_name` in response
- ✅ All existing records updated with correct display names

### Database
- ✅ `display_name` column exists
- ✅ All 35 existing records have correct display names
- ✅ Format: `"{Product Name}_{Formatted Angle}"`

### Future Records
- ✅ POST endpoint automatically generates display names
- ✅ Uses `createDisplayName(product.name, angleName)` helper
- ✅ Consistent naming for all new angled shots

---

## 📝 Files Created/Modified

### New Files
1. `supabase/migrations/018_add_display_name_to_angled_shots.sql`
2. `src/lib/ai/format-angle-name.ts`
3. `scripts/exec-migration-018.ts`
4. `scripts/update-angled-shot-display-names.ts`
5. `scripts/run-migration-018.ts`
6. `scripts/apply-migration-018.ts`
7. `NAMING_CONVENTION_UPDATE.md` (this file)

### Modified Files
1. `src/app/api/categories/[id]/angled-shots/route.ts`
   - Added import: `createDisplayName`
   - Updated GET: Added `display_name` to SELECT
   - Updated POST: Generate and save `display_name`

---

## 🎯 Next Steps for Frontend

The frontend should now:

1. **Display the new field:**
   ```typescript
   // Instead of formatting angle_name:
   <span>{formatAngleName(shot.angle_name)}</span>

   // Use display_name directly:
   <span>{shot.display_name}</span>
   ```

2. **Update any components** that display angled shot names to use `display_name`

3. **Remove manual formatting** since display names are now stored in database

---

## 🧪 Testing

To verify the changes:

1. **Check existing records:**
   ```bash
   npx tsx scripts/update-angled-shot-display-names.ts --dry-run
   ```
   Should show: "Skipped: 35" (all records already correct)

2. **Create new angled shot via API:**
   - Should automatically get display_name with product prefix
   - Example: "New Product_Front"

3. **Fetch angled shots via GET API:**
   - Response should include `display_name` field
   - Format: "{Product Name}_{Angle Display}"

---

## 📚 Reference

### Display Name Format

Template: `{product_name}_{formatted_angle_name}`

### Formatting Rules

Angle Name | Display Format
-----------|---------------
`front` | Front
`left_30deg` | Left 30deg
`right_30deg` | Right 30deg
`top_45deg` | Top 45deg
`three_quarter_left` | Three Quarter Left
`three_quarter_right` | Three Quarter Right
`isometric` | Isometric

---

## ✅ Success Criteria

- [x] Database column added
- [x] All existing records updated (35/35)
- [x] API updated to use display names
- [x] Helper functions created
- [x] Migration scripts work correctly
- [x] No errors during migration
- [x] Backwards compatible (angle_name still exists)

---

## 🔒 Backwards Compatibility

The update is **fully backwards compatible**:
- ✅ `angle_name` field still exists (identifier)
- ✅ `angle_description` field still exists (description)
- ✅ Added `display_name` as new field
- ✅ Frontend can gradually adopt `display_name`
- ✅ No breaking changes to existing code

---

*Migration completed: 2026-02-22*
*All angled shots now have product-prefixed display names*
