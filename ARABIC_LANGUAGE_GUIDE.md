# Arabic Language Implementation Guide

## Overview
This document describes the complete Arabic language implementation for the Alexandria University Technology Park (AuTP) website, including translation system, RTL support, and usage instructions.

## Features Implemented

### ✅ Complete Translation System
- **Comprehensive translations** for all UI text across the website
- **Easy-to-use translation hook** (`useLanguage`) for accessing translations
- **Centralized translation management** in `src/lib/translations.ts`

### ✅ RTL (Right-to-Left) Support
- **Automatic direction switching** when Arabic is selected
- **RTL-aware components** with proper text alignment and icon rotation
- **Smooth transitions** between LTR and RTL layouts

### ✅ Arabic Font Support
- **System font optimization** for better Arabic text rendering
- **Proper font stacks** including Segoe UI, Tahoma, and Arial for Arabic
- **Fallback fonts** for maximum compatibility

### ✅ Language Switcher
- **Persistent language selection** (saved in localStorage)
- **Visual indicator** showing current language (EN/AR badge)
- **Accessible** with proper ARIA labels in both languages

## File Structure

```
src/
├── lib/
│   └── translations.ts          # All translation strings (EN + AR)
├── contexts/
│   └── LanguageContext.tsx      # Language state management
├── hooks/
│   └── useLanguage.tsx          # Hook for accessing translations
├── components/
│   ├── LanguageSwitcher.tsx     # Language toggle component
│   ├── Hero.tsx                 # ✅ Translated
│   └── Header.tsx               # ✅ Translated
└── main.tsx                     # App wrapped with LanguageProvider
```

## How to Use

### 1. Add Translations to New Components

```tsx
import { useLanguage } from '@/hooks/useLanguage';

const MyComponent = () => {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.description')}</p>
    </div>
  );
};
```

### 2. Add New Translation Keys

Edit `src/lib/translations.ts`:

```typescript
export const translations = {
  en: {
    'mySection.title': 'My Title',
    'mySection.description': 'My Description',
  },
  ar: {
    'mySection.title': 'عنواني',
    'mySection.description': 'وصفي',
  },
};
```

### 3. Access Language State

```tsx
import { useLanguage } from '@/hooks/useLanguage';

const MyComponent = () => {
  const { language, setLanguage, isRTL, t } = useLanguage();
  
  return (
    <div>
      <p>Current language: {language}</p>
      <p>Is RTL: {isRTL ? 'Yes' : 'No'}</p>
      <button onClick={() => setLanguage('ar')}>العربية</button>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
};
```

### 4. RTL-Aware Styling

Use the `rtl:` prefix for RTL-specific styles:

```tsx
// Icon that should rotate in RTL
<ArrowRight className="ml-2 h-5 w-5 rtl:rotate-180" />

// Or check isRTL in your logic
const { isRTL } = useLanguage();
const direction = isRTL ? 'rtl' : 'ltr';
```

## Translation Categories

### Current Translation Coverage

| Category | Keys | Status |
|----------|------|--------|
| Navigation | 10 | ✅ Complete |
| Hero Section | 6 | ✅ Complete |
| About Section | 3 | ✅ Complete |
| Services | 15 | ✅ Complete |
| Footer | 8 | ✅ Complete |
| Authentication | 12 | ✅ Complete |
| Application Form | 9 | ✅ Complete |
| Tenant Portal | 6 | ✅ Complete |
| Admin | 5 | ✅ Complete |
| Common UI | 13 | ✅ Complete |

### Translation Keys Reference

#### Navigation (`nav.*`)
- `nav.home` - الرئيسية
- `nav.about` - من نحن
- `nav.services` - الخدمات
- `nav.apply` - تقديم طلب
- `nav.news` - الأخبار
- `nav.tenant` - بوابة المستأجر
- `nav.admin` - الإدارة
- `nav.signOut` - تسجيل الخروج
- `nav.signIn` - تسجيل الدخول

