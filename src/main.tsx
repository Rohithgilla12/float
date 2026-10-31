import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LandingPage } from './components/LandingPage';
import { BlogIndex } from './components/BlogIndex';
import { BlogPostView } from './components/BlogPostView';
import { BLOG_POSTS } from './data/blogPosts';
import './index.css';

const Root: React.FC = () => {
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  const [fullscreenApp, setFullscreenApp] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'blog' | 'post'>('home');
  const [activeSlug, setActiveSlug] = useState<string>('');

  const syncRouteFromUrl = () => {
    const pathname = window.location.pathname;
    const search = new URLSearchParams(window.location.search);

    if (search.get('app') === 'true') {
      setFullscreenApp(true);
      return;
    }

    if (pathname.startsWith('/blog/')) {
      const slug = pathname.replace('/blog/', '').replace(/\/$/, '');
      if (slug) {
        setActiveSlug(slug);
        setCurrentRoute('post');
        return;
      }
    }

    if (pathname === '/blog' || pathname === '/blog/' || search.get('blog') === 'true') {
      const slugParam = search.get('post');
      if (slugParam) {
        setActiveSlug(slugParam);
        setCurrentRoute('post');
      } else {
        setCurrentRoute('blog');
      }
      return;
    }

    setCurrentRoute('home');
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
