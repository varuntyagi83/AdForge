# 🚨 CRITICAL ISSUES - Angled Shots Storage & Naming

## Issue #1: WRONG STORAGE PATH STRUCTURE ❌

### What's Documented (STORAGE_HIERARCHY.md)
```
{category-slug}/{product-slug}/product-images/angled-shots/{aspect-ratio}/
```
**Example:**
```
gummy-bear/vitamin-c-gummies/product-images/angled-shots/4x5/bottle-front.jpg
```

### What's Actually Implemented (route.ts:229)
```typescript
const fileName = `${category.slug}/${product.slug}/angled-shots/${formatFolder}/${imageNameWithoutExt}-${angleName}_${Date.now()}.${fileExt}`
```
**Example:**
```
gummy-bear/vitamin-c-gummies/angled-shots/4x5/bottle-front_left_1708934400000.jpg
```

### THE PROBLEM
**MISSING `/product-images/` in the path!**

Current:  `{category}/{product}/angled-shots/{format}/...`
Should be: `{category}/{product}/product-images/angled-shots/{format}/...`

---

## Issue #2: INCONSISTENT ANGLE NAMES IN DATABASE ❌

### What's Defined (angle-variations.ts)
```typescript
- front
- left_30deg
- right_30deg
- top_45deg
- three_quarter_left
- three_quarter_right
- isometric
```

### What's Actually in the Database (from screenshots)

**For 1:1 format:**
- "Isometric" → correct (should be `isometric`)
- "Top 45deg" → correct (should be `top_45deg`)
- "Left Side" → **WRONG** (should be `left_30deg` or `three_quarter_left`)
- "Right Side" → **WRONG** (should be `right_30deg` or `three_quarter_right`)

**For 16:9 format:**
- "Front" → correct (should be `front`)
- "Left" → **WRONG** (should be `left_30deg`)
- "Right" → **WRONG** (should be `right_30deg`)
- "Top" → **WRONG** (should be `top_45deg`)

### THE PROBLEM
The database has non-standard angle names like:
- `left_side` instead of `left_30deg`
- `left` instead of `left_30deg`
- `right` instead of `right_30deg`
- `top` instead of `top_45deg`

This means:
1. **Data was created with inconsistent naming**
2. **The UI formatting function can't fix this** (AngledShotCard.tsx:97)
3. **Filtering and queries will fail** because they expect standard names

---

## Issue #3: UI DISPLAY FORMATTING IS UNRELIABLE ⚠️

### Current Implementation (AngledShotCard.tsx:97-102)
```typescript
const formatAngleName = (name: string) => {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
```