#### Hero Section (`hero.*`)
- `hero.title` - منارة الإسكندرية للشركات الناشئة والعلوم والصناعة
- `hero.subtitle` - حديقة جامعة الإسكندرية التكنولوجية...
- `hero.incubation` - الحضانة
- `hero.prototyping` - النماذج الأولية
- `hero.techTransfer` - نقل التكنولوجيا
- `hero.partnerships` - الشراكات الصناعية
- `hero.cta` - ابدأ مشروعك

#### Common UI (`common.*`)
- `common.loading` - جاري التحميل...
- `common.back` - رجوع
- `common.next` - التالي
- `common.save` - حفظ
- `common.cancel` - إلغاء
- `common.edit` - تعديل
- `common.delete` - حذف
- `common.confirm` - تأكيد
- `common.search` - بحث

## Technical Implementation

### 1. Language Context Provider
Located at `src/contexts/LanguageContext.tsx`, manages:
- Current language state (EN/AR)
- Language persistence (localStorage)
- Document direction (LTR/RTL)
- Document language attribute

### 2. Translation Function
The `t()` function provided by `useLanguage()` hook:
- Looks up translation keys
- Returns translated string
- Falls back to key if translation missing

### 3. RTL CSS Support
In `src/index.css`:
- Direction switching via `[dir="rtl"]` attribute
- RTL-specific utility classes
- Arabic font stack for better rendering

### 4. Persistent Selection
Language preference is saved in `localStorage` as `autp-language`

## Best Practices

### ✅ DO
- Use the `t()` function for all user-facing text
- Add new translation keys to both `en` and `ar` objects
- Use `rtl:rotate-180` class for directional icons (arrows)
- Test both LTR and RTL layouts
- Keep translation keys organized by section

### ❌ DON'T
- Hardcode user-facing text in components
- Forget to add Arabic translations for new features
- Use directional CSS without RTL consideration
- Mix translation logic with component logic

## Testing the Implementation

### Manual Testing Checklist
- [ ] Click language switcher in header
- [ ] Verify text changes to Arabic
- [ ] Check layout switches to RTL
- [ ] Verify localStorage persists selection
- [ ] Refresh page - language should persist
- [ ] Test all pages for proper translation
- [ ] Check mobile menu translations
- [ ] Verify icons rotate correctly in RTL

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS/Android)

## Future Enhancements

### Planned Improvements
1. **Extend translations to all pages**:
   - About page
   - Services pages
   - Footer component
   - Forms (Auth, Application)
   - Admin dashboard
   - Tenant portal

2. **SEO optimization**:
   - Add `lang` attribute to HTML tag
   - Add Arabic meta descriptions
   - Implement hreflang tags

3. **Enhanced RTL support**:
   - RTL-aware animations
   - Bidirectional text handling
   - Number formatting (Arabic numerals)

4. **Date/Time localization**:
   - Use date-fns with Arabic locale
   - Format dates according to Arabic conventions

5. **URL localization**:
   - Language prefix in URLs (/ar/, /en/)
   - Language-specific routes

## Troubleshooting

### Issue: Translations not showing
**Solution**: Ensure component is wrapped with `LanguageProvider` in `main.tsx`

### Issue: RTL not working
**Solution**: Check that `document.documentElement.dir` is set correctly in `LanguageContext`

### Issue: Language not persisting
**Solution**: Check browser localStorage - key should be `autp-language`

### Issue: Missing translations
**Solution**: Add missing keys to `src/lib/translations.ts` in both `en` and `ar` objects

### Issue: Arabic text not rendering properly
**Solution**: Verify Arabic font stack in `src/index.css` under `html[lang="ar"]`

## Support & Maintenance

### Adding New Languages
To add additional languages (e.g., French):

1. Update the `Language` type in `translations.ts`:
```typescript
export type Language = 'en' | 'ar' | 'fr';
```

2. Add translation object:
```typescript
export const translations = {
  en: { ... },
  ar: { ... },
  fr: { ... },
};
```

3. Update language switcher to include new option

### Translation Guidelines
- Keep translations natural and contextually appropriate
- Use formal Arabic (Modern Standard Arabic - MSA)
- Maintain consistent terminology across the site
- Consider cultural nuances in translations
- Keep translation keys descriptive and organized

## Credits
Implemented by Lovable AI for Alexandria University Technology Park
Version: 1.0.0
Last Updated: 2025-10-25
