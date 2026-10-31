import React, { useState } from 'react';
import { BLOG_POSTS } from '../data/blogPosts';
import { Search, Calendar, Clock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface BlogIndexProps {
  onSelectPost: (slug: string) => void;
  onBackToLanding: () => void;
}

export const BlogIndex: React.FC<BlogIndexProps> = ({ onSelectPost, onBackToLanding }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Comparisons', 'Guides', 'Workflows'];

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.description.toLowerCase().includes(search.toLowerCase()) ||
      post.targetKeyword.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#ECEFF4] font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 via-purple-500/5 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0C0D0E]/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToLanding}>
            <img src="/favicon.png" alt="Float Icon" className="w-7 h-7 rounded-lg border border-white/10" />
            <span className="font-bold text-white text-base tracking-tight">Float Blog</span>
          </div>

          <button
            onClick={onBackToLanding}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs text-white/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 mb-6 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GUIDES, COMPARISONS & PRODUCTIVITY ESSAYS</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Crafting the fastest desktop note experience for macOS.
        </h1>
        <p className="mt-4 text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          Deep-dives into macOS windowing architectures, zero-friction markdown capture, and workflow optimizations for power users.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides, keywords, or topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-white/5 text-white/60 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Cards Grid */}
      <section className="relative z-10 py-12 px-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <article
                key={post.slug}
                onClick={() => onSelectPost(post.slug)}
                className="p-7 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/40 hover:bg-white/[0.04] transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs text-white/50 mb-3 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-400">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-white/40" />
                      <span>{post.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white/40" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  {post.title}
                </h2>

                <p className="mt-3 text-xs sm:text-sm text-white/60 leading-relaxed line-clamp-2">
                  {post.description}
                </p>

                <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <img src={post.author.avatar} alt={post.author.name} className="w-5 h-5 rounded-full" />
                    <span className="text-white/70">{post.author.name}</span>
                  </div>

                  <span className="text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-16 text-white/40 font-mono text-xs">
              No articles match your query "{search}".
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-xs text-white/40 font-mono space-y-3">
        <p>Float Blog &bull; High-Velocity Desktop Scratchpad for macOS</p>
      </footer>

    </div>
  );
};