### What It Does
- `left_30deg` → "Left 30deg" ✅
- `top_45deg` → "Top 45deg" ✅
- `isometric` → "Isometric" ✅
- `left_side` → "Left Side" ❌ (works but shouldn't exist)
- `left` → "Left" ❌ (works but too generic)
- `right` → "Right" ❌ (works but too generic)

### THE PROBLEM
The function **only formats display**, it doesn't **validate or fix** incorrect angle names. So garbage angle names get nicely formatted garbage.

---

## Issue #4: ASPECT RATIO FORMAT INCONSISTENCY ⚠️

### Database Storage
```sql
format: '4:5'  -- Uses colon
```

### Google Drive Folder Names
```
4x5/  -- Uses 'x'
```

### Current Code (route.ts:228)
```typescript
const formatFolder = format.replace(':', 'x') // "4:5" → "4x5"
```

### STATUS
✅ This conversion is **CORRECT** and matches documentation.

However, we need to verify:
1. Is the conversion happening **everywhere** it should?
2. Are there places where `4:5` is used directly in paths?
3. Is the reverse conversion (`4x5` → `4:5`) happening when reading from storage?

---

## ROOT CAUSE ANALYSIS

### How Did This Happen?

1. **Storage Path Bug**: Code was written without following STORAGE_HIERARCHY.md
   - Developer didn't include `/product-images/` subfolder
   - Now all existing files are in the wrong location

2. **Angle Name Inconsistency**:
   - Likely multiple code versions or manual database entries
   - No validation on angle_name field
   - Generation API might have changed over time
   - Or someone used custom angle names instead of predefined ones

3. **No Validation**:
   - Database accepts any string for `angle_name`
   - No CHECK constraint to enforce valid angle names
   - No validation in API before insert

---

## IMPACT

### Current State
- ❌ **Files stored in wrong Google Drive locations**
- ❌ **Inconsistent angle names across database**
- ❌ **UI shows confusing/incorrect angle labels**
- ❌ **Filtering by angle name will fail**
- ❌ **Templates expecting specific angles won't find them**
- ❌ **Storage sync operations will be confused**

### Data Affected
From screenshots:
- At least **28 angled shots** for product "Vitamin C Gummies" in 1:1 format
- Unknown number in other formats (16:9, 4:5, 9:16)
- Unknown number for other products

---

## RECOMMENDED FIXES

### Fix #1: Correct Storage Path (CRITICAL)
**File:** `src/app/api/categories/[id]/angled-shots/route.ts:229`

**Change:**
```typescript
// OLD (WRONG)
const fileName = `${category.slug}/${product.slug}/angled-shots/${formatFolder}/${imageNameWithoutExt}-${angleName}_${Date.now()}.${fileExt}`

// NEW (CORRECT)
const fileName = `${category.slug}/${product.slug}/product-images/angled-shots/${formatFolder}/${imageNameWithoutExt}-${angleName}_${Date.now()}.${fileExt}`
```

### Fix #2: Add Angle Name Validation (CRITICAL)
**File:** `src/lib/ai/angle-variations.ts`

Add validation function:
```typescript
export const VALID_ANGLE_NAMES = [
  'front',
  'left_30deg',
  'right_30deg',
  'top_45deg',
  'three_quarter_left',
  'three_quarter_right',
  'isometric'
] as const

export type ValidAngleName = typeof VALID_ANGLE_NAMES[number]

export function isValidAngleName(name: string): name is ValidAngleName {
  return VALID_ANGLE_NAMES.includes(name as ValidAngleName)
}

export function normalizeAngleName(name: string): ValidAngleName | null {
  const normalized = name.toLowerCase().replace(/\s+/g, '_')

  // Try exact match first
  if (isValidAngleName(normalized)) {
    return normalized
  }

  // Try fuzzy matching
  const fuzzyMap: Record<string, ValidAngleName> = {
    'left': 'left_30deg',
    'left_side': 'left_30deg',
    'right': 'right_30deg',
    'right_side': 'right_30deg',
    'top': 'top_45deg',
    'top_view': 'top_45deg',
  }

  return fuzzyMap[normalized] || null
}
```

### Fix #3: Update API to Validate (CRITICAL)
**File:** `src/app/api/categories/[id]/angled-shots/route.ts:167`

Add validation before insert:
```typescript
import { isValidAngleName } from '@/lib/ai/angle-variations'

// After getting angleName from body
if (!isValidAngleName(angleName)) {
  return NextResponse.json(
    { error: `Invalid angle name: ${angleName}. Must be one of: ${VALID_ANGLE_NAMES.join(', ')}` },
    { status: 400 }
  )
}
```

### Fix #4: Add Database Constraint (IMPORTANT)
**New Migration:** `supabase/migrations/XXX_enforce_valid_angle_names.sql`

```sql
-- Add CHECK constraint for valid angle names
ALTER TABLE angled_shots
ADD CONSTRAINT valid_angle_name CHECK (
  angle_name IN (
    'front',
    'left_30deg',
    'right_30deg',
    'top_45deg',
    'three_quarter_left',
    'three_quarter_right',
    'isometric'
  )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_angled_shots_angle_name
ON angled_shots(angle_name);
```

### Fix #5: Data Migration Script (URGENT)
**New File:** `scripts/fix-angled-shots-data.ts`

```typescript
/**
 * Migrates existing angled shots to:
 * 1. Correct storage paths (add /product-images/)
 * 2. Standardize angle names
 * 3. Update database records
 */

// Steps:
// 1. Fetch all angled_shots from database
// 2. For each shot:
//    a. Check if storage_path matches correct pattern
//    b. If not, move file in Google Drive to correct location
//    c. Normalize angle_name using fuzzy matching
//    d. Update database record
// 3. Report success/failures
```

---

## MIGRATION PLAN

### Phase 1: Stop New Bad Data (IMMEDIATE)
1. ✅ Fix storage path in route.ts
2. ✅ Add angle name validation in API
3. ✅ Deploy to prevent new incorrect data

### Phase 2: Fix Existing Data (URGENT)
1. ✅ Create data migration script
2. ✅ Run in dry-run mode to identify affected records
3. ✅ Move files to correct Google Drive paths
4. ✅ Update database records
5. ✅ Verify all URLs still work

### Phase 3: Add Constraints (IMPORTANT)
1. ✅ Add database CHECK constraint
2. ✅ Add indexes for performance
3. ✅ Update TypeScript types

### Phase 4: Improve UI (NICE TO HAVE)
1. ✅ Better angle name display formatting
2. ✅ Show warnings for non-standard angles
3. ✅ Add angle name picker UI (dropdowns, not free text)

---

## VERIFICATION CHECKLIST

After fixes, verify:
- [ ] New angled shots use correct storage path with `/product-images/`
- [ ] New angled shots only use valid angle names
- [ ] Existing data migrated successfully
- [ ] All Google Drive URLs still accessible
- [ ] UI displays consistent angle names
- [ ] Filtering by angle name works
- [ ] Filtering by format works
- [ ] Database constraints prevent bad data
- [ ] No orphaned files in Google Drive
- [ ] No broken references in database

---

## FILES TO MODIFY

1. **src/app/api/categories/[id]/angled-shots/route.ts** - Fix storage path, add validation
2. **src/lib/ai/angle-variations.ts** - Add validation functions
3. **supabase/migrations/XXX_enforce_valid_angle_names.sql** - Add constraints
4. **scripts/fix-angled-shots-data.ts** - Create migration script
5. **src/components/angled-shots/AngledShotCard.tsx** - Improve display formatting

---

*Created: 2026-02-22*
*Priority: CRITICAL*
*Status: ISSUES IDENTIFIED - FIXES PENDING*
