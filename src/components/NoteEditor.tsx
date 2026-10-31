import React, { useState, useRef, useEffect } from 'react';
import { Eye, Edit3, Check } from 'lucide-react';
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
  const [isEditMode, setIsEditMode] = useState(true);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [menuPos, setMenuPos] = useState({ top: 60, left: 24 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditMode) {
      textareaRef.current?.focus();
    }
  }, [isEditMode]);

  // Handle textarea keydowns (e.g. typing / or markdown shortcuts)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onOpenActions();
      return;
    }

    if (e.key === '/' && !slashMenuOpen) {
      // Check if preceded by space or newline or at start
      const target = e.currentTarget;
      const pos = target.selectionStart;
      const textBefore = target.value.slice(0, pos);
      const lastChar = textBefore.slice(-1);

      if (pos === 0 || lastChar === '\n' || lastChar === ' ') {
        setSlashMenuOpen(true);
        setSlashQuery('');
        // Approximate menu position
        setMenuPos({ top: 60, left: 24 });
      }
    }

    // Tab key indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const updated = val.substring(0, start) + '  ' + val.substring(end);
      onChange(updated);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleSelectCommand = (cmd: SlashCommand) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const pos = textarea.selectionStart;
    const val = textarea.value;

    // Remove the triggering '/' if present right before pos
    let before = val.substring(0, pos);
    if (before.endsWith('/' + slashQuery)) {
      before = before.slice(0, -(slashQuery.length + 1));
    } else if (before.endsWith('/')) {
      before = before.slice(0, -1);
    }

    const after = val.substring(pos);
    const newContent = before + cmd.insertText + after;
    onChange(newContent);
    setSlashMenuOpen(false);

    setTimeout(() => {
      textarea.focus();
      const newPos = before.length + cmd.insertText.length;
      textarea.selectionStart = textarea.selectionEnd = newPos;
    }, 0);
  };

  // Toggle checkbox directly in markdown text
  const toggleCheckbox = (lineIndex: number) => {
    const lines = content.split('\n');
    const line = lines[lineIndex];
    if (!line) return;

    if (line.includes('- [ ]')) {
      lines[lineIndex] = line.replace('- [ ]', '- [x]');
    } else if (line.includes('- [x]')) {
      lines[lineIndex] = line.replace('- [x]', '- [ ]');
    }
    onChange(lines.join('\n'));
  };

  // Render formatted markdown with interactive checkboxes
  const renderFormattedMarkdown = () => {
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeLines: string[] = [];

    return lines.map((line, idx) => {
      // Code block handling
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLines = [];
          return null;
        } else {
          inCodeBlock = false;
          const codeSnippet = codeLines.join('\n');
          return (
            <div
              key={idx}
              className="my-3 p-3 rounded-xl bg-[var(--code-bg)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)] overflow-x-auto shadow-sm"
            >
              <pre>{codeSnippet}</pre>
            </div>
          );
        }
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return null;
      }

      // Headings
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl font-bold tracking-tight text-[var(--text-primary)] my-2">
            {line.replace(/^#\s+/, '')}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg font-bold text-[var(--text-primary)] my-1.5">
            {line.replace(/^##\s+/, '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-semibold text-[var(--text-primary)] my-1">
            {line.replace(/^###\s+/, '')}
          </h3>
        );
      }

      // Checkboxes (- [ ] or - [x])
      if (line.match(/^-\s+\[([ x])\]/)) {
        const isChecked = line.includes('- [x]');
        const text = line.replace(/^-\s+\[([ x])\]\s*/, '');
        return (
          <div
            key={idx}
            onClick={() => toggleCheckbox(idx)}
            className="flex items-start gap-2.5 my-1.5 cursor-pointer group select-none"
          >
            <span
              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                isChecked
                  ? 'border border-[var(--accent-color)] bg-[var(--accent-color)] text-white shadow-sm'
                  : 'border border-[var(--border-highlight)] bg-transparent text-transparent group-hover:border-[var(--accent-color)]'
              }`}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span
              className={`text-[13px] leading-relaxed transition-all ${
                isChecked
                  ? 'line-through text-[var(--text-muted)]'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {text}
            </span>
          </div>
        );
      }

      // Callout box (> 💡)
      if (line.startsWith('> 💡') || line.startsWith('>')) {
        return (
          <div
            key={idx}
            className="my-2.5 p-3 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-color)]/25 text-[var(--text-primary)] text-xs leading-relaxed"
          >
            {line.replace(/^>\s*/, '')}
          </div>
        );
      }

      // Bullet lists
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-[13px] text-[var(--text-secondary)] my-0.5">
            {line.replace(/^-\s+/, '')}
          </li>
        );
      }

      // Dividers
      if (line.trim() === '---') {
        return <hr key={idx} className="my-3 border-[var(--border-subtle)]" />;
      }

      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Plain paragraph
      return (
        <p key={idx} className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden relative text-[var(--text-primary)]">
      
      {/* Editor / Preview Mode Pill */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)] text-xs">
        <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
          <span>Type <kbd className="px-1 py-0.2 rounded bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-[var(--text-primary)] font-semibold">/</kbd> for commands</span>
        </span>

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className="btn-press px-2 py-0.5 rounded-md text-[11px] font-mono flex items-center gap-1.5 bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
        >
          {isEditMode ? (
            <>
              <Eye className="w-3 h-3 text-[var(--accent-color)]" />
              <span>Preview (Interactive)</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3 h-3 text-[var(--accent-color)]" />
              <span>Edit Raw Markdown</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto pr-1 relative">
        {isEditMode ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your notes or press '/' for commands..."
            className="w-full h-full bg-transparent resize-none outline-none font-mono text-[13px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-muted)] selection:bg-[var(--accent-color)]/30"
            spellCheck="false"
          />
        ) : (
          <div className="w-full h-full space-y-1">
            {renderFormattedMarkdown()}
          </div>
        )}

        {/* Slash Command Palette */}
        <SlashCommandMenu
          isOpen={slashMenuOpen}
          onClose={() => setSlashMenuOpen(false)}
          onSelectCommand={handleSelectCommand}
          searchQuery={slashQuery}
          onSearchChange={setSlashQuery}
          position={menuPos}
        />
      </div>
    </div>
  );
};
