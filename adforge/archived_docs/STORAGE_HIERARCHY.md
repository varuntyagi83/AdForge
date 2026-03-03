# AdForge Google Drive Storage Hierarchy

## ⚠️ CRITICAL INFORMATION

The `GOOGLE_DRIVE_FOLDER_ID` environment variable points to the **Shared Drive root** named **"AdForge Storage"**.

**ALL assets are stored in Google Drive. Only metadata is stored in Supabase!**

## Complete Folder Hierarchy

```
AdForge Storage (Shared Drive - GOOGLE_DRIVE_FOLDER_ID)
│
└── {category-slug}/ (e.g., "gummy-bear")
    │
    ├── templates/
    │   ├── 1x1/
    │   │   └── {template-name}.json
    │   ├── 4x5/
    │   │   └── {template-name}.json
    │   ├── 9x16/
    │   │   └── {template-name}.json
    │   └── 16x9/
    │       └── {template-name}.json
    │
    ├── guidelines/
    │   └── {filename}.pdf
    │
    ├── backgrounds/
    │   └── {background-name}/ (e.g., "gradient-purple")
    │       ├── 1x1/
    │       │   └── {background-name}-1x1.png
    │       ├── 4x5/
    │       │   └── {background-name}-4x5.png
    │       ├── 9x16/
    │       │   └── {background-name}-9x16.png
    │       └── 16x9/
    │           └── {background-name}-16x9.png
    │
    ├── copy-docs/
    │   ├── headline/
    │   │   └── {filename}.txt
    │   ├── hooks/
    │   │   └── {filename}.txt
    │   └── cta/
    │       └── {filename}.txt
    │
    ├── composites/
    │   ├── 1x1/
    │   │   └── {filename}.psd
    │   ├── 4x5/
    │   │   └── {filename}.psd
    │   ├── 9x16/
    │   │   └── {filename}.psd
    │   └── 16x9/
    │       └── {filename}.psd
    │
    ├── final-assets/
    │   ├── 1x1/
    │   │   └── {filename}.png
    │   ├── 4x5/
    │   │   └── {filename}.png
    │   ├── 9x16/
    │   │   └── {filename}.png
    │   └── 16x9/
    │       └── {filename}.png
    │
    └── {product-slug}/ (e.g., "vitamin-c-gummies")
        └── product-images/
            └── angled-shots/
                ├── 1x1/
                │   └── {filename}.jpg
                ├── 4x5/
                │   └── {filename}.jpg
                ├── 9x16/
                │   └── {filename}.jpg
                └── 16x9/
                    └── {filename}.jpg
```

## Storage Path Examples

### Templates
**Path:** `{category-slug}/templates/{format-with-x}/{template-name}.json`

**Example:**
```
gummy-bear/templates/4x5/my-first-upload.json
```

### Product Images
**Path:** `{category-slug}/{product-slug}/product-images/angled-shots/{aspect-ratio-with-x}/{filename}`

**Example:**
```
gummy-bear/vitamin-c-gummies/product-images/angled-shots/4x5/bottle-front.jpg
```

### Backgrounds
**Path:** `{category-slug}/backgrounds/{background-name}/{format-with-x}/{filename}`

**Example:**
```
gummy-bear/backgrounds/gradient-purple/4x5/gradient-purple-4x5.png
```

### Guidelines
**Path:** `{category-slug}/guidelines/{filename}`

**Example:**
```
gummy-bear/guidelines/brand-guidelines.pdf
```

### Copy Docs
**Path:** `{category-slug}/copy-docs/{type}/{filename}`

**Types:** `headline`, `hooks`, `cta`

**Examples:**
```
gummy-bear/copy-docs/headline/summer-sale.txt
gummy-bear/copy-docs/hooks/urgency-hook.txt
gummy-bear/copy-docs/cta/buy-now.txt
```

### Composites
**Path:** `{category-slug}/composites/{format-with-x}/{filename}`

**Example:**
```
gummy-bear/composites/4x5/final-composite-v1.psd
```

### Final Assets
**Path:** `{category-slug}/final-assets/{format-with-x}/{filename}`

**Example:**
```
gummy-bear/final-assets/4x5/summer-sale-final.png
```

## Important Rules

1. **Format Conversion**: ALWAYS convert format from `4:5` to `4x5` (replace `:` with `x`)
   - Input: `4:5` → Output: `4x5`
   - Input: `16:9` → Output: `16x9`
   - Input: `9:16` → Output: `9x16`
   - Input: `1:1` → Output: `1x1`

2. **Category Slug Required**: ALWAYS include category slug in the path
   - ❌ WRONG: `templates/4x5/my-template.json`
   - ✅ CORRECT: `gummy-bear/templates/4x5/my-template.json`

3. **Shared Drive**: This is a Shared Drive, not a regular folder

4. **Metadata vs Assets**:
   - Supabase: ONLY metadata (file paths, names, sizes, etc.)
   - Google Drive: ALL actual files (images, PDFs, JSON, PSDs, etc.)

## Asset Type Specifics

### Backgrounds
- One background can have multiple aspect ratio variations
- Each variation is stored in its own aspect ratio folder
- Naming convention: `{background-name}-{aspect-ratio}.{ext}`

### Product Images
- Product images are under product folders, not directly under category
- All product images go in `angled-shots` subfolder
- Each image has variations for all aspect ratios

### Copy Docs
- Three types: `headline`, `hooks`, `cta`
- Each type has its own folder
- Usually plain text files

### Composites & Final Assets
- Both use aspect ratio folders directly under the asset type
- Composites: Working files (PSD, AI, etc.)
- Final Assets: Export-ready files (PNG, JPG, etc.)

## DO NOT FORGET THIS STRUCTURE!

This hierarchy is documented and MUST be followed by all upload/storage code.
