import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse simple markdown blocks
  const renderFormattedText = (text: string) => {
    // Process bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-[#201B2B]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-[#201B2B]">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-[#EEE8FF] text-[#5635B5] text-xs font-mono font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Parse lines into paragraphs, headers, lists, and code blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let blockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block boundary
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        const currentCode = codeBuffer.join('\n');
        const currentIndex = blockIndex++;
        const currentLang = codeLang || 'code';
        elements.push(
          <div key={`code-${currentIndex}`} className="my-3 rounded-xl overflow-hidden border border-[#E9E6F0] bg-[#1E1B2E] text-slate-100 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#151221] border-b border-white/10 text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-purple-300">
                <Terminal className="w-3.5 h-3.5" />
                {currentLang}
              </span>
              <button
                onClick={() => copyToClipboard(currentCode, currentIndex)}
                className="flex items-center gap-1 text-[11px] hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
                title="نسخ الكود"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-[12px] leading-relaxed text-slate-200">
              <code>{currentCode}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-[#201B2B] mt-4 mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-[#7652D6]" />
          {renderFormattedText(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-lg font-extrabold text-[#201B2B] mt-5 mb-2 border-b border-[#E9E6F0] pb-1">
          {renderFormattedText(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-xl font-black text-[#201B2B] mt-6 mb-2 text-[#5635B5]">
          {renderFormattedText(line.replace('# ', ''))}
        </h1>
      );
      continue;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const cleanLine = line.trim().slice(2);
      elements.push(
        <li key={i} className="mr-5 my-1 text-sm text-[#201B2B] list-disc marker:text-[#7652D6]">
          {renderFormattedText(cleanLine)}
        </li>
      );
      continue;
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-1 text-sm text-[#201B2B]">
          <span className="font-bold text-[#7652D6] shrink-0 text-xs px-1.5 py-0.5 rounded bg-[#EEE8FF]">
            {numMatch[1]}
          </span>
          <div className="flex-1">{renderFormattedText(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="my-2 p-2.5 bg-[#FAF9FF] border-r-4 border-[#7652D6] rounded-l-lg text-sm text-[#5635B5] italic">
          {renderFormattedText(line.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={i} className="my-1 text-sm leading-relaxed text-[#201B2B]">
        {renderFormattedText(line)}
      </p>
    );
  }

  return (
    <div className={`prose-sm leading-relaxed break-words ${className}`}>
      {elements}
    </div>
  );
};
