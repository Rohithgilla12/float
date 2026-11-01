/**
 * Custom High-Craft Markdown to HTML Renderer for Float Blog & Articles
 * Supports:
 * - Responsive glass tables with header alignment
 * - Fenced code blocks with language headers
 * - Horizontal rules (---)
 * - Headings (h1, h2, h3, h4)
 * - Blockquotes and callouts
 * - Unordered lists with custom amber bullet markers
 * - Numbered lists
 * - Paragraphs with proper typographic leading
 * - Bold, italic, inline code, and links
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseInline(text: string): string {
  let res = text;

  // Clean escaped backticks \` -> `
  res = res.replace(/\\`/g, '`');

  // Code spans `code`
  res = res.replace(/`([^`]+)`/g, (_m, code) => {
    return `<code class="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-mono text-[12px] sm:text-[13px] border border-white/10 shadow-sm">${escapeHtml(code)}</code>`;
  });

  // Bold **text**
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Italic *text*
  res = res.replace(/\*(.*?)\*/g, '<em class="italic text-amber-200/90">$1</em>');

  // Links [text](url)
  res = res.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-amber-400 hover:text-amber-300 underline underline-offset-4 font-semibold transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');

  return res;
}

export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const rawLines = markdown.split(/\r?\n/);
  const htmlBlocks: string[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // 1. Blank line - skip
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Horizontal Rule: --- or ***
    if (/^---+$|^\*\*\*+$/.test(trimmed)) {
      htmlBlocks.push('<hr class="my-10 border-t border-white/10" />');
      i++;
      continue;
    }

    // 3. Fenced Code Block: ```lang
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim() || 'text';
      i++;
      const codeLines: string[] = [];
      while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
        codeLines.push(rawLines[i]);
        i++;
      }
      if (i < rawLines.length) i++; // consume closing ```
      
      const escapedCode = escapeHtml(codeLines.join('\n'));
      htmlBlocks.push(`
        <div class="my-6 rounded-2xl border border-white/15 bg-black/60 overflow-hidden shadow-2xl">
          <div class="px-4 py-2 border-b border-white/10 bg-white/[0.03] flex items-center justify-between text-xs text-white/50 font-mono">
            <span>${lang}</span>
            <span class="text-[10px] text-white/40">raw code</span>
          </div>
          <pre class="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-amber-200/90 leading-relaxed"><code>${escapedCode}</code></pre>
        </div>
      `);
      continue;
    }

    // 4. Tables: Lines starting and ending with |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|')) {
        tableLines.push(rawLines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerRow = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(cell => cell.trim());

        const separatorRow = tableLines[1]
          .split('|')
          .slice(1, -1)
          .map(cell => cell.trim());

        const alignments = separatorRow.map(sep => {
          const left = sep.startsWith(':');
          const right = sep.endsWith(':');
          if (left && right) return 'text-center';
          if (right) return 'text-right';
          return 'text-left';
        });

        const dataRows = tableLines.slice(2).map(r =>
          r
            .split('|')
            .slice(1, -1)
            .map(cell => cell.trim())
        );

        let tableHtml = `
          <div class="overflow-x-auto my-8 rounded-2xl border border-white/15 bg-white/[0.02] shadow-2xl">
            <table class="w-full text-left text-xs sm:text-sm divide-y divide-white/10 font-sans">
              <thead class="bg-white/[0.06] text-white font-semibold">
                <tr>
        `;

        headerRow.forEach((col, idx) => {
          const align = alignments[idx] || 'text-left';
          tableHtml += `<th class="py-3 px-4 ${align} font-bold text-white whitespace-nowrap">${parseInline(col)}</th>`;
        });

        tableHtml += `
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
        `;

        dataRows.forEach(row => {
          const isFloatRow = row.some(c => c.toLowerCase().includes('**float**') || c.toLowerCase().includes('float'));
          const rowClass = isFloatRow
            ? 'bg-amber-500/10 border-l-2 border-amber-400 font-medium'
            : 'hover:bg-white/[0.03] transition-colors odd:bg-transparent even:bg-white/[0.015]';
          tableHtml += `<tr class="${rowClass}">`;
          row.forEach((cell, idx) => {
            const align = alignments[idx] || 'text-left';
            tableHtml += `<td class="py-3.5 px-4 ${align} text-white/80">${parseInline(cell)}</td>`;
          });
          tableHtml += `</tr>`;
        });

        tableHtml += `
              </tbody>
            </table>
          </div>
        `;

        htmlBlocks.push(tableHtml);
        continue;
      }
    }

    // 5. Headings
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = parseInline(match[2]);
        if (level === 1) {
          htmlBlocks.push(`<h1 class="text-3xl sm:text-4xl font-extrabold text-white mt-12 mb-5 tracking-tight">${text}</h1>`);
        } else if (level === 2) {
          htmlBlocks.push(`<h2 class="text-2xl sm:text-3xl font-extrabold text-white mt-12 mb-5 tracking-tight border-b border-white/10 pb-3">${text}</h2>`);
        } else if (level === 3) {
          htmlBlocks.push(`<h3 class="text-xl sm:text-2xl font-bold text-white mt-10 mb-4 tracking-tight">${text}</h3>`);
        } else {
          htmlBlocks.push(`<h4 class="text-lg font-bold text-white mt-8 mb-3">${text}</h4>`);
        }
        i++;
        continue;
      }
    }

    // 6. Blockquote: > text
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('>')) {
        quoteLines.push(rawLines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      const quoteText = quoteLines.map(parseInline).join('<br />');
      htmlBlocks.push(`
        <blockquote class="border-l-2 border-amber-400 pl-4 py-3 my-6 bg-amber-500/5 rounded-r-2xl text-white/90 italic text-sm sm:text-base leading-relaxed">
          ${quoteText}
        </blockquote>
      `);
      continue;
    }

    // 7. Unordered List: - item or * item
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < rawLines.length && /^[-*]\s+/.test(rawLines[i].trim())) {
        listItems.push(rawLines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      let ulHtml = '<ul class="space-y-3 my-5 pl-1">';
      listItems.forEach(item => {
        ulHtml += `
          <li class="flex items-start gap-3 text-white/80 leading-relaxed text-sm sm:text-base">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2.5 shrink-0"></span>
            <div>${parseInline(item)}</div>
          </li>
        `;
      });
      ulHtml += '</ul>';
      htmlBlocks.push(ulHtml);
      continue;
    }

    // 8. Numbered List: 1. item
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: { num: string; text: string }[] = [];
      while (i < rawLines.length && /^\d+\.\s+/.test(rawLines[i].trim())) {
        const lineItem = rawLines[i].trim();
        const m = lineItem.match(/^(\d+)\.\s+(.*)$/);
        if (m) {
          listItems.push({ num: m[1], text: m[2] });
        }
        i++;
      }
      let olHtml = '<ol class="space-y-3 my-5 pl-1">';
      listItems.forEach(item => {
        olHtml += `
          <li class="flex items-start gap-3 text-white/80 leading-relaxed text-sm sm:text-base">
            <span class="font-mono text-amber-400 font-bold shrink-0 text-xs mt-0.5">${item.num}.</span>
            <div>${parseInline(item.text)}</div>
          </li>
        `;
      });
      olHtml += '</ol>';
      htmlBlocks.push(olHtml);
      continue;
    }

    // 9. Regular Paragraph
    const paragraphLines: string[] = [];
    while (
      i < rawLines.length &&
      rawLines[i].trim() &&
      !rawLines[i].trim().startsWith('#') &&
      !rawLines[i].trim().startsWith('```') &&
      !rawLines[i].trim().startsWith('|') &&
      !rawLines[i].trim().startsWith('>') &&
      !/^[-*]\s+/.test(rawLines[i].trim()) &&
      !/^\d+\.\s+/.test(rawLines[i].trim()) &&
      !/^---+$|^\*\*\*+$/.test(rawLines[i].trim())
    ) {
      paragraphLines.push(rawLines[i].trim());
      i++;
    }

    if (paragraphLines.length > 0) {
      const paragraphText = paragraphLines.map(parseInline).join(' ');
      htmlBlocks.push(`<p class="leading-[1.8] text-white/80 text-sm sm:text-base my-4">${paragraphText}</p>`);
    }
  }

  return htmlBlocks.join('\n');
}
