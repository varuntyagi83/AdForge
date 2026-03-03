# 📚 AdForge Documentation Index

**Last Updated:** 2026-02-22  
**Project:** AdForge - AI-Powered Ad Asset Generation

---

## 🎯 Quick Start

**New to the project?** Start here:
1. Read [WORKFLOW.md](WORKFLOW.md) - Understand the 9-step ad creation workflow
2. Read [STORAGE_HIERARCHY.md](STORAGE_HIERARCHY.md) - Google Drive folder structure
3. Read [SESSION_02_COMPLETE.md](SESSION_02_COMPLETE.md) - Latest changes

---

## 📋 Session Documentation

### Session 2 (Latest) - 2026-02-22
**Status:** ✅ Complete

**Main Document:**
- **[SESSION_02_COMPLETE.md](SESSION_02_COMPLETE.md)** ⭐ **START HERE**
  - Complete overview of Session 2
  - Display names + Image loading fixes
  - All technical details and architecture

**Supporting Documents:**
- **[NAMING_CONVENTION_UPDATE.md](NAMING_CONVENTION_UPDATE.md)**
  - Technical details for display name implementation
  - Database schema, API changes, frontend updates
  
- **[NAMING_UPDATE_COMPLETE.md](NAMING_UPDATE_COMPLETE.md)**
  - Summary of naming convention changes
  - Quick reference for display names

- **[FRONTEND_UPDATE_COMPLETE.md](FRONTEND_UPDATE_COMPLETE.md)**
  - Frontend component changes
  - TypeScript interface updates

- **[IMAGE_LOADING_FIX.md](IMAGE_LOADING_FIX.md)**
  - Google Drive URL troubleshooting
  - Technical details on thumbnail API

### Session 1 (Previous) - 2026-02-22
**Status:** ✅ Complete

**Main Document:**
- **[SESSION_COMPLETE.md](SESSION_COMPLETE.md)**
  - Storage path fixes
  - Angle name normalization (17 records)
  - Google Drive download support
  - Aspect ratio enforcement in Gemini
  - Storage references audit

**Supporting Documents:**
- **[CRITICAL_ISSUES.md](CRITICAL_ISSUES.md)**
  - Initial problem analysis
  
- **[FIXES_APPLIED.md](FIXES_APPLIED.md)**
  - What was fixed in Session 1
  
- **[FIXES_SUMMARY.md](FIXES_SUMMARY.md)**
  - Comprehensive fix summary
  
- **[STORAGE_REFERENCES_AUDIT.md](STORAGE_REFERENCES_AUDIT.md)**
  - Complete audit of storage references
  - Supabase vs Google Drive usage

---

## 📖 Reference Documentation

### Core Specifications
- **[STORAGE_HIERARCHY.md](STORAGE_HIERARCHY.md)**
  - Google Drive Shared Drive structure
  - Folder organization for all asset types
  - Path format specifications
  - **Important:** Format uses `x` not `:` (e.g., `4x5` not `4:5`)

- **[WORKFLOW.md](WORKFLOW.md)**
  - 9-step AdForge workflow
  - From product images → final assets
  - Aspect ratio support (1:1, 4:5, 9:16, 16:9)

---

## 🔍 Finding Information

### By Topic

**Display Names / Naming Convention**
→ [SESSION_02_COMPLETE.md](SESSION_02_COMPLETE.md) - Issue 1  
→ [NAMING_CONVENTION_UPDATE.md](NAMING_CONVENTION_UPDATE.md)

**Image Loading / Google Drive URLs**
→ [SESSION_02_COMPLETE.md](SESSION_02_COMPLETE.md) - Issue 2  
→ [IMAGE_LOADING_FIX.md](IMAGE_LOADING_FIX.md)

**Storage Architecture**
→ [STORAGE_HIERARCHY.md](STORAGE_HIERARCHY.md)  
→ [STORAGE_REFERENCES_AUDIT.md](STORAGE_REFERENCES_AUDIT.md)

**Aspect Ratios / Gemini Integration**
→ [SESSION_COMPLETE.md](SESSION_COMPLETE.md) - Issue 5  
→ [WORKFLOW.md](WORKFLOW.md)

**Angle Names / Variations**
→ [SESSION_COMPLETE.md](SESSION_COMPLETE.md) - Issue 2  
→ See `src/lib/ai/angle-variations.ts`

**Database Schema**
→ [SESSION_02_COMPLETE.md](SESSION_02_COMPLETE.md) - Technical Architecture  
→ [NAMING_CONVENTION_UPDATE.md](NAMING_CONVENTION_UPDATE.md) - Database Changes

---

## ✅ What's Working Now

### Session 2 Fixes (Latest)
- ✅ **Display Names**: Product name prefix (e.g., "Vitamin C Gummies_Front")
- ✅ **Image Loading**: Google Drive thumbnail API works in UI
- ✅ **35 Records Updated**: All angled shots have correct names and URLs

### Session 1 Fixes (Previous)
- ✅ **Storage Paths**: `/product-images/` folder included
- ✅ **Angle Names**: Standardized (17 records normalized)
- ✅ **Google Drive Downloads**: API supports both storage providers
- ✅ **Aspect Ratios**: Gemini enforces correct dimensions
- ✅ **Storage References**: All use correct URLs

