# AdForge Workflow

## Overview

AdForge follows a **content-first, then structure, then compose** approach to ad creation. This workflow ensures you have all necessary assets before designing layouts, and all layouts are ready before combining elements.

## The 9-Step Workflow

### 1. Assets (Products)
**Purpose:** Define what you're advertising

- Create product entries for your category
- Add product names, descriptions, and metadata
- Each product can have multiple image variations

**Why First?** You need to know what you're advertising before gathering images or designing layouts.

---

### 2. Angled Shots (Product Images)
**Purpose:** Gather actual product photography per aspect ratio

- Upload product images for each aspect ratio (1:1, 4:5, 9:16, 16:9)
- Organize under the appropriate product
- Images are stored in Google Drive following the hierarchy:
  ```
  {category-slug}/{product-slug}/product-images/angled-shots/{aspect-ratio}/
  ```

**Why Second?** You need the actual product photos before you can design around them or create backgrounds.

---

### 3. Guidelines (Brand Guidelines)
**Purpose:** Upload reference materials for look & feel

- Upload brand guideline PDFs, images, or reference materials
- Define brand colors, fonts, style guide
- These inform background generation and overall design
- Files stored at:
  ```
  {category-slug}/guidelines/
  ```

**Why Third?** Guidelines inform all design decisions that follow - backgrounds, templates, and copy style.

---

### 4. Backgrounds
**Purpose:** Create backgrounds matching brand identity

- Generate or upload backgrounds based on brand guidelines
- Create variations for each aspect ratio (1:1, 4:5, 9:16, 16:9)
- Backgrounds should align with the look & feel from guidelines
- Each background stored at:
  ```
  {category-slug}/backgrounds/{background-name}/{aspect-ratio}/
  ```

**Why Fourth?** Backgrounds are informed by guidelines and need to exist before templates can reference them.

---

### 5. Templates (Zones & Layers)
**Purpose:** Define the layout structure for combining elements

- Design canvas layouts with zones (product area, text area, background area)
- Define layers and their stacking order
- Create templates for each aspect ratio
- Templates are JSON files stored at:
  ```
  {category-slug}/templates/{aspect-ratio}/
  ```

**Template Structure:**
- Product image zone (where angled shots go)
- Background layer (which backgrounds to use)
- Text zones (where copy will be placed)
- Safe zones (areas to avoid for important content)

**Why Fifth?** Templates define HOW to combine things, so they come after you have the things to combine (assets, backgrounds).

---

### 6. Copy (Text Content)
**Purpose:** Add the messaging

- Create headline variations
- Write hooks (attention-grabbing opening lines)
- Design CTAs (call-to-action buttons/text)
- Organized by type:
  ```
  {category-slug}/copy-docs/headline/
  {category-slug}/copy-docs/hooks/
  {category-slug}/copy-docs/cta/
  ```

**Why Sixth?** Copy needs to fit within template zones, so templates should be defined first.

---

### 7. Composites
**Purpose:** Assemble everything together

- Combine angled shots (per aspect ratio)
- Add backgrounds (per aspect ratio)
- Insert copy variations
- **Follow template structure for positioning (per aspect ratio)**
- Working files (PSD, AI) stored at:
  ```
  {category-slug}/composites/{aspect-ratio}/
  ```

**Key Principle:** Each aspect ratio composite uses its matching aspect ratio template:

| Aspect Ratio | Template Used | Angled Shot | Background | Output |
|--------------|---------------|-------------|------------|---------|
| 4:5 | 4:5 template | 4:5 image | 4:5 bg | 4:5 composite |
| 1:1 | 1:1 template | 1:1 image | 1:1 bg | 1:1 composite |
| 9:16 | 9:16 template | 9:16 image | 9:16 bg | 9:16 composite |
| 16:9 | 16:9 template | 16:9 image | 16:9 bg | 16:9 composite |

**Template-Driven Assembly:**
- Load template for the target aspect ratio
- Place angled shot in product zone (as defined in template)
- Apply background layer (template specifies which layer)
- Position copy in text zones (template provides coordinates)
- Respect safe zones (template defines boundaries)

