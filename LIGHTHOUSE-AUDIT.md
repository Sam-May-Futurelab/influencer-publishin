# How to Run Lighthouse Audit

## Method 1: Chrome DevTools (Easiest)

1. **Open your site** in Chrome (https://inkfluenceai.com or localhost)
2. **Right-click** anywhere on the page → "Inspect"
3. **Click "Lighthouse" tab** (top menu in DevTools)
4. **Select categories** to test:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
5. **Choose device**: Desktop or Mobile
6. **Click "Analyze page load"**
7. Wait 30-60 seconds for report

## Method 2: Online Tool

1. Go to https://pagespeed.web.dev/
2. Enter your URL: `https://inkfluenceai.com`
3. Click "Analyze"
4. Get both Mobile and Desktop scores

## Target Scores for Launch

- **Performance**: 90+ (Green)
- **Accessibility**: 95+ (Green)
- **Best Practices**: 95+ (Green)
- **SEO**: 95+ (Green)

## Common Issues & Fixes

### Performance Issues
- **Large images**: Already handled with compression (300KB/500KB limits)
- **Unused CSS/JS**: Vite handles this with tree-shaking
- **Large bundle size**: Check if any libraries can be lazy-loaded

### Accessibility Issues
- **Missing alt text on images**: Add to stock images in CoverDesigner
- **Color contrast**: Ensure text meets 4.5:1 ratio
- **Form labels**: Already using Label components

### SEO Issues
- **Missing meta description**: Already have ✅
- **Image alt text**: Add to any missing images
- **Robots.txt**: Already exists ✅

## After Running Audit

1. **Screenshot your scores** for baseline
2. **Fix any red or orange items** (critical)
3. **Re-run audit** to verify fixes
4. **Aim for all green** before launch

## Google Analytics Setup

⚠️ **IMPORTANT**: Replace `G-XXXXXXXXXX` in `index.html` with your real Google Analytics ID:

1. Go to https://analytics.google.com/
2. Create account (if needed)
3. Set up property for inkfluenceai.com
4. Copy your Measurement ID (G-XXXXXXXXXX)
5. Replace in `index.html` lines 44 and 48

Example:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ABC123XYZ');
</script>
```

## Search Console Issues

Your indexing shows:
- 1 page with redirect
- 1 alternate page with canonical
- 1 crawled but not indexed

**Fix**:
1. Check if redirects are necessary
2. Verify canonical tags point to correct URLs
3. Submit sitemap.xml to Search Console
4. Request re-indexing for important pages
