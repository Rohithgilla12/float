import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LandingPage } from './components/LandingPage';
import { BlogIndex } from './components/BlogIndex';
import { BlogPostView } from './components/BlogPostView';
import { LegalPage } from './components/LegalPage';
import { BLOG_POSTS } from './data/blogPosts';
import './index.css';

const getInitialRouteState = () => {
  if (typeof window === 'undefined') {
    return { route: 'home' as const, slug: '', fullscreen: false };
  }
  const pathname = window.location.pathname;
  const search = new URLSearchParams(window.location.search);

  if (search.get('app') === 'true') {
    return { route: 'home' as const, slug: '', fullscreen: true };
  }

  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '').replace(/\/$/, '');
    if (slug) {
      return { route: 'post' as const, slug, fullscreen: false };
    }
  }

  if (pathname === '/legal' || pathname === '/legal/') {
    return { route: 'legal' as const, slug: '', fullscreen: false };
  }

  if (pathname === '/blog' || pathname === '/blog/' || search.get('blog') === 'true') {
    const slugParam = search.get('post');
    if (slugParam) {
      return { route: 'post' as const, slug: slugParam, fullscreen: false };
    }
    return { route: 'blog' as const, slug: '', fullscreen: false };
  }

  return { route: 'home' as const, slug: '', fullscreen: false };
};

const Root: React.FC = () => {
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  const initial = getInitialRouteState();
  const [fullscreenApp, setFullscreenApp] = useState(initial.fullscreen);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'blog' | 'post' | 'legal'>(initial.route);
  const [activeSlug, setActiveSlug] = useState<string>(initial.slug);

  const syncRouteFromUrl = () => {
    const state = getInitialRouteState();
    setFullscreenApp(state.fullscreen);
    setCurrentRoute(state.route);
    setActiveSlug(state.slug);
  };

  useEffect(() => {
    syncRouteFromUrl();
    window.addEventListener('popstate', syncRouteFromUrl);
    return () => window.removeEventListener('popstate', syncRouteFromUrl);
  }, []);

  // Inside Tauri Desktop Window, ALWAYS render the native floating App
  if (isTauri) {
    document.documentElement.classList.add('overflow-hidden');
    document.body.classList.add('overflow-hidden', 'bg-transparent', 'select-none');
    return <App />;
  }

  // On Web: ensure body is scrollable
  document.documentElement.classList.remove('overflow-hidden');
  document.body.classList.remove('overflow-hidden', 'bg-transparent', 'select-none');

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentRoute('home');
    setFullscreenApp(false);
  };

  const navigateToBlog = () => {
    window.history.pushState({}, '', '/blog');
    setCurrentRoute('blog');
  };

  const navigateToPost = (slug: string) => {
    window.history.pushState({}, '', `/blog/${slug}`);
    setActiveSlug(slug);
    setCurrentRoute('post');
  };

  // Fullscreen interactive app mode
  if (fullscreenApp) {
    return (
      <div className="relative w-screen h-screen bg-[#0C0D0E]">
        <button
          onClick={navigateToHome}
          className="fixed top-3 right-3 z-50 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white/80 hover:text-white border border-white/20 text-xs font-mono backdrop-blur-md transition-all shadow-2xl flex items-center gap-1.5 cursor-pointer"
        >
          <span>&larr;</span>
          <span>Landing Page</span>
        </button>
        <App />
      </div>
    );
  }

  if (currentRoute === 'legal') {
    return <LegalPage onBackToHome={navigateToHome} />;
  }

  // Blog Post View
  if (currentRoute === 'post') {
    const post = BLOG_POSTS.find(p => p.slug === activeSlug) || BLOG_POSTS[0];
    return (
      <BlogPostView
        post={post}
        onBackToBlog={navigateToBlog}
        onBackToHome={navigateToHome}
      />
    );
  }

  // Blog Listing View
  if (currentRoute === 'blog') {
    return (
      <BlogIndex
        onSelectPost={navigateToPost}
        onBackToLanding={navigateToHome}
      />
    );
  }

  // Landing Page
  return (
    <LandingPage
      onOpenAppFullscreen={() => setFullscreenApp(true)}
      onOpenBlog={navigateToBlog}
      onSelectBlogPost={navigateToPost}
    />
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
