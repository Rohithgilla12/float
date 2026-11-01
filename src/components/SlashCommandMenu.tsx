import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  List,
  Code2,
  Lightbulb,
  Quote,
  Minus,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SlashCommand } from '../types/note';

interface SlashCommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (command: SlashCommand) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  position?: { top: number; left: number };
}

const COMMANDS: SlashCommand[] = [
  {
    id: 'todo',
    label: 'To-do list',
    description: 'Track tasks with an interactive checkbox',
    icon: 'CheckSquare',
    category: 'Blocks',
    insertText: '- [ ] ',
  },
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Large top-level title',
    icon: 'Heading1',
    category: 'Blocks',
    insertText: '# ',
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: 'Heading2',
    category: 'Blocks',
    insertText: '## ',
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Sub-section header',
    icon: 'Heading3',
    category: 'Blocks',
    insertText: '### ',
  },
  {
    id: 'bullet',
    label: 'Bulleted list',
    description: 'Simple bullet point list',
    icon: 'List',
    category: 'Blocks',
    insertText: '- ',
  },
  {
    id: 'code',
    label: 'Code Block',
    description: 'Code snippet with syntax block',
    icon: 'Code2',
    category: 'Blocks',
    insertText: '```typescript\n// your code here\n```\n',
  },
  {
    id: 'callout',
    label: 'Callout Note',
    description: 'Highlight an important insight',
    icon: 'Lightbulb',
    category: 'Blocks',
    insertText: '> 💡 **Note:** ',
  },
  {
    id: 'quote',
    label: 'Blockquote',
    description: 'Capture a quote or reference',
    icon: 'Quote',
    category: 'Blocks',
    insertText: '> ',
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Horizontal separation rule',
    icon: 'Minus',
    category: 'Formatting',
    insertText: '\n---\n',
  },
  {
    id: 'timestamp',
    label: 'Current Timestamp',
    description: 'Insert current date and time',
    icon: 'Clock',
    category: 'Utility',
    insertText: `📅 ${new Date().toLocaleString()}\n`,
  },
  {
    id: 'calc',
    label: 'Math Calculation',
    description: 'Inline math: type e.g. 240 * 15 = or 15% of 850 =',
    icon: 'Sparkles',
    category: 'Utility',
    insertText: '125 * 4 = 500\n',
  },
  {
    id: 'table',
    label: 'Markdown Table',
    description: '2x2 formatted comparison grid',
    icon: 'Code2',
    category: 'Blocks',
    insertText: '| Item | Status |\n| :--- | :--- |\n| Task 1 | Done |\n| Task 2 | Next |\n',
  },
];

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  isOpen,
  onClose,
  onSelectCommand,
  searchQuery,
  onSearchChange,
  position,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelectCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onSelectCommand, onClose]);

  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4' };
    switch (iconName) {
      case 'CheckSquare': return <CheckSquare {...props} />;
      case 'Heading1': return <Heading1 {...props} />;
      case 'Heading2': return <Heading2 {...props} />;
      case 'Heading3': return <Heading3 {...props} />;
      case 'List': return <List {...props} />;
      case 'Code2': return <Code2 {...props} />;
      case 'Lightbulb': return <Lightbulb {...props} />;
      case 'Quote': return <Quote {...props} />;
      case 'Minus': return <Minus {...props} />;
      case 'Clock': return <Clock {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  return (
    <div
      className="slash-popover absolute z-50 w-72 rounded-xl bg-[var(--bg-window-solid)] border border-[var(--border-highlight)] shadow-2xl p-1.5 backdrop-blur-xl"
      style={{
        top: position?.top ?? 70,
        left: position?.left ?? 20,
      }}
    >
      {/* Search Header */}
      <div className="px-2.5 py-1.5 border-b border-[var(--border-subtle)] flex items-center gap-2 mb-1">
        <span className="text-[var(--accent-color)] text-xs font-mono font-bold">/</span>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Filter commands..."
          className="bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none w-full font-mono"
        />
        <span className="text-[10px] font-mono px-1 rounded bg-[var(--kbd-bg)] text-[var(--text-muted)]">
          ESC
        </span>
      </div>

      {/* Commands List */}
      <div className="max-h-64 overflow-y-auto space-y-0.5">
        {filteredCommands.length === 0 ? (
          <div className="py-4 text-center text-xs text-[var(--text-muted)] font-mono">
            No matching commands
          </div>
        ) : (
          filteredCommands.map((cmd, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={cmd.id}
                onClick={() => onSelectCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--accent-glow)] text-[var(--text-primary)] border border-[var(--accent-color)]/30 font-medium'
                    : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]'
                        : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)]'
                    }`}
                  >
                    {renderIcon(cmd.icon)}
                  </span>
                  <div className="truncate">
                    <div className="text-xs truncate">{cmd.label}</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate">
                      {cmd.description}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0 pl-1">
                    ↵
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