**Why Seventh?** You need all previous elements ready before you can combine them. Each aspect ratio requires its own template because dimensions and proportions differ significantly.

---

### 8. Final Assets
**Purpose:** Export-ready files

- Export composites to final formats (PNG, JPG)
- Optimize for web/advertising platforms
- One file per aspect ratio variation
- Stored at:
  ```
  {category-slug}/final-assets/{aspect-ratio}/
  ```

**Why Eighth?** Final assets are the exported result of composites.

---

### 9. Ad Export
**Purpose:** Final distribution in multiple formats

- Export ads in all required aspect ratios
- Generate platform-specific formats
- Batch export variations
- Ready for deployment to ad platforms

**Why Last?** This is the final output step after everything is complete.

---

## Workflow Visualization

```
┌─────────────────────────────────────────────────┐
│ CONTENT GATHERING PHASE                         │
├─────────────────────────────────────────────────┤
│ 1. Assets         → Define what to advertise    │
│ 2. Angled Shots   → Gather product photos       │
│ 3. Guidelines     → Upload brand references     │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ DESIGN PHASE                                    │
├─────────────────────────────────────────────────┤
│ 4. Backgrounds    → Create brand-aligned BGs    │
│ 5. Templates      → Define layout structure     │
│ 6. Copy           → Write messaging             │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ COMPOSITION & EXPORT PHASE                      │
├─────────────────────────────────────────────────┤
│ 7. Composites     → Combine all elements        │
│ 8. Final Assets   → Export finished files       │
│ 9. Ad Export      → Platform-ready output       │
└─────────────────────────────────────────────────┘
```

## Key Principles

### 1. Content Before Structure
Always gather your content (products, images, brand guidelines) before defining structure (templates, layouts).

### 2. Structure Before Composition
Define how things will be arranged (templates) before actually arranging them (composites).

### 3. Aspect Ratio Consistency
Most assets are created per aspect ratio:
- Angled Shots: 1:1, 4:5, 9:16, 16:9
- Backgrounds: 1:1, 4:5, 9:16, 16:9
- Templates: 1:1, 4:5, 9:16, 16:9
- Composites: 1:1, 4:5, 9:16, 16:9
- Final Assets: 1:1, 4:5, 9:16, 16:9

### 4. Template-Driven Assembly
Templates act as the blueprint for composites. **Each aspect ratio has its own template** because layout requirements differ based on dimensions:

**A template defines:**
- Where product images go (coordinates specific to that aspect ratio)
- Which background to use
- Where text elements are placed (positioning for that ratio)
- Safe zones for important content (boundaries for that format)

**Example:** A 16:9 landscape template might place the product on the left with copy on the right. The same ad in 9:16 portrait format needs a completely different template - perhaps product centered with copy above and below - because the space is oriented vertically.

**One Campaign, Multiple Templates:**
```
Product: Vitamin C Gummies
Campaign: Summer Sale

Templates:
├─ 1:1 template  → Square layout
├─ 4:5 template  → Portrait layout (more vertical)
├─ 9:16 template → Story layout (very tall)
└─ 16:9 template → Landscape layout (horizontal)

All templates use the same:
- Product (different aspect ratio images)
- Background concept (different aspect ratio files)
- Copy (same text, different positioning)
```

### 5. Separation of Concerns
Each step has a clear purpose:
- **Assets/Images** = Raw materials
- **Guidelines** = Design rules
- **Backgrounds** = Visual foundation
- **Templates** = Assembly instructions
- **Copy** = Messaging
- **Composites** = Assembly process
- **Final Assets** = Finished product

## Storage Hierarchy

All assets follow this Google Drive hierarchy:

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

See [STORAGE_HIERARCHY.md](./STORAGE_HIERARCHY.md) for complete details.

## Common Patterns

### Creating a New Ad Campaign

1. **Setup Phase**
   - Create category (if new)
   - Add product(s)
   - Upload angled shots for all aspect ratios
   - Upload brand guidelines

