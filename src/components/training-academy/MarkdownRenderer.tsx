import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

const renderInline = (text: string) => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.85em] font-bold text-[#A23EFB]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export function MarkdownRenderer({ markdown, compact = false }: { markdown: string; compact?: boolean }) {
  const lines = markdown.split('\n');
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];
  let tableRows: string[][] = [];

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`list-${nodes.length}`} className={cn('list-disc ps-5 text-slate-700', compact ? 'text-sm' : 'text-[15px]', 'flex flex-col gap-1.5')}>
        {listItems.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  const flushTable = () => {
    if (!tableRows.length) return;
    const rows = tableRows.filter((row) => !row.every((cell) => /^:?-{2,}:?$/.test(cell.trim())));
    const [head, ...body] = rows;
    nodes.push(
      <div key={`table-${nodes.length}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[34rem] text-start text-sm">
          {head && (
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {head.map((cell, index) => (
                  <th key={index} className="px-4 py-3 text-start font-black">
                    {renderInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100">
            {body.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 align-top text-slate-700">
                    {renderInline(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  for (const line of lines) {
    if (/^\|.+\|$/.test(line.trim())) {
      flushList();
      tableRows.push(line.trim().slice(1, -1).split('|'));
      continue;
    }

    flushTable();

    if (/^-\s+/.test(line)) {
      listItems.push(line.replace(/^-\s+/, '').trim());
      continue;
    }

    flushList();

    if (!line.trim()) continue;

    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={nodes.length} className="text-lg font-black text-slate-950">
          {renderInline(line.replace('### ', ''))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={nodes.length} className="text-2xl font-black text-slate-950">
          {renderInline(line.replace('## ', ''))}
        </h2>
      );
    } else if (/^\d+\.\s+/.test(line)) {
      nodes.push(
        <p key={nodes.length} className={cn('rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700', compact && 'text-sm')}>
          {renderInline(line)}
        </p>
      );
    } else {
      nodes.push(
        <p key={nodes.length} className={cn('leading-7 text-slate-700', compact ? 'text-sm' : 'text-[15px]')}>
          {renderInline(line)}
        </p>
      );
    }
  }

  flushList();
  flushTable();

  return <div className={cn('flex flex-col', compact ? 'gap-3' : 'gap-5')}>{nodes}</div>;
}
