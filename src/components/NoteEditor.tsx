import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Check,
  Copy,
  Lightbulb,
  Code2,
  Bold,
  Italic,
  Strikethrough,
} from 'lucide-react';
import { EditorBlock, parseMarkdownToBlocks, serializeBlocksToMarkdown } from '../utils/markdownBlocks';
import { SlashCommand } from '../types/note';
import { SlashCommandMenu } from './SlashCommandMenu';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  onOpenActions: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  content,
  onChange,
  onOpenActions,
}) => {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => parseMarkdownToBlocks(content));
  
  // Slash Command Menu State
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashPos, setSlashPos] = useState({ top: 60, left: 24 });
  const [targetBlockIndex, setTargetBlockIndex] = useState<number | null>(null);

  // Floating Selection Bubble Menu State
  const [bubbleMenu, setBubbleMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
    blockId: string;
  }>({ visible: false, x: 0, y: 0, text: '', blockId: '' });

  const containerRef = useRef<HTMLDivElement>(null);
  const blockInputRefs = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement | null }>({});
  const isInternalUpdate = useRef(false);

  // Sync external content changes (if not triggered internally)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setBlocks(parseMarkdownToBlocks(content));
  }, [content]);

  // Propagate block changes to parent markdown
  const notifyChange = useCallback((newBlocks: EditorBlock[]) => {
    isInternalUpdate.current = true;
    setBlocks(newBlocks);
    const md = serializeBlocksToMarkdown(newBlocks);
    onChange(md);
  }, [onChange]);

  // Focus helper
  const focusBlock = (id: string, selectEnd = true) => {
    setTimeout(() => {
      const el = blockInputRefs.current[id];
      if (el) {
        el.focus();
        if (selectEnd) {
          const len = el.value.length;
          el.setSelectionRange(len, len);
        }
      }
    }, 10);
  };

  // Toggle Task Checkbox
  const handleToggleTask = (index: number) => {
    const updated = [...blocks];
    if (updated[index] && updated[index].type === 'task') {
      updated[index] = {
        ...updated[index],
        checked: !updated[index].checked,
      };
      notifyChange(updated);
    }
  };

  // Handle Text Changes & Instant Markdown Transforms
  const handleBlockTextChange = (index: number, text: string) => {
    const block = blocks[index];
    if (!block) return;

    // Check for inline markdown shortcuts when typing space
    // 1. Heading 1: '# '
    if (text.startsWith('# ') && block.type !== 'h1') {
      const updated = [...blocks];
      updated[index] = { ...block, type: 'h1', content: text.slice(2) };
      notifyChange(updated);
      return;
    }
    // 2. Heading 2: '## '
    if (text.startsWith('## ') && block.type !== 'h2') {
      const updated = [...blocks];
      updated[index] = { ...block, type: 'h2', content: text.slice(3) };
      notifyChange(updated);
      return;
    }
    // 3. Heading 3: '### '
    if (text.startsWith('### ') && block.type !== 'h3') {
      const updated = [...blocks];
      updated[index] = { ...block, type: 'h3', content: text.slice(4) };
      notifyChange(updated);
      return;
    }
    // 4. Task: '[] ' or '- [ ] '
    if ((text.startsWith('[] ') || text.startsWith('- [ ] ') || text.startsWith('* [ ] ')) && block.type !== 'task') {
      const updated = [...blocks];
      const cleanText = text.replace(/^(?:\[\]|- \[ \]|[*]\s\[ \])\s*/, '');
      updated[index] = { ...block, type: 'task', checked: false, content: cleanText };
      notifyChange(updated);
      return;
    }
    // 5. Bullet: '- ' or '* '
    if ((text.startsWith('- ') || text.startsWith('* ')) && block.type !== 'bullet' && block.type !== 'task') {
      const updated = [...blocks];
      updated[index] = { ...block, type: 'bullet', content: text.slice(2) };
      notifyChange(updated);
      return;
    }
    // 6. Callout: '> '
    if (text.startsWith('> ') && block.type !== 'callout') {
      const updated = [...blocks];
      updated[index] = { ...block, type: 'callout', content: text.slice(2) };
      notifyChange(updated);
      return;
    }

    // Normal Text Update
    const updated = [...blocks];
    updated[index] = { ...block, content: text };
    notifyChange(updated);

    // Check for slash command trigger
    if (text.endsWith('/')) {
      const el = blockInputRefs.current[block.id];
      if (el && containerRef.current) {
        const elRect = el.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setSlashPos({
          top: elRect.bottom - containerRect.top + containerRef.current.scrollTop + 4,
          left: Math.max(16, elRect.left - containerRect.left),
        });
        setTargetBlockIndex(index);
        setSlashMenuOpen(true);
        setSlashQuery('');
      }
    } else if (slashMenuOpen && targetBlockIndex === index) {
      const lastSlashIdx = text.lastIndexOf('/');
      if (lastSlashIdx !== -1) {
        setSlashQuery(text.slice(lastSlashIdx + 1));
      } else {
        setSlashMenuOpen(false);
      }
    }
  };

  // Keyboard Navigation inside blocks
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // ⌘K: Raycast Actions Command Center
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      onOpenActions();
      return;
    }

    const block = blocks[index];
    if (!block) return;

    // Enter key: Create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      if (slashMenuOpen) return; // Allow slash menu to handle Enter

      e.preventDefault();

      // If in a task block:
      if (block.type === 'task') {
        // If current task is empty, convert it to a regular paragraph
        if (!block.content.trim()) {
          const updated = [...blocks];
          updated[index] = { ...block, type: 'paragraph', content: '' };
          notifyChange(updated);
          return;
        }

        // Spawn a new empty task item right below
        const newBlock: EditorBlock = {
          id: `block-${Date.now()}`,
          type: 'task',
          checked: false,
          content: '',
        };
        const updated = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
        notifyChange(updated);
        focusBlock(newBlock.id);
        return;
      }

      // If in a bullet list:
      if (block.type === 'bullet') {
        if (!block.content.trim()) {
          const updated = [...blocks];
          updated[index] = { ...block, type: 'paragraph', content: '' };
          notifyChange(updated);
          return;
        }
        const newBlock: EditorBlock = {
          id: `block-${Date.now()}`,
          type: 'bullet',
          content: '',
        };
        const updated = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
        notifyChange(updated);
        focusBlock(newBlock.id);
        return;
      }

      // Default: create a new paragraph below
      const newBlock: EditorBlock = {
        id: `block-${Date.now()}`,
        type: 'paragraph',
        content: '',
      };
      const updated = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
      notifyChange(updated);
      focusBlock(newBlock.id);
      return;
    }

    // Backspace on empty block: convert to paragraph or delete
    if (e.key === 'Backspace' && !block.content) {
      if (block.type !== 'paragraph') {
        e.preventDefault();
        const updated = [...blocks];
        updated[index] = { ...block, type: 'paragraph', content: '' };
        notifyChange(updated);
        return;
      } else if (blocks.length > 1) {
        e.preventDefault();
        const prevBlock = blocks[index - 1];
        const updated = blocks.filter((_, i) => i !== index);
        notifyChange(updated);
        if (prevBlock) {
          focusBlock(prevBlock.id, true);
        }
        return;
      }
    }

    // Arrow Up: navigate to previous block
    if (e.key === 'ArrowUp') {
      const el = blockInputRefs.current[block.id];
      if (el && el.selectionStart === 0 && index > 0) {
        e.preventDefault();
        focusBlock(blocks[index - 1].id, true);
      }
    }

    // Arrow Down: navigate to next block
    if (e.key === 'ArrowDown') {
      const el = blockInputRefs.current[block.id];
      if (el && el.selectionStart === el.value.length && index < blocks.length - 1) {
        e.preventDefault();
        focusBlock(blocks[index + 1].id, false);
      }
    }
  };

  // Slash Command Selected
  const handleSelectSlashCommand = (cmd: SlashCommand) => {
    if (targetBlockIndex === null || !blocks[targetBlockIndex]) return;

    const block = blocks[targetBlockIndex];
    let cleanContent = block.content;
    const slashIdx = cleanContent.lastIndexOf('/');
    if (slashIdx !== -1) {
      cleanContent = cleanContent.slice(0, slashIdx);
    }

    const updated = [...blocks];

    switch (cmd.id) {
      case 'todo':
        updated[targetBlockIndex] = {
          ...block,
          type: 'task',
          checked: false,
          content: cleanContent,
        };
        break;
      case 'h1':
        updated[targetBlockIndex] = { ...block, type: 'h1', content: cleanContent };
        break;
      case 'h2':
        updated[targetBlockIndex] = { ...block, type: 'h2', content: cleanContent };
        break;
      case 'h3':
        updated[targetBlockIndex] = { ...block, type: 'h3', content: cleanContent };
        break;
      case 'bullet':
        updated[targetBlockIndex] = { ...block, type: 'bullet', content: cleanContent };
        break;
      case 'code':
        updated[targetBlockIndex] = {
          ...block,
          type: 'code',
          content: cleanContent || '// your code here',
          language: 'typescript',
        };
        break;
      case 'callout':
        updated[targetBlockIndex] = {
          ...block,
          type: 'callout',
          content: cleanContent || '💡 Important thought',
        };
        break;
      case 'divider':
        updated[targetBlockIndex] = { ...block, type: 'divider', content: '' };
        // Insert a paragraph below divider
        updated.splice(targetBlockIndex + 1, 0, {
          id: `block-${Date.now()}`,
          type: 'paragraph',
          content: '',
        });
        break;
      case 'timestamp':
        updated[targetBlockIndex] = {
          ...block,
          content: `${cleanContent} 📅 ${new Date().toLocaleString()}`,
        };
        break;
      default:
        break;
    }

    notifyChange(updated);
    setSlashMenuOpen(false);
    focusBlock(block.id);
  };

  // Floating Selection Bubble Menu Detection
  const handleSelectText = (blockId: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setBubbleMenu(prev => ({ ...prev, visible: false }));
      return;
    }

    const text = selection.toString();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setBubbleMenu({
        visible: true,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + containerRef.current.scrollTop - 42,
        text,
        blockId,
      });
    }
  };

  // Bubble Menu Formatting Actions
  const applyInlineFormat = (format: 'bold' | 'italic' | 'code' | 'strike') => {
    if (!bubbleMenu.blockId || !bubbleMenu.text) return;
    const blockIndex = blocks.findIndex(b => b.id === bubbleMenu.blockId);
    if (blockIndex === -1) return;

    const block = blocks[blockIndex];
    let wrapper = '**';
    if (format === 'italic') wrapper = '*';
    if (format === 'code') wrapper = '`';
    if (format === 'strike') wrapper = '~~';

    const formatted = `${wrapper}${bubbleMenu.text}${wrapper}`;
    const newContent = block.content.replace(bubbleMenu.text, formatted);
    const updated = [...blocks];
    updated[blockIndex] = { ...block, content: newContent };
    notifyChange(updated);
    setBubbleMenu(prev => ({ ...prev, visible: false }));
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col p-5 overflow-y-auto relative text-[var(--text-primary)] select-text"
      onClick={e => {
        // If clicking blank space at the bottom of the editor, focus the last block or create a new one
        if (e.target === containerRef.current) {
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock && !lastBlock.content && lastBlock.type === 'paragraph') {
            focusBlock(lastBlock.id);
          } else {
            const newBlock: EditorBlock = {
              id: `block-${Date.now()}`,
              type: 'paragraph',
              content: '',
            };
            const updated = [...blocks, newBlock];
            notifyChange(updated);
            focusBlock(newBlock.id);
          }
        }
      }}
    >
      {/* Block List: Unified Rendered WYSIWYG */}
      <div className="w-full space-y-1 pb-16">
        {blocks.map((block, idx) => {
          // 1. Heading 1
          if (block.type === 'h1') {
            return (
              <div key={block.id} className="relative group my-2">
                <input
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  type="text"
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Heading 1..."
                  className="w-full bg-transparent font-bold text-xl tracking-tight text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] border-none p-0"
                />
              </div>
            );
          }

          // 2. Heading 2
          if (block.type === 'h2') {
            return (
              <div key={block.id} className="relative group my-1.5">
                <input
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  type="text"
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Heading 2..."
                  className="w-full bg-transparent font-bold text-lg text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] border-none p-0"
                />
              </div>
            );
          }

          // 3. Heading 3
          if (block.type === 'h3') {
            return (
              <div key={block.id} className="relative group my-1">
                <input
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  type="text"
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Heading 3..."
                  className="w-full bg-transparent font-semibold text-base text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] border-none p-0"
                />
              </div>
            );
          }

          // 4. Task Checklist Block
          if (block.type === 'task') {
            return (
              <div key={block.id} className="flex items-start gap-2.5 my-1.5 group select-none">
                {/* Interactive Clickable Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleTask(idx)}
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-xs font-bold transition-all shrink-0 btn-press cursor-pointer ${
                    block.checked
                      ? 'border border-[var(--accent-color)] bg-[var(--accent-color)] text-white shadow-sm'
                      : 'border border-[var(--border-highlight)] bg-transparent text-transparent hover:border-[var(--accent-color)]'
                  }`}
                  title="Toggle task (Click)"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>

                {/* Editable Task Label */}
                <input
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  type="text"
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Task item..."
                  className={`w-full bg-transparent outline-none text-[13px] leading-relaxed transition-all placeholder-[var(--text-muted)] border-none p-0 ${
                    block.checked
                      ? 'line-through text-[var(--text-muted)]'
                      : 'text-[var(--text-primary)]'
                  }`}
                />
              </div>
            );
          }

          // 5. Bullet List
          if (block.type === 'bullet') {
            return (
              <div key={block.id} className="flex items-start gap-2.5 my-1 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] mt-2 shrink-0" />
                <input
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  type="text"
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="List item..."
                  className="w-full bg-transparent text-[13px] text-[var(--text-secondary)] outline-none placeholder-[var(--text-muted)] border-none p-0"
                />
              </div>
            );
          }

          // 6. Code Block
          if (block.type === 'code') {
            return (
              <div
                key={block.id}
                className="my-3 rounded-xl bg-[var(--code-bg)] border border-[var(--border-subtle)] overflow-hidden shadow-sm"
              >
                <div className="px-3 py-1.5 border-b border-[var(--border-subtle)] bg-black/10 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                    <span>{block.language || 'typescript'}</span>
                  </span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(block.content)}
                    className="btn-press px-2 py-0.5 rounded text-[10px] hover:text-[var(--text-primary)] hover:bg-white/10 flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <textarea
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  rows={Math.max(2, block.content.split('\n').length)}
                  className="w-full p-3 bg-transparent font-mono text-xs leading-relaxed text-[var(--text-primary)] outline-none resize-none border-none selection:bg-[var(--accent-color)]/30"
                  spellCheck="false"
                />
              </div>
            );
          }

          // 7. Callout Block
          if (block.type === 'callout') {
            return (
              <div
                key={block.id}
                className="my-2.5 p-3 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-color)]/25 text-xs flex items-start gap-2.5 shadow-sm"
              >
                <Lightbulb className="w-4 h-4 text-[var(--accent-color)] mt-0.5 shrink-0" />
                <input
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  type="text"
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Callout thought..."
                  className="w-full bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] border-none p-0 font-medium"
                />
              </div>
            );
          }

          // 8. Divider Block
          if (block.type === 'divider') {
            return (
              <div key={block.id} className="my-3 py-1 cursor-pointer">
                <hr className="border-[var(--border-subtle)]" />
              </div>
            );
          }

          // 9. Standard Paragraph
          return (
            <div key={block.id} className="relative group my-0.5">
              <input
                ref={el => (blockInputRefs.current[block.id] = el)}
                type="text"
                value={block.content}
                onChange={e => handleBlockTextChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                onSelect={() => handleSelectText(block.id)}
                placeholder={idx === 0 ? "Start typing note or press '/' for commands..." : ''}
                className="w-full bg-transparent text-[13px] leading-relaxed text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] border-none p-0"
              />
            </div>
          );
        })}
      </div>

      {/* FLOATING TEXT SELECTION BUBBLE TOOLBAR */}
      {bubbleMenu.visible && (
        <div
          className="absolute z-40 -translate-x-1/2 flex items-center gap-0.5 p-1 rounded-xl bg-[var(--bg-window-solid)] border border-[var(--border-highlight)] shadow-2xl backdrop-blur-md animate-fadeIn"
          style={{ top: bubbleMenu.y, left: bubbleMenu.x }}
        >
          <button
            onClick={() => applyInlineFormat('bold')}
            title="Bold (⌘B)"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] btn-press"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyInlineFormat('italic')}
            title="Italic (⌘I)"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] btn-press"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyInlineFormat('code')}
            title="Inline Code"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] btn-press"
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyInlineFormat('strike')}
            title="Strikethrough"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] btn-press"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* RAYCAST SLASH COMMAND MENU POPUP */}
      <SlashCommandMenu
        isOpen={slashMenuOpen}
        onClose={() => setSlashMenuOpen(false)}
        onSelectCommand={handleSelectSlashCommand}
        searchQuery={slashQuery}
        onSearchChange={setSlashQuery}
        position={slashPos}
      />
    </div>
  );
};
