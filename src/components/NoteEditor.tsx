import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
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
import { haptics } from '../utils/audioHaptics';
import { evaluateMathExpression } from '../utils/mathEvaluator';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  onOpenActions: () => void;
  onTaskCheckBurst?: (x: number, y: number) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  content,
  onChange,
  onOpenActions,
  onTaskCheckBurst,
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
    start: number;
    end: number;
    blockId: string;
  }>({ visible: false, x: 0, y: 0, text: '', start: 0, end: 0, blockId: '' });

  // Each block is its own textarea, so a native selection can't span the note.
  // Selecting the whole note is a separate mode, held while the hidden input has focus.
  const [wholeNoteSelected, setWholeNoteSelected] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const blockInputRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});
  const lastFocusedInput = useRef<HTMLTextAreaElement | null>(null);
  const wholeNoteInput = useRef<HTMLTextAreaElement>(null);
  const wholeNoteUndo = useRef<{ before: EditorBlock[]; after: string } | null>(null);
  const pendingCaretAtEnd = useRef<string | null>(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  const isInternalUpdate = useRef(false);

  // Auto-resize single textarea to fit its text height
  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(24, el.scrollHeight)}px`;
  }, []);

  // Sync external content changes (e.g. initial mount or switching active note)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const parsed = parseMarkdownToBlocks(content);
    setBlocks(parsed);
    setWholeNoteSelected(false);
    wholeNoteUndo.current = null;

    // Safely size textareas without collapsing container scroll
    requestAnimationFrame(() => {
      Object.values(blockInputRefs.current).forEach(el => {
        if (el) {
          el.style.height = 'auto';
          el.style.height = `${Math.max(24, el.scrollHeight)}px`;
        }
      });
    });
  }, [content]);

  // Propagate block changes to parent markdown
  const notifyChange = useCallback((newBlocks: EditorBlock[]) => {
    isInternalUpdate.current = true;
    setBlocks(newBlocks);
    const md = serializeBlocksToMarkdown(newBlocks);
    onChange(md);
  }, [onChange]);

  const selectWholeNote = useCallback(() => {
    const proxy = wholeNoteInput.current;
    if (!proxy) return;
    setBubbleMenu(prev => ({ ...prev, visible: false }));
    setSlashMenuOpen(false);
    setWholeNoteSelected(true);
    // The hidden input holds the note's markdown, fully selected, so native
    // copy, cut, paste, typing, and IME all act on the whole note.
    proxy.value = serializeBlocksToMarkdown(blocksRef.current);
    proxy.focus({ preventScroll: true });
    proxy.select();
  }, []);

  const replaceWholeNote = (next: EditorBlock[]) => {
    const before = blocksRef.current;
    setWholeNoteSelected(false);
    notifyChange(next);
    wholeNoteUndo.current = { before, after: serializeBlocksToMarkdown(next) };
    const target = [...next].reverse().find(b => b.type !== 'divider');
    pendingCaretAtEnd.current = target?.id ?? null;
  };

  const replaceWholeNoteWithText = (text: string) => {
    replaceWholeNote([{ id: `block-${Date.now()}`, type: 'paragraph', content: text }]);
  };

  const handleWholeNoteInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!wholeNoteSelected || (e.nativeEvent as InputEvent).isComposing) return;
    replaceWholeNoteWithText(e.target.value);
  };

  const handleWholeNotePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    replaceWholeNote(parseMarkdownToBlocks(e.clipboardData.getData('text')));
  };

  const handleWholeNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      return;
    }
    if (e.key === 'Escape') {
      // Keep App's Escape handler from hiding the window on this press.
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.blur();
      return;
    }
    if (e.key.startsWith('Arrow') && !e.shiftKey) {
      e.preventDefault();
      setWholeNoteSelected(false);
      const toStart = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
      const target = toStart ? blocks[0] : blocks[blocks.length - 1];
      if (target) focusBlock(target.id, !toStart);
    }
  };

  // Undo a whole-note replace, as long as nothing has changed since. Native
  // textarea undo can't do this: the replaced blocks were separate elements.
  const undoWholeNoteReplace = (e: React.KeyboardEvent) => {
    const snapshot = wholeNoteUndo.current;
    const isUndo = (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z';
    if (!isUndo || !snapshot || serializeBlocksToMarkdown(blocks) !== snapshot.after) return false;
    e.preventDefault();
    wholeNoteUndo.current = null;
    notifyChange(snapshot.before);
    const target = [...snapshot.before].reverse().find(b => b.type !== 'divider');
    pendingCaretAtEnd.current = target?.id ?? null;
    return true;
  };

  // Focus the replacement block in the same commit, so a fast second keystroke
  // can't land in the hidden input.
  useLayoutEffect(() => {
    const id = pendingCaretAtEnd.current;
    if (!id) return;
    pendingCaretAtEnd.current = null;
    const el = blockInputRefs.current[id];
    if (!el) return;
    el.focus();
    autoResize(el);
    el.setSelectionRange(el.value.length, el.value.length);
  });

  // With nothing focused (after Escape, or before the first click), ⌘A would
  // hit the unselectable body and do nothing.
  useEffect(() => {
    const handleBodySelectAll = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && active !== document.body) return;
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectWholeNote();
      }
    };
    window.addEventListener('keydown', handleBodySelectAll);
    return () => window.removeEventListener('keydown', handleBodySelectAll);
  }, [selectWholeNote]);

  // When the window is summoned with nothing focused, put the caret back where
  // it was so typing lands in the note. A textarea keeps its selection on blur.
  useEffect(() => {
    const restoreCaret = () => {
      const active = document.activeElement;
      if (active && active !== document.body) return;
      const last = lastFocusedInput.current;
      const inputs = containerRef.current?.querySelectorAll<HTMLTextAreaElement>('textarea:not([aria-hidden])');
      const target = last?.isConnected ? last : inputs?.[inputs.length - 1];
      target?.focus();
    };
    window.addEventListener('focus', restoreCaret);
    return () => window.removeEventListener('focus', restoreCaret);
  }, []);

  // Focus helper
  const focusBlock = (id: string, selectEnd = true) => {
    setTimeout(() => {
      const el = blockInputRefs.current[id];
      if (el) {
        el.focus();
        autoResize(el);
        if (selectEnd) {
          const len = el.value.length;
          el.setSelectionRange(len, len);
        } else {
          el.setSelectionRange(0, 0);
        }
      }
    }, 20);
  };

  // Toggle Task Checkbox
  const handleToggleTask = (index: number, e?: React.MouseEvent) => {
    const updated = [...blocks];
    if (updated[index] && updated[index].type === 'task') {
      const willBeChecked = !updated[index].checked;
      updated[index] = {
        ...updated[index],
        checked: willBeChecked,
      };
      notifyChange(updated);

      if (willBeChecked) {
        haptics.playCheck();
        if (e && onTaskCheckBurst) {
          onTaskCheckBurst(e.clientX, e.clientY);
        }
      } else {
        haptics.playUncheck();
      }
    }
  };

  // Forward trackpad/wheel scrolls to container so textareas never trap scroll
  const handleTextareaWheel = (e: React.WheelEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight <= el.clientHeight) {
      if (containerRef.current) {
        containerRef.current.scrollTop += e.deltaY;
      }
    }
  };

  // Handle Text Changes & Instant Markdown Transforms
  const handleBlockTextChange = (index: number, text: string) => {
    const block = blocks[index];
    if (!block) return;

    // Immediately size active textarea
    const currentEl = blockInputRefs.current[block.id];
    if (currentEl) {
      currentEl.style.height = 'auto';
      currentEl.style.height = `${Math.max(24, currentEl.scrollHeight)}px`;
    }

    // Check for inline markdown shortcuts when typing space
    // 1. Heading 1: '# '
    if (text.startsWith('# ') && block.type !== 'h1') {
      const updated = [...blocks];
      updated[index] = { ...block, type: 'h1', content: text.slice(2) };
      notifyChange(updated);
      focusBlock(block.id);
      return;
    }
    // 2. Heading 2: '## '
    if (text.startsWith('## ') && block.type !== 'h2') {
      const updated = [...blocks];
      updated[index] = { ...block, type: 'h2', content: text.slice(3) };
      notifyChange(updated);
      focusBlock(block.id);
      return;
    }
    // 3. Heading 3: '### '
    if (text.startsWith('### ') && block.type !== 'h3') {
      const updated = [...blocks];
      updated[index] = { ...block, type: 'h3', content: text.slice(4) };
      notifyChange(updated);
      focusBlock(block.id);
      return;
    }
    // 4. Task: '[] ' or '- [ ] '
    if ((text.startsWith('[] ') || text.startsWith('- [ ] ') || text.startsWith('* [ ] ')) && block.type !== 'task') {
      const updated = [...blocks];
      const cleanText = text.replace(/^(?:\[\]|- \[ \]|[*]\s\[ \])\s*/, '');
      updated[index] = { ...block, type: 'task', checked: false, content: cleanText };
      notifyChange(updated);
      focusBlock(block.id);
      return;
    }
    // 5. Bullet: '- ' or '* '
    if ((text.startsWith('- ') || text.startsWith('* ')) && block.type !== 'bullet' && block.type !== 'task') {
      const updated = [...blocks];
      updated[index] = { ...block, type: 'bullet', content: text.slice(2) };
      notifyChange(updated);
      focusBlock(block.id);
      return;
    }
    // 6. Blockquote: '> '
    if (text.startsWith('> ') && block.type !== 'quote' && block.type !== 'callout') {
      const updated = [...blocks];
      updated[index] = { ...block, type: 'quote', content: text.slice(2) };
      notifyChange(updated);
      focusBlock(block.id);
      return;
    }

    // Inline Math / Calculation Evaluation
    if (text.endsWith('=') || text.endsWith('= ')) {
      const math = evaluateMathExpression(text);
      if (math) {
        haptics.playSuccess();
        const sep = text.endsWith('= ') ? '' : ' ';
        text = `${text}${sep}${math.formattedResult}`;
      }
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
        const topOffset = elRect.bottom - containerRect.top + containerRef.current.scrollTop + 4;
        
        // Prevent slash popover from overflowing the bottom
        setSlashPos({
          top: Math.min(topOffset, containerRect.height + containerRef.current.scrollTop - 260),
          left: Math.max(16, Math.min(containerRect.width - 290, elRect.left - containerRect.left)),
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

  // Keyboard Navigation & Splitting/Merging
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // ⌘K: Actions Command Center
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      onOpenActions();
      return;
    }

    if (undoWholeNoteReplace(e)) return;

    // ⌘A: native select-all within the block first; once the block is fully
    // selected (or empty), a further ⌘A selects the whole note.
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'a' && blocks.length > 1) {
      const el = e.currentTarget;
      if (el.selectionStart === 0 && el.selectionEnd === el.value.length) {
        e.preventDefault();
        selectWholeNote();
        return;
      }
    }

    const block = blocks[index];
    if (!block) return;

    // Inside a Code Block:
    if (block.type === 'code') {
      // ⌘Enter / Ctrl+Enter: Exit code block and spawn a paragraph below
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const newBlock: EditorBlock = {
          id: `block-${Date.now()}-${Math.random()}`,
          type: 'paragraph',
          content: '',
        };
        const updated = [
          ...blocks.slice(0, index + 1),
          newBlock,
          ...blocks.slice(index + 1),
        ];
        notifyChange(updated);
        focusBlock(newBlock.id);
        return;
      }

      // Normal Enter inside code: let native textarea newline happen
      if (e.key === 'Enter') {
        return;
      }
    }

    // Tab key: Insert 2 spaces instead of losing focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = blockInputRefs.current[block.id];
      if (el) {
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        const newContent = block.content.substring(0, start) + '  ' + block.content.substring(end);
        const updated = [...blocks];
        updated[index] = { ...block, content: newContent };
        notifyChange(updated);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + 2, start + 2);
          autoResize(el);
        }, 10);
      }
      return;
    }

    // Enter key: Split block or create new one below
    if (e.key === 'Enter' && !e.shiftKey) {
      if (slashMenuOpen) return; // Allow slash menu to handle Enter

      e.preventDefault();

      const el = blockInputRefs.current[block.id];
      const cursorPos = el ? (el.selectionStart ?? block.content.length) : block.content.length;
      const currentPart = block.content.slice(0, cursorPos);
      const nextPart = block.content.slice(cursorPos);

      // If in a task block:
      if (block.type === 'task') {
        if (!block.content.trim()) {
          const updated = [...blocks];
          updated[index] = { ...block, type: 'paragraph', content: '' };
          notifyChange(updated);
          return;
        }

        const newBlock: EditorBlock = {
          id: `block-${Date.now()}-${Math.random()}`,
          type: 'task',
          checked: false,
          content: nextPart,
        };
        const updated = [
          ...blocks.slice(0, index),
          { ...block, content: currentPart },
          newBlock,
          ...blocks.slice(index + 1),
        ];
        notifyChange(updated);
        focusBlock(newBlock.id, false);
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
          id: `block-${Date.now()}-${Math.random()}`,
          type: 'bullet',
          content: nextPart,
        };
        const updated = [
          ...blocks.slice(0, index),
          { ...block, content: currentPart },
          newBlock,
          ...blocks.slice(index + 1),
        ];
        notifyChange(updated);
        focusBlock(newBlock.id, false);
        return;
      }

      // If in a callout or quote:
      if (block.type === 'callout' || block.type === 'quote') {
        if (!block.content.trim()) {
          const updated = [...blocks];
          updated[index] = { ...block, type: 'paragraph', content: '' };
          notifyChange(updated);
          return;
        }
      }

      // Default: create a new paragraph below with the remaining text
      const newBlock: EditorBlock = {
        id: `block-${Date.now()}-${Math.random()}`,
        type: 'paragraph',
        content: nextPart,
      };
      const updated = [
        ...blocks.slice(0, index),
        { ...block, content: currentPart },
        newBlock,
        ...blocks.slice(index + 1),
      ];
      notifyChange(updated);
      focusBlock(newBlock.id, false);
      return;
    }

    // Backspace: Merge with previous block or unformat special block
    if (e.key === 'Backspace') {
      const el = blockInputRefs.current[block.id];
      const cursorPos = el ? el.selectionStart ?? 0 : 0;
      const selectionEnd = el ? el.selectionEnd ?? 0 : 0;

      // When cursor is at the very beginning of the block:
      if (cursorPos === 0 && selectionEnd === 0) {
        // If special block, unformat to regular paragraph first
        if (block.type !== 'paragraph') {
          e.preventDefault();
          const updated = [...blocks];
          updated[index] = { ...block, type: 'paragraph' };
          notifyChange(updated);
          return;
        }

        // If it's a paragraph and there is a previous block, merge into it
        if (index > 0) {
          e.preventDefault();
          const prevBlock = blocks[index - 1];
          const prevLen = prevBlock.content.length;
          const mergedContent = prevBlock.content + block.content;

          const updated = [
            ...blocks.slice(0, index - 1),
            { ...prevBlock, content: mergedContent },
            ...blocks.slice(index + 1),
          ];
          notifyChange(updated);
          setTimeout(() => {
            const prevEl = blockInputRefs.current[prevBlock.id];
            if (prevEl) {
              prevEl.focus();
              autoResize(prevEl);
              prevEl.setSelectionRange(prevLen, prevLen);
            }
          }, 15);
          return;
        }
      }
    }

    // Arrow Up: navigate to previous block if on first line
    if (e.key === 'ArrowUp') {
      const el = blockInputRefs.current[block.id];
      if (el && el.selectionStart === 0 && index > 0) {
        e.preventDefault();
        focusBlock(blocks[index - 1].id, true);
      }
    }

    // Arrow Down: navigate to next block if on last line
    if (e.key === 'ArrowDown') {
      const el = blockInputRefs.current[block.id];
      if (el && el.selectionStart === el.value.length && index < blocks.length - 1) {
        e.preventDefault();
        focusBlock(blocks[index + 1].id, false);
      }
    }
  };

  // Handle Markdown Paste
  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;

    // Inside a code block, let native multiline paste work
    if (blocks[index]?.type === 'code') {
      return;
    }

    // If pasted text contains multiple lines, parse as markdown blocks
    if (text.includes('\n')) {
      e.preventDefault();
      const pastedBlocks = parseMarkdownToBlocks(text);
      const updated = [
        ...blocks.slice(0, index),
        ...pastedBlocks,
        ...blocks.slice(index + 1),
      ];
      notifyChange(updated);
      focusBlock(pastedBlocks[pastedBlocks.length - 1].id, true);
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
        updated[targetBlockIndex] = {
          ...block,
          type: 'h1',
          content: cleanContent,
        };
        break;

      case 'h2':
        updated[targetBlockIndex] = {
          ...block,
          type: 'h2',
          content: cleanContent,
        };
        break;

      case 'h3':
        updated[targetBlockIndex] = {
          ...block,
          type: 'h3',
          content: cleanContent,
        };
        break;

      case 'bullet':
        updated[targetBlockIndex] = {
          ...block,
          type: 'bullet',
          content: cleanContent,
        };
        break;

      case 'code':
        updated[targetBlockIndex] = {
          ...block,
          type: 'code',
          language: 'typescript',
          content: cleanContent || '// Write code here\n',
        };
        break;

      case 'callout':
        updated[targetBlockIndex] = {
          ...block,
          type: 'callout',
          content: cleanContent,
        };
        break;

      case 'quote':
        updated[targetBlockIndex] = {
          ...block,
          type: 'quote',
          content: cleanContent,
        };
        break;

      case 'divider':
        updated[targetBlockIndex] = {
          ...block,
          type: 'divider',
          content: '',
        };
        updated.splice(targetBlockIndex + 1, 0, {
          id: `block-${Date.now()}`,
          type: 'paragraph',
          content: '',
        });
        break;

      case 'timestamp': {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        updated[targetBlockIndex] = {
          ...block,
          content: `${cleanContent}${now} `,
        };
        break;
      }

      default:
        break;
    }

    notifyChange(updated);
    setSlashMenuOpen(false);
    focusBlock(block.id);
  };

  // Handle Text Selection for Floating Bubble Menu using textarea selection
  const handleSelectText = (blockId: string) => {
    const el = blockInputRefs.current[blockId];
    if (!el || !containerRef.current) {
      setBubbleMenu(prev => ({ ...prev, visible: false }));
      return;
    }

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    if (start === end) {
      setBubbleMenu(prev => ({ ...prev, visible: false }));
      return;
    }

    const selectedText = el.value.substring(start, end);
    if (!selectedText.trim()) {
      setBubbleMenu(prev => ({ ...prev, visible: false }));
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    setBubbleMenu({
      visible: true,
      x: Math.max(80, Math.min(containerRect.width - 120, elRect.left - containerRect.left + 100)),
      y: Math.max(10, elRect.top - containerRect.top + containerRef.current.scrollTop - 44),
      text: selectedText,
      start,
      end,
      blockId,
    });
  };

  // Apply Inline Formats
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
    const newContent =
      block.content.slice(0, bubbleMenu.start) +
      formatted +
      block.content.slice(bubbleMenu.end);

    const updated = [...blocks];
    updated[blockIndex] = { ...block, content: newContent };
    notifyChange(updated);
    setBubbleMenu(prev => ({ ...prev, visible: false }));

    // Refocus and place cursor after formatted text
    setTimeout(() => {
      const el = blockInputRefs.current[block.id];
      if (el) {
        el.focus();
        const newPos = bubbleMenu.start + formatted.length;
        el.setSelectionRange(newPos, newPos);
        autoResize(el);
      }
    }, 15);
  };

  // Close Slash Menu on outside click
  useEffect(() => {
    if (!slashMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.slash-popover')) {
        setSlashMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [slashMenuOpen]);

  // Close Bubble Menu on outside click or scroll
  useEffect(() => {
    if (!bubbleMenu.visible) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.bubble-popover')) {
        setBubbleMenu(prev => ({ ...prev, visible: false }));
      }
    };
    const handleScroll = () => {
      setBubbleMenu(prev => ({ ...prev, visible: false }));
    };
    window.addEventListener('mousedown', handleOutsideClick);
    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [bubbleMenu.visible]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 flex flex-col p-5 overflow-y-auto relative text-[var(--text-primary)] select-text z-10"
      onFocus={e => {
        if (e.target instanceof HTMLTextAreaElement && e.target !== wholeNoteInput.current) {
          lastFocusedInput.current = e.target;
        }
      }}
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
      <textarea
        ref={wholeNoteInput}
        aria-hidden
        tabIndex={-1}
        className="fixed top-0 left-0 w-px h-px opacity-0 pointer-events-none resize-none"
        onChange={handleWholeNoteInput}
        onCompositionEnd={e => replaceWholeNoteWithText(e.currentTarget.value)}
        onPaste={handleWholeNotePaste}
        onKeyDown={handleWholeNoteKeyDown}
        onBlur={() => setWholeNoteSelected(false)}
      />

      {/* Block List: Unified Rendered WYSIWYG */}
      <div
        className={`-mx-2 px-2 space-y-1 pb-16 rounded-lg transition-colors ${
          wholeNoteSelected ? 'bg-[var(--accent-glow)]' : ''
        }`}
      >
        {blocks.map((block, idx) => {
          // 1. Heading 1
          if (block.type === 'h1') {
            return (
              <div key={block.id} className="relative group my-2">
                <textarea
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  rows={1}
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={e => handlePaste(idx, e)}
                  onWheel={handleTextareaWheel}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Heading 1..."
                  className="w-full bg-transparent resize-none overflow-hidden font-bold text-xl tracking-tight text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] border-none p-0 leading-tight selection:bg-[var(--accent-color)]/30"
                />
              </div>
            );
          }

          // 2. Heading 2
          if (block.type === 'h2') {
            return (
              <div key={block.id} className="relative group my-1.5">
                <textarea
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  rows={1}
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={e => handlePaste(idx, e)}
                  onWheel={handleTextareaWheel}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Heading 2..."
                  className="w-full bg-transparent resize-none overflow-hidden font-semibold text-base tracking-tight text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] border-none p-0 leading-snug selection:bg-[var(--accent-color)]/30"
                />
              </div>
            );
          }

          // 3. Heading 3
          if (block.type === 'h3') {
            return (
              <div key={block.id} className="relative group my-1">
                <textarea
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  rows={1}
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={e => handlePaste(idx, e)}
                  onWheel={handleTextareaWheel}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Heading 3..."
                  className="w-full bg-transparent resize-none overflow-hidden font-medium text-sm text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] border-none p-0 leading-normal selection:bg-[var(--accent-color)]/30"
                />
              </div>
            );
          }

          // 4. Task Checklist Block
          if (block.type === 'task') {
            return (
              <div key={block.id} className="flex items-start gap-2.5 my-1.5 group">
                {/* Interactive Clickable Checkbox */}
                <button
                  type="button"
                  onClick={e => handleToggleTask(idx, e)}
                  className={`w-4 h-4 rounded mt-1 flex items-center justify-center text-xs font-bold transition-all shrink-0 btn-press cursor-pointer select-none ${
                    block.checked
                      ? 'border border-[var(--accent-color)] bg-[var(--accent-color)] text-white shadow-sm'
                      : 'border border-[var(--border-highlight)] bg-transparent text-transparent hover:border-[var(--accent-color)]'
                  }`}
                  title="Toggle task (Click)"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>

                {/* Editable Task Label */}
                <textarea
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  rows={1}
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={e => handlePaste(idx, e)}
                  onWheel={handleTextareaWheel}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Task item..."
                  className={`w-full bg-transparent resize-none overflow-hidden outline-none text-[13px] leading-relaxed transition-all placeholder-[var(--text-muted)] border-none p-0 selection:bg-[var(--accent-color)]/30 ${
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
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] mt-2 shrink-0 select-none" />
                <textarea
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  rows={1}
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={e => handlePaste(idx, e)}
                  onWheel={handleTextareaWheel}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="List item..."
                  className="w-full bg-transparent resize-none overflow-hidden text-[13px] leading-relaxed text-[var(--text-secondary)] outline-none placeholder-[var(--text-muted)] border-none p-0 selection:bg-[var(--accent-color)]/30"
                />
              </div>
            );
          }

          // 6. Code Block
          if (block.type === 'code') {
            return (
              <div
                key={block.id}
                className="my-2.5 rounded-xl bg-[var(--code-bg)] border border-[var(--border-subtle)] overflow-hidden shadow-sm"
              >
                <div className="px-3 py-1 bg-black/20 border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] select-none">
                  <span>{block.language || 'typescript'}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(block.content);
                      haptics.playClick();
                    }}
                    className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copy</span>
                  </button>
                </div>
                <textarea
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={e => handlePaste(idx, e)}
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
                <Lightbulb className="w-4 h-4 text-[var(--accent-color)] mt-0.5 shrink-0 select-none" />
                <textarea
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  rows={1}
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={e => handlePaste(idx, e)}
                  onWheel={handleTextareaWheel}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Callout thought..."
                  className="w-full bg-transparent resize-none overflow-hidden text-[13px] leading-relaxed text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] border-none p-0 font-medium selection:bg-[var(--accent-color)]/30"
                />
              </div>
            );
          }

          // 8. Blockquote Block
          if (block.type === 'quote') {
            return (
              <div
                key={block.id}
                className="my-2 pl-3.5 border-l-2 border-[var(--accent-color)] flex items-start gap-2 italic"
              >
                <textarea
                  ref={el => (blockInputRefs.current[block.id] = el)}
                  rows={1}
                  value={block.content}
                  onChange={e => handleBlockTextChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={e => handlePaste(idx, e)}
                  onWheel={handleTextareaWheel}
                  onSelect={() => handleSelectText(block.id)}
                  placeholder="Blockquote..."
                  className="w-full bg-transparent resize-none overflow-hidden text-[13px] leading-relaxed text-[var(--text-secondary)] outline-none placeholder-[var(--text-muted)] border-none p-0 selection:bg-[var(--accent-color)]/30"
                />
              </div>
            );
          }

          // 9. Divider Block
          if (block.type === 'divider') {
            return (
              <div key={block.id} className="my-3 py-1 cursor-pointer select-none">
                <hr className="border-[var(--border-subtle)]" />
              </div>
            );
          }

          // 10. Standard Paragraph
          return (
            <div key={block.id} className="relative group my-0.5">
              <textarea
                ref={el => (blockInputRefs.current[block.id] = el)}
                rows={1}
                value={block.content}
                onChange={e => handleBlockTextChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                onPaste={e => handlePaste(idx, e)}
                onWheel={handleTextareaWheel}
                onSelect={() => handleSelectText(block.id)}
                placeholder={idx === 0 ? "Start typing note or press '/' for commands..." : ''}
                className="w-full bg-transparent resize-none overflow-hidden text-[13px] leading-relaxed text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)] border-none p-0 selection:bg-[var(--accent-color)]/30"
              />
            </div>
          );
        })}
      </div>

      {/* FLOATING TEXT SELECTION BUBBLE TOOLBAR */}
      {bubbleMenu.visible && (
        <div
          className="bubble-popover absolute z-40 -translate-x-1/2 flex items-center gap-0.5 p-1 rounded-xl bg-[var(--bg-window-solid)] border border-[var(--border-highlight)] shadow-2xl backdrop-blur-md animate-fadeIn"
          style={{ top: bubbleMenu.y, left: bubbleMenu.x }}
        >
          <button
            onClick={() => applyInlineFormat('bold')}
            title="Bold (⌘B)"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] btn-press cursor-pointer"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyInlineFormat('italic')}
            title="Italic (⌘I)"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] btn-press cursor-pointer"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyInlineFormat('code')}
            title="Inline Code"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] btn-press cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyInlineFormat('strike')}
            title="Strikethrough"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] btn-press cursor-pointer"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SLASH COMMAND MENU POPUP */}
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