2. **Design Phase**
   - Generate/upload backgrounds (informed by guidelines)
   - Create templates for each aspect ratio
   - Write copy variations (headlines, hooks, CTAs)

3. **Production Phase**
   - Create composites using templates as guides
   - Export to final assets
   - Export for ad platforms

### Template Reuse

Templates can be reused across multiple products in the same category:
- Same layout structure
- Different angled shots
- Different copy
- Same or different backgrounds

This allows for consistent brand presentation while varying the content.

---

## Aspect Ratio Management

### The Four Standard Ratios

AdForge supports four standard aspect ratios, each optimized for different platforms:

| Ratio | Dimensions | Platform Use | Layout Type |
|-------|------------|--------------|-------------|
| **1:1** | 1080×1080 | Instagram Feed, Facebook Posts | Square - Balanced |
| **4:5** | 1080×1350 | Instagram Portrait Posts | Portrait - Moderate vertical |
| **9:16** | 1080×1920 | Instagram Stories, TikTok, Reels | Portrait - Tall vertical |
| **16:9** | 1920×1080 | YouTube, Website Banners | Landscape - Horizontal |

### Cross-Ratio Workflow

For a single ad campaign, you create **one set of assets per ratio**:

```
Campaign: "Summer Sale - Vitamin C Gummies"

For 4:5 ratio:
  ✓ 4:5 angled shot of product
  ✓ 4:5 background (summer theme)
  ✓ 4:5 template (portrait layout)
  ✓ Copy (shared across all ratios)
  → 4:5 composite → 4:5 final asset

For 1:1 ratio:
  ✓ 1:1 angled shot of product (same angle, cropped to square)
  ✓ 1:1 background (same summer theme, square format)
  ✓ 1:1 template (square layout)
  ✓ Copy (same copy, different positioning)
  → 1:1 composite → 1:1 final asset

For 9:16 ratio:
  ✓ 9:16 angled shot (same angle, tall crop)
  ✓ 9:16 background (same theme, vertical)
  ✓ 9:16 template (story-style layout)
  ✓ Copy (same copy, vertical positioning)
  → 9:16 composite → 9:16 final asset

For 16:9 ratio:
  ✓ 16:9 angled shot (same angle, wide crop)
  ✓ 16:9 background (same theme, landscape)
  ✓ 16:9 template (horizontal layout)
  ✓ Copy (same copy, horizontal positioning)
  → 16:9 composite → 16:9 final asset
```

### What's Shared vs. Unique

**Shared Across All Ratios:**
- Product/Category data
- Copy text content (headlines, hooks, CTAs)
- Brand guidelines
- Overall creative concept

**Unique Per Ratio:**
- Angled shot crops/compositions
- Background files (different dimensions)
- Template layouts (different zone positioning)
- Composite files
- Final assets

### Template Design Considerations

When designing templates for different ratios, consider:

**1:1 (Square):**
- Equal weight to all elements
- Centered compositions work well
- Good for products that need equal space

**4:5 (Portrait):**
- More vertical space for copy
- Product can be larger
- Popular for feed posts

**9:16 (Stories/Reels):**
- Very tall, minimal width
- Stacked vertical layout
- Keep important elements in center (safe zones critical)
- Top 250px and bottom 250px may be covered by UI

**16:9 (Landscape):**
- Horizontal split layouts
- Side-by-side arrangements
- More room for detailed copy
- Good for website banners

---

## Best Practices

1. **Start Small**: Begin with one aspect ratio (e.g., 1:1) and complete the workflow before expanding to others

2. **Validate Early**: Check that angled shots and backgrounds look good together before creating templates

3. **Template Testing**: Test templates with different product images to ensure they're flexible enough

4. **Copy Variations**: Create multiple copy variations for A/B testing

5. **Organize by Campaign**: Use descriptive names for composites and final assets to track different campaigns

6. **Quality Control**: Review final assets before ad export to catch any issues

---

*Last Updated: February 2026*
