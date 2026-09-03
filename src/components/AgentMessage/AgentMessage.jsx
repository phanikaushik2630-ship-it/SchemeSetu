/**
 * ============================================================
 * AgentMessage.jsx — Chat Message Bubble
 * File: src/components/AgentMessage/AgentMessage.jsx
 * ============================================================
 * Renders a single chat message — either from the user or
 * from the AI agent. Handles simple markdown-like formatting.
 *
 * Props:
 *   role:      "user" | "assistant"
 *   content:   string — the message text
 *   isLoading: boolean — show typing dots (for pending response)
 * ============================================================
 */

/**
 * Parses simple markdown from the agent's response:
 * **bold**, *italic*, bullet lists (- item), numbered lists,
 * and inline `code`. Returns HTML-safe React elements.
 */
function renderMarkdown(text) {
  if (!text) return null;

  // Split by newlines first to handle lists
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line → spacer
    if (!line.trim()) {
      elements.push(<div key={i} className="msg-spacer" />);
      i++;
      continue;
    }

    // Bullet list item
    if (line.match(/^[-•]\s/)) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^[-•]\s/)) {
        listItems.push(
          <li key={i} className="msg-li">
            {renderInline(lines[i].replace(/^[-•]\s/, ""))}
          </li>
        );
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="msg-ul">{listItems}</ul>);
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const listItems = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        listItems.push(
          <li key={i} className="msg-li">
            {renderInline(lines[i].replace(/^\d+\.\s/, ""))}
          </li>
        );
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="msg-ol">{listItems}</ol>);
      continue;
    }

    // Heading (## or ###)
    if (line.match(/^#{2,3}\s/)) {
      elements.push(
        <p key={i} className="msg-heading">
          {renderInline(line.replace(/^#{2,3}\s/, ""))}
        </p>
      );
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="msg-p">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

// Renders inline formatting within a single line
function renderInline(text) {
  // Split on **bold**, *italic*, `code`, and URLs
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/\S+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="msg-code">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("http")) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="msg-link">
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function AgentMessage({ role, content, isLoading }) {
  const isUser = role === "user";

  return (
    <div className={`msg-row ${isUser ? "msg-row-user" : "msg-row-agent"}`}>
      {/* Agent avatar */}
      {!isUser && (
        <div className="msg-avatar" aria-hidden="true">🤖</div>
      )}

      {/* Bubble */}
      <div className={`msg-bubble ${isUser ? "msg-bubble-user" : "msg-bubble-agent"}`}>
        {isLoading ? (
          <div className="msg-typing" aria-label="Agent is typing">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        ) : isUser ? (
          <p className="msg-p">{content}</p>
        ) : (
          <div className="msg-content">{renderMarkdown(content)}</div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="msg-avatar msg-avatar-user" aria-hidden="true">👤</div>
      )}
    </div>
  );
}
