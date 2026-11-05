import React, { useEffect } from 'react';
import { BlogPost } from '../data/blogPosts';
import { ArrowLeft, Calendar, Clock, Share2, Download, Sparkles } from 'lucide-react';
import { renderMarkdownToHtml } from '../utils/markdownRenderer';

interface BlogPostViewProps {
  post: BlogPost;
  onBackToBlog: () => void;
  onBackToHome: () => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({
  post,
  onBackToBlog,
  onBackToHome,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `${post.metaTitle} | Float`;

    // Dynamically sync meta description and canonical for client-side navigation
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', post.description);
    }
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `https://float.gilla.fun/blog/${post.slug}`);
    }
  }, [post]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };


  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#ECEFF4] font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 via-purple-500/5 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0C0D0E]/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="/blog"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                e.preventDefault();
                onBackToBlog();
              }
            }}
            className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs text-white/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share article"
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href="https://github.com/Rohithgilla12/float/releases/latest"
              data-umami-event="download"
              data-umami-event-placement="blog-header"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1 no-underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download free</span>
            </a>
          </div>
        </div>
      </header>

      {/* Article Container */}
      <main className="relative z-10 py-16 px-6 max-w-4xl mx-auto">
        {/* Meta Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs font-mono text-white/60">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.date}</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.18]">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed pt-2">
            {post.description}
          </p>

          <div className="flex items-center gap-3 pt-6 border-t border-white/5">
            <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full border border-white/10" />
            <div>
              <div className="text-xs font-bold text-white">{post.author.name}</div>
              <div className="text-[11px] text-white/50 font-mono">{post.author.role}</div>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div
          className="mt-12 text-sm sm:text-base text-white/80 leading-[1.8] space-y-4"
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(post.content) }}
        />

        {/* In-Article Call to Action Card */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent border-2 border-amber-500/40 relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Experience The Difference</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            Ready to reclaim your focus with Float?
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed max-w-xl">
            Summon with <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs text-white">⌥Space</kbd>, pin above full-screen apps with <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-xs text-white">⌥P</kbd>, and save raw markdown notes directly to your disk.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="https://github.com/Rohithgilla12/float/releases/latest"
              data-umami-event="download"
              data-umami-event-placement="blog"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer no-underline"
            >
              <Download className="w-4 h-4" />
              <span>Download for Mac &bull; Free</span>
            </a>

            <a
              href="/"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                  e.preventDefault();
                  onBackToHome();
                }
              }}
              className="px-6 py-3 rounded-xl border border-white/15 hover:bg-white/5 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Try Live Interactive Sandbox</span>
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <a
            href="/blog"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                e.preventDefault();
                onBackToBlog();
              }
            }}
            className="text-xs text-white/50 hover:text-amber-400 transition-colors font-mono cursor-pointer"
          >
            &larr; Back to all blog articles
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-xs text-white/40 font-mono space-y-2">
        <p>Float Blog &bull; High-Velocity Desktop Scratchpad for macOS</p>
      </footer>

    </div>
  );
};
