'use client'

import { useMemo, useEffect } from 'react'
import DOMPurify from 'isomorphic-dompurify'

interface RichTextContentProps {
  content: string
  className?: string
}

export default function RichTextContent({ content, className = '' }: RichTextContentProps) {
  const sanitizedContent = useMemo(() => {
    if (!content) return ''
    return DOMPurify.sanitize(content)
  }, [content])

  const uniqueId = useMemo(() => `rich-text-${Math.random().toString(36).substring(2, 11)}`, [])

  useEffect(() => {
    // Inject styles if they don't exist
    const styleId = 'rich-text-content-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = richTextStyles
      document.head.appendChild(style)
    }
  }, [])

  if (!content) {
    return null
  }

  return (
    <>
      <div
        id={uniqueId}
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        style={{
          lineHeight: '1.6',
          color: 'inherit',
        }}
      />
    </>
  )
}

// Add this CSS to your global styles or component styles
export const richTextStyles = `
.rich-text-content {
  /* Typography */
  line-height: 1.6;
}

.rich-text-content p {
  margin-bottom: 1em;
}

.rich-text-content p:last-child {
  margin-bottom: 0;
}

/* Bold text */
.rich-text-content strong {
  font-weight: 600 !important;
}

/* Italic text */
.rich-text-content em {
  font-style: italic !important;
}

/* Underline text */
.rich-text-content u {
  text-decoration: underline !important;
}

/* Lists */
.rich-text-content ul {
  list-style-type: disc !important;
  margin-left: 1.5rem !important;
  margin-bottom: 1em !important;
  padding-left: 0 !important;
}

.rich-text-content ol {
  list-style-type: decimal !important;
  margin-left: 1.5rem !important;
  margin-bottom: 1em !important;
  padding-left: 0 !important;
}

.rich-text-content li {
  display: list-item !important;
  margin-bottom: 0.25em !important;
}

.rich-text-content ul ul,
.rich-text-content ol ol,
.rich-text-content ul ol,
.rich-text-content ol ul {
  margin-bottom: 0 !important;
  margin-top: 0.25em !important;
}

/* Blockquotes */
.rich-text-content blockquote {
  border-left: 4px solid #d1d5db !important;
  padding-left: 1rem !important;
  font-style: italic !important;
  color: #6b7280 !important;
  margin: 1.5em 0 !important;
}

/* Links */
.rich-text-content a {
  color: #2563eb !important;
  text-decoration: underline !important;
}

.rich-text-content a:hover {
  color: #1d4ed8 !important;
}

/* Text alignment */
.rich-text-content [style*="text-align: center"] {
  text-align: center !important;
}

.rich-text-content [style*="text-align: right"] {
  text-align: right !important;
}

.rich-text-content [style*="text-align: start"] {
  text-align: start !important;
}

.rich-text-content [style*="text-align: left"] {
  text-align: left !important;
}
`