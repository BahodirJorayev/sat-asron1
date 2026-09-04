import React, { useState } from 'react';
import { KaTeXRenderer } from '../KaTeXRenderer';

interface RichTextRendererProps {
  content?: string;
  className?: string;
}

/**
 * Interactive Spoiler component mimicking Telegram's animated particle spoiler.
 * Toggles reveal state when clicked.
 */
const InteractiveSpoiler: React.FC<{ text: string }> = ({ text }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsRevealed((prev) => !prev);
      }}
      className={`inline-block px-1.5 py-0.5 rounded-md cursor-pointer transition-all duration-200 select-none ${
        isRevealed
          ? 'bg-neutral-200/80 dark:bg-neutral-800/80 text-inherit'
          : 'bg-[#1E293B] text-transparent hover:bg-[#334155] border border-dashed border-[#64748B]/50'
      }`}
      title={isRevealed ? "Qayta yashirish uchun bosing" : "Spoiler: Ko'rish uchun bosing"}
    >
      {text}
    </span>
  );
};

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content = '',
  className = '',
}) => {
  if (!content) return null;

  // Split content into code blocks first
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {renderInlineFormatting(content.substring(lastIndex, match.index))}
        </span>
      );
    }

    const codeContent = match[1].trim();
    parts.push(
      <pre
        key={`code-${match.index}`}
        className="my-2 p-3 rounded-xl bg-[#0A0F1D] text-[#38BDF8] border border-[#1E293B] font-mono text-xs overflow-x-auto select-text"
      >
        <code>{codeContent}</code>
      </pre>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {renderInlineFormatting(content.substring(lastIndex))}
      </span>
    );
  }

  return (
    <div className={`whitespace-pre-wrap break-words leading-relaxed ${className}`}>
      {parts}
    </div>
  );
};

/**
 * Format inline elements: Spoilers, LaTeX Math, Bold, Italic, Code, URLs
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex parsing tokens in order:
  // 1. Spoiler: ||spoiler||
  // 2. Math inline: $math$
  // 3. Bold: **bold**
  // 4. Italic: *italic*
  // 5. Monospace: `code`
  // 6. URL: https?://[^\s]+
  const tokenRegex = /(\|\|[\s\S]+?\|\||\$(?!\$)[\s\S]+?\$|\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`|https?:\/\/[^\s]+)/g;

  const result: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = tokenRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      result.push(text.substring(lastIdx, m.index));
    }

    const rawToken = m[0];

    if (rawToken.startsWith('||') && rawToken.endsWith('||')) {
      const innerText = rawToken.slice(2, -2);
      result.push(<InteractiveSpoiler key={`sp-${m.index}`} text={innerText} />);
    } else if (rawToken.startsWith('$') && rawToken.endsWith('$')) {
      const mathExp = rawToken.slice(1, -1);
      result.push(
        <span key={`math-${m.index}`} className="inline-block mx-0.5">
          <KaTeXRenderer math={mathExp} />
        </span>
      );
    } else if (rawToken.startsWith('**') && rawToken.endsWith('**')) {
      const boldText = rawToken.slice(2, -2);
      result.push(
        <strong key={`b-${m.index}`} className="font-bold text-inherit">
          {boldText}
        </strong>
      );
    } else if (rawToken.startsWith('*') && rawToken.endsWith('*')) {
      const italicText = rawToken.slice(1, -1);
      result.push(
        <em key={`i-${m.index}`} className="italic text-inherit">
          {italicText}
        </em>
      );
    } else if (rawToken.startsWith('`') && rawToken.endsWith('`')) {
      const codeText = rawToken.slice(1, -1);
      result.push(
        <code
          key={`c-${m.index}`}
          className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-neutral-200/80 dark:bg-[#1E293B] text-[#E07A5F] border border-neutral-300 dark:border-[#334155]/60"
        >
          {codeText}
        </code>
      );
    } else if (rawToken.startsWith('http')) {
      result.push(
        <a
          key={`link-${m.index}`}
          href={rawToken}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-500 hover:text-sky-400 underline underline-offset-2 break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {rawToken}
        </a>
      );
    }

    lastIdx = m.index + rawToken.length;
  }

  if (lastIdx < text.length) {
    result.push(text.substring(lastIdx));
  }

  return result;
}
