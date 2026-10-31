export interface EditorBlock {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'task' | 'bullet' | 'code' | 'callout' | 'divider' | 'paragraph';
  content: string;
  checked?: boolean;
  language?: string;
}

export function parseMarkdownToBlocks(markdown: string): EditorBlock[] {
  if (!markdown || !markdown.trim()) {
    return [
      {
        id: `block-${Date.now()}-0`,
        type: 'paragraph',
        content: '',
      },
    ];
  }

  const lines = markdown.split('\n');
  const blocks: EditorBlock[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = 'typescript';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block delimiters
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim() || 'typescript';
        codeBuffer = [];
        continue;
      } else {
        inCodeBlock = false;
        blocks.push({
          id: `block-${i}-${Date.now()}`,
          type: 'code',
          content: codeBuffer.join('\n'),
          language: codeLang,
        });
        continue;
      }
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({
        id: `block-${i}-${Date.now()}`,
        type: 'h1',
        content: line.slice(2),
      });
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({
        id: `block-${i}-${Date.now()}`,
        type: 'h2',
        content: line.slice(3),
      });
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({
        id: `block-${i}-${Date.now()}`,
        type: 'h3',
        content: line.slice(4),
      });
      continue;
    }

    // Task Checklist (- [ ] or - [x])
    const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s*(.*)$/);
    if (taskMatch) {
      blocks.push({
        id: `block-${i}-${Date.now()}`,
        type: 'task',
        checked: taskMatch[1].toLowerCase() === 'x',
        content: taskMatch[2] || '',
      });
      continue;
    }

    // Bullet List
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      blocks.push({
        id: `block-${i}-${Date.now()}`,
        type: 'bullet',
        content: bulletMatch[1] || '',
      });
      continue;
    }

    // Callout / Blockquote
    if (line.startsWith('> ')) {
      blocks.push({
        id: `block-${i}-${Date.now()}`,
        type: 'callout',
        content: line.slice(2),
      });
      continue;
    }

    // Horizontal Divider
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push({
        id: `block-${i}-${Date.now()}`,
        type: 'divider',
        content: '',
      });
      continue;
    }

    // Regular Paragraph (skip trailing empty lines if previous was empty)
    blocks.push({
      id: `block-${i}-${Date.now()}`,
      type: 'paragraph',
      content: line,
    });
  }

  // Handle unclosed code block
  if (inCodeBlock) {
    blocks.push({
      id: `block-code-end-${Date.now()}`,
      type: 'code',
      content: codeBuffer.join('\n'),
      language: codeLang,
    });
  }

  return blocks.length > 0 ? blocks : [{ id: `block-${Date.now()}`, type: 'paragraph', content: '' }];
}

export function serializeBlocksToMarkdown(blocks: EditorBlock[]): string {
  return blocks
    .map(block => {
      switch (block.type) {
        case 'h1':
          return `# ${block.content}`;
        case 'h2':
          return `## ${block.content}`;
        case 'h3':
          return `### ${block.content}`;
        case 'task':
          return `- [${block.checked ? 'x' : ' '}] ${block.content}`;
        case 'bullet':
          return `- ${block.content}`;
        case 'code':
          return `\`\`\`${block.language || 'typescript'}\n${block.content}\n\`\`\``;
        case 'callout':
          return `> ${block.content}`;
        case 'divider':
          return `---`;
        case 'paragraph':
        default:
          return block.content;
      }
    })
    .join('\n');
}
