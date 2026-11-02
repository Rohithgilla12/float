/**
 * Static Site Generation (SSG) & Prerender Engine for Float
 * 
 * Generates SEO-optimized, pre-rendered static HTML files for:
 * 1. The Landing Page (dist/index.html)
 * 2. The Blog Index (dist/blog/index.html)
 * 3. Every Blog Post (dist/blog/<slug>/index.html)
 * 4. Comprehensive sitemap.xml with accurate change frequencies & priorities
 * 5. robots.txt allowing search bots and pointing to sitemap.xml
 * 
 * Each pre-rendered page includes:
 * - Full readable semantic HTML in #root
 * - Dedicated <title> and <meta name="description">
 * - Dedicated OpenGraph & Twitter Card tags (rich social sharing cards)
 * - Canonical URLs
 * - Schema.org JSON-LD Article/Product structured data for rich Google snippets
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Polyfill minimal browser globals for SSR rendering of components
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as any;
}

// Import components and data
import { BLOG_POSTS, BlogPost } from '../src/data/blogPosts.ts';
import { LandingPage } from '../src/components/LandingPage.tsx';
import { BlogIndex } from '../src/components/BlogIndex.tsx';
import { BlogPostView } from '../src/components/BlogPostView.tsx';
import { LegalPage } from '../src/components/LegalPage.tsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const BASE_URL = 'https://float.gilla.fun';

interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: string;
  authorName?: string;
  category?: string;
  keywords?: string[];
  structuredData?: object;
}

function injectMetadataAndContent(
  templateHtml: string,
  meta: PageMetadata,
  bodyHtml: string
): string {
  let html = templateHtml;

  // 1. Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${meta.title}</title>`);

  // 2. Build custom meta tags
  const tags: string[] = [
    `<meta name="description" content="${meta.description.replace(/"/g, '&quot;')}" />`,
    `<link rel="canonical" href="${meta.canonicalUrl}" />`,
    `<meta property="og:title" content="${meta.title.replace(/"/g, '&quot;')}" />`,
    `<meta property="og:description" content="${meta.description.replace(/"/g, '&quot;')}" />`,
    `<meta property="og:url" content="${meta.canonicalUrl}" />`,
    `<meta property="og:type" content="${meta.ogType || 'website'}" />`,
    `<meta property="og:image" content="${meta.ogImage || `${BASE_URL}/og.png`}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${meta.title.replace(/"/g, '&quot;')}" />`,
    `<meta name="twitter:description" content="${meta.description.replace(/"/g, '&quot;')}" />`,
    `<meta name="twitter:image" content="${meta.ogImage || `${BASE_URL}/og.png`}" />`,
  ];

  if (meta.keywords && meta.keywords.length > 0) {
    tags.push(`<meta name="keywords" content="${meta.keywords.join(', ').replace(/"/g, '&quot;')}" />`);
  }

  if (meta.publishedTime) {
    tags.push(`<meta property="article:published_time" content="${meta.publishedTime}" />`);
  }

  if (meta.authorName) {
    tags.push(`<meta property="article:author" content="${meta.authorName}" />`);
  }

  if (meta.category) {
    tags.push(`<meta property="article:section" content="${meta.category}" />`);
  }

  if (meta.structuredData) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(meta.structuredData, null, 2)}</script>`);
  }

  // Remove existing generic og & description tags from template to avoid duplicates
  html = html
    .replace(/<meta name="description"[^>]*>/gi, '')
    .replace(/<meta property="og:title"[^>]*>/gi, '')
    .replace(/<meta property="og:description"[^>]*>/gi, '')
    .replace(/<meta property="og:image(:width|:height)?"[^>]*>/gi, '')
    .replace(/<meta property="og:url"[^>]*>/gi, '')
    .replace(/<meta property="og:type"[^>]*>/gi, '')
    .replace(/<meta name="twitter:title"[^>]*>/gi, '')
    .replace(/<meta name="twitter:description"[^>]*>/gi, '')
    .replace(/<meta name="twitter:image"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '');

  // For articles and blog index, strip video player tags so social cards display the article card
  if (meta.ogType === 'article' || meta.canonicalUrl.includes('/blog')) {
    html = html
      .replace(/<meta property="og:video"[^>]*>/gi, '')
      .replace(/<meta property="og:video:type"[^>]*>/gi, '')
      .replace(/<meta property="og:video:width"[^>]*>/gi, '')
      .replace(/<meta property="og:video:height"[^>]*>/gi, '')
      .replace(/<meta name="twitter:player"[^>]*>/gi, '')
      .replace(/<meta name="twitter:player:width"[^>]*>/gi, '')
      .replace(/<meta name="twitter:player:height"[^>]*>/gi, '');
  }

  // Inject meta tags right before </head>
  html = html.replace('</head>', () => `  ${tags.join('\n    ')}\n  </head>`);

  // Inject rendered body into <div id="root"> using a replacer function to avoid interpreting "$" in bodyHtml
  html = html.replace(
    /(<div id="root"[^>]*>)[\s\S]*?(<\/div>)/i,
    (_match, p1, p2) => `${p1}${bodyHtml}${p2}`
  );

  return html;
}

function writeHtmlFile(targetPath: string, content: string) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, content, 'utf8');
}

async function runPrerender() {
  console.log('🚀 Starting Float SEO Prerender & SSG build...');

  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`dist/index.html not found! Run "vite build" before prerendering.`);
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const urlsForSitemap: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

  // ==========================================
  // 1. Prerender Landing Page (dist/index.html)
  // ==========================================
  console.log('📄 Prerendering Landing Page (/)...');
  const landingMarkup = renderToStaticMarkup(
    React.createElement(LandingPage, {
      onOpenAppFullscreen: () => {},
      onOpenBlog: () => {},
      onSelectBlogPost: () => {},
    })
  );

  const landingStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Float',
    operatingSystem: 'macOS 12.0 or later',
    applicationCategory: 'ProductivityApplication',
    description: 'The fastest floating desktop scratchpad for macOS with 0ms summon latency, fullscreen space pinning, and raw markdown storage.',
    offers: {
      '@type': 'Offer',
      price: '4.99',
      priceCurrency: 'USD',
      url: 'https://float.gilla.fun',
    },
    author: {
      '@type': 'Person',
      name: 'Rohith Gilla',
      url: 'https://gilla.fun',
    },
  };

  const landingHtml = injectMetadataAndContent(
    templateHtml,
    {
      title: 'Float — The Floating Desktop Scratchpad for macOS',
      description: 'The fastest floating desktop scratchpad for macOS. Summon with ⌥Space, pin above full-screen apps, write in live WYSIWYG markdown, and trigger slash commands.',
      canonicalUrl: BASE_URL,
      ogType: 'website',
      ogImage: `${BASE_URL}/og.png`,
      structuredData: landingStructuredData,
    },
    landingMarkup
  );

  writeHtmlFile(path.join(DIST_DIR, 'index.html'), landingHtml);
  urlsForSitemap.push({
    loc: `${BASE_URL}/`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '1.0',
  });

  // ==========================================
  // 2. Prerender Blog Index (dist/blog/index.html)
  // ==========================================
  console.log('📚 Prerendering Blog Index (/blog)...');
  const blogIndexMarkup = renderToStaticMarkup(
    React.createElement(BlogIndex, {
      onSelectPost: () => {},
      onBackToLanding: () => {},
    })
  );

  const blogIndexStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Float Blog',
    description: 'In-depth architectural guides, macOS window management breakdowns, and scratchpad comparisons for keyboard-driven power users.',
    url: `${BASE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Float',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/favicon.png`,
      },
    },
    blogPost: BLOG_POSTS.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url: `${BASE_URL}/blog/${post.slug}`,
    })),
  };

  const blogIndexHtml = injectMetadataAndContent(
    templateHtml,
    {
      title: 'Float Blog — macOS Productivity, Scratchpad Comparisons & Guides',
      description: 'Explore in-depth guides, macOS window management comparisons, and frictionless markdown scratchpad workflows for power users.',
      canonicalUrl: `${BASE_URL}/blog`,
      ogType: 'website',
      ogImage: `${BASE_URL}/og.png`,
      structuredData: blogIndexStructuredData,
    },
    blogIndexMarkup
  );

  writeHtmlFile(path.join(DIST_DIR, 'blog', 'index.html'), blogIndexHtml);
  urlsForSitemap.push({
    loc: `${BASE_URL}/blog`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '0.8',
  });

  // ==========================================
  // 3. Prerender Each Blog Post (dist/blog/<slug>/index.html)
  // ==========================================
  for (const post of BLOG_POSTS) {
    console.log(`📝 Prerendering Article: /blog/${post.slug}...`);
    const postMarkup = renderToStaticMarkup(
      React.createElement(BlogPostView, {
        post,
        onBackToBlog: () => {},
        onBackToHome: () => {},
      })
    );

    const postStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/blog/${post.slug}`,
      },
      headline: post.title,
      description: post.description,
      image: `${BASE_URL}/icon.png`,
      author: {
        '@type': 'Person',
        name: post.author.name,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Float',
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/favicon.png`,
        },
      },
      datePublished: '2026-10-31',
      dateModified: '2026-10-31',
      keywords: [post.targetKeyword, ...post.secondaryKeywords].join(', '),
      articleSection: post.category,
    };

    const postHtml = injectMetadataAndContent(
      templateHtml,
      {
        title: `${post.metaTitle} | Float`,
        description: post.description,
        canonicalUrl: `${BASE_URL}/blog/${post.slug}`,
        ogType: 'article',
        ogImage: `${BASE_URL}/og.png`,
        publishedTime: '2026-10-31T00:00:00Z',
        authorName: post.author.name,
        category: post.category,
        keywords: [post.targetKeyword, ...post.secondaryKeywords],
        structuredData: postStructuredData,
      },
      postMarkup
    );

    writeHtmlFile(path.join(DIST_DIR, 'blog', post.slug, 'index.html'), postHtml);
    urlsForSitemap.push({
      loc: `${BASE_URL}/blog/${post.slug}`,
      lastmod: '2026-10-31',
      changefreq: 'monthly',
      priority: '0.8',
    });
  }

  console.log('📜 Prerendering Legal Page (/legal)...');
  const legalMarkup = renderToStaticMarkup(React.createElement(LegalPage, { onBackToHome: () => {} }));
  const legalHtml = injectMetadataAndContent(
    templateHtml,
    {
      title: 'Float — Privacy, Terms & Refunds',
      description: 'How Float handles your data (it stays on your Mac), the licence terms, and the 14-day refund policy.',
      canonicalUrl: `${BASE_URL}/legal`,
      ogType: 'website',
    },
    legalMarkup
  );
  writeHtmlFile(path.join(DIST_DIR, 'legal', 'index.html'), legalHtml);
  urlsForSitemap.push({ loc: `${BASE_URL}/legal`, lastmod: '2026-11-02', changefreq: 'yearly', priority: '0.3' });

  // ==========================================
  // 4. Generate sitemap.xml
  // ==========================================
  console.log('🗺️  Generating sitemap.xml...');
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsForSitemap
  .map(
    url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  writeHtmlFile(path.join(DIST_DIR, 'sitemap.xml'), sitemapContent);
  writeHtmlFile(path.join(ROOT_DIR, 'public', 'sitemap.xml'), sitemapContent);

  // ==========================================
  // 5. Generate robots.txt
  // ==========================================
  console.log('🤖 Generating robots.txt...');
  const robotsContent = `# Float Desktop Scratchpad Robots Configuration
User-agent: *
Allow: /

# Canonical XML Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

  writeHtmlFile(path.join(DIST_DIR, 'robots.txt'), robotsContent);
  writeHtmlFile(path.join(ROOT_DIR, 'public', 'robots.txt'), robotsContent);

  console.log(`✅ Prerender complete! Generated:`);
  console.log(`   - dist/index.html (Landing page with rich markup)`);
  console.log(`   - dist/blog/index.html (Blog index)`);
  BLOG_POSTS.forEach(p => {
    console.log(`   - dist/blog/${p.slug}/index.html`);
  });
  console.log(`   - dist/sitemap.xml (${urlsForSitemap.length} indexed URLs)`);
  console.log(`   - dist/robots.txt`);
}

runPrerender().catch(err => {
  console.error('❌ Prerender script failed:', err);
  process.exit(1);
});