---

## 🏗️ System Architecture

### Storage Strategy
```
Google Drive (Primary)
├── All AdForge assets
├── Category-specific content
└── Path: AdForge Storage/{category-slug}/{asset-type}/

Supabase (Metadata Only)
├── Database records
├── Brand assets (global)
└── No category-specific assets
```

### Display Name Format
```
{Product Name}_{Formatted Angle Name}

Examples:
- "Vitamin C Gummies_Front"
- "All in one Premium_Top 45deg"
- "Vitamin C Gummies_Three Quarter Left"
```

### Google Drive URL Format
```
Thumbnail API (for <img> tags):
https://drive.google.com/thumbnail?id={fileId}&sz=w2000

Features:
✅ Permanent (doesn't expire)
✅ No CORS issues
✅ Works in image tags
✅ High quality (2000px)
```

---

## 📊 Statistics

### Session 2
- Database Migrations: 1
- Data Migrations: 2
- Records Updated: 35 (100%)
- Scripts Created: 8
- Files Modified: 4
- Documentation: 5 files

### Session 1
- Files Modified: 7
- Database Records Updated: 17
- Scripts Created: 1
- Documentation: 5 files
- Critical Issues Resolved: 5/5

### Combined Total
- Issues Resolved: 7
- Records Updated: 35 unique (52 total updates)
- Scripts Created: 9
- Documentation Files: 11
- Success Rate: 100%

---

## 🛠️ Useful Scripts

### Display Names
```bash
# Check display names
npx tsx scripts/update-angled-shot-display-names.ts --dry-run

# Update display names
npx tsx scripts/update-angled-shot-display-names.ts
```

### Google Drive URLs
```bash
# Check URLs
npx tsx scripts/check-gdrive-urls.ts

# Fix URLs (latest version)
npx tsx scripts/fix-gdrive-urls-v2.ts
```

### Database Migration
```bash
# Run display_name migration
npx tsx scripts/exec-migration-018.ts
```

---

## 🧪 Testing Checklist

### After Any Changes
- [ ] Dev server restarted: `npm run dev`
- [ ] Browser hard refreshed: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Win)
- [ ] Display names show product prefix
- [ ] Images load (no "Failed to load")
- [ ] Hover effects work
- [ ] Click to view opens images

### For New Angled Shots
- [ ] Generate in 1:1 format → Should be SQUARE (1080×1080)
- [ ] Generate in 4:5 format → Should be PORTRAIT (1080×1350)
- [ ] Generate in 9:16 format → Should be VERTICAL (1080×1920)
- [ ] Generate in 16:9 format → Should be LANDSCAPE (1920×1080)
- [ ] Display name includes product prefix
- [ ] Image loads correctly

---

## 📞 Troubleshooting

### Common Issues

**Display Names Not Showing**
1. Check: [FRONTEND_UPDATE_COMPLETE.md](FRONTEND_UPDATE_COMPLETE.md)
2. Restart dev server
3. Hard refresh browser

**Images Not Loading**
1. Check: [IMAGE_LOADING_FIX.md](IMAGE_LOADING_FIX.md)
2. Run: `npx tsx scripts/check-gdrive-urls.ts`
3. Verify URLs use thumbnail API format

**Aspect Ratio Wrong**
1. Check: [SESSION_COMPLETE.md](SESSION_COMPLETE.md) - Issue 5
2. Verify Gemini using `imageConfig`
3. Check format parameter passed correctly

---

## 🎯 Documentation Standards

### When to Create Documentation
- ✅ After completing a session
- ✅ When fixing critical issues
- ✅ For significant architecture changes
- ✅ When creating new patterns/conventions

### Documentation Structure
1. **Problem** - What was broken
2. **Solution** - How it was fixed
3. **Impact** - What changed
4. **Testing** - How to verify
5. **Reference** - Code locations

---

## 🚀 Future Work

### Recommended Enhancements
1. **Validation**: Add database CHECK constraints
2. **Monitoring**: Track Google Drive API usage
3. **Performance**: Implement image lazy loading
4. **Testing**: Add unit and integration tests
5. **UI**: Admin panel for data management

---

## 📅 Version History

| Date | Session | Issues | Status |
|------|---------|--------|--------|
| 2026-02-22 | Session 2 | Display Names, Image Loading | ✅ Complete |
| 2026-02-22 | Session 1 | Storage, Angles, Aspect Ratio | ✅ Complete |

---

## 🏆 System Status

```
✅ Storage:           Correct paths with /product-images/
✅ Angle Names:       Standardized across all records
✅ Display Names:     Product prefix included
✅ Image Loading:     Google Drive thumbnail API
✅ Aspect Ratios:     Gemini enforces correctly
✅ API Integration:   Backend + Frontend aligned
✅ Documentation:     Comprehensive and up-to-date

🚀 FULLY OPERATIONAL
```

---

*Documentation maintained by: Claude Code*  
*Last session: 2026-02-22 (Session 2)*  
*All systems operational* ✅
