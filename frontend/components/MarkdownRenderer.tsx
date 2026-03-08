import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Custom heading renderer to support TOC linking
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'heading';
};

const getNodeText = (node: any): string => {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (typeof node === 'object' && node?.props?.children) return getNodeText(node.props.children);
  return '';
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={`${className} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded`} {...props}>
                {children}
              </code>
            );
          },
          h2: ({node, ...props}) => {
            const text = getNodeText(props.children);
            const id = generateSlug(text);
            return <h2 id={id} className="scroll-mt-24" {...props} />;
          },
          h3: ({node, ...props}) => {
            const text = getNodeText(props.children);
            const id = generateSlug(text);
            return <h3 id={id} className="scroll-mt-24" {...props} />;
          },
          h4: ({node, ...props}) => {
            const text = getNodeText(props.children);
            const id = generateSlug(text);
            return <h4 id={id} className="scroll-mt-24" {...props} />;
          }
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
