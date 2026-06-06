import Markdown, {
  MarkdownIt,
  type RenderRules,
} from "@ronradtke/react-native-markdown-display";
import Katex from "react-native-katex";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ContentSegment =
  | {
      type: "markdown";
      value: string;
    }
  | {
      displayMode: boolean;
      expression: string;
      type: "math";
    };

const markdownIt = MarkdownIt({
  breaks: false,
  html: false,
  linkify: true,
  typographer: true,
});

const markdownRules: RenderRules = {
  fence(node) {
    const language = node.sourceInfo?.trim();

    return (
      <View key={node.key} style={styles.codeBlock}>
        {language ? (
          <Text style={styles.codeLanguage}>{language}</Text>
        ) : null}
        <Text selectable style={styles.codeText}>
          {node.content.replace(/\n$/, "")}
        </Text>
      </View>
    );
  },
};

const katexStyle = `
html, body {
  align-items: center;
  background: transparent;
  color: #edf1f7;
  display: flex;
  height: 100%;
  justify-content: center;
  margin: 0;
  overflow: hidden;
  padding: 0;
}
.katex {
  color: #edf1f7;
  font-size: 1.08em;
  line-height: 1.35;
  max-width: 100%;
  white-space: normal;
}
.katex-display {
  margin: 0;
}
`;

export function QuantumMarkdown({
  compact,
  content,
}: {
  compact?: boolean;
  content: string;
}) {
  const segments = splitContent(content);

  return (
    <View style={[styles.root, compact && styles.compactRoot]}>
      {segments.map((segment, index) => {
        if (segment.type === "math") {
          return (
            <MathExpression
              displayMode={segment.displayMode}
              expression={segment.expression}
              key={`math-${index}-${segment.expression}`}
            />
          );
        }

        return (
          <Markdown
            key={`markdown-${index}`}
            markdownit={markdownIt}
            mergeStyle
            onLinkPress={openSafeLink}
            rules={markdownRules}
            style={markdownStyles}
          >
            {segment.value.trim()}
          </Markdown>
        );
      })}
    </View>
  );
}

export function getContentSignals(content: string) {
  const signals: string[] = [];

  if (hasMarkdownStructure(content)) signals.push("Markdown");
  if (hasMathExpression(content)) signals.push("Math");
  if (/```[\s\S]*?```/.test(content)) signals.push("Code");

  return signals;
}

function MathExpression({
  displayMode,
  expression,
}: {
  displayMode: boolean;
  expression: string;
}) {
  return (
    <View style={[styles.mathFrame, displayMode && styles.mathDisplayFrame]}>
      <Katex
        displayMode={displayMode}
        errorColor="#f28b82"
        expression={expression}
        inlineStyle={katexStyle}
        javaScriptEnabled
        originWhitelist={["*"]}
        style={[
          styles.mathWebView,
          displayMode ? styles.mathDisplay : styles.mathInline,
        ]}
        throwOnError={false}
      />
    </View>
  );
}

function splitContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let buffer = "";
  let index = 0;

  const flushMarkdown = () => {
    if (!buffer.trim()) {
      buffer = "";
      return;
    }

    segments.push(...promoteStandaloneMath(buffer));
    buffer = "";
  };

  while (index < content.length) {
    if (content.startsWith("```", index)) {
      const end = content.indexOf("```", index + 3);
      const nextIndex = end === -1 ? content.length : end + 3;
      buffer += content.slice(index, nextIndex);
      index = nextIndex;
      continue;
    }

    const displayDollar = readDelimitedMath(content, index, "$$", "$$", true);
    if (displayDollar) {
      flushMarkdown();
      segments.push(displayDollar.segment);
      index = displayDollar.nextIndex;
      continue;
    }

    const displayBracket = readDelimitedMath(content, index, "\\[", "\\]", true);
    if (displayBracket) {
      flushMarkdown();
      segments.push(displayBracket.segment);
      index = displayBracket.nextIndex;
      continue;
    }

    const inlineParen = readDelimitedMath(content, index, "\\(", "\\)", false);
    if (inlineParen) {
      flushMarkdown();
      segments.push(inlineParen.segment);
      index = inlineParen.nextIndex;
      continue;
    }

    const inlineDollar = readDelimitedMath(content, index, "$", "$", false);
    if (inlineDollar && isLikelyInlineMath(inlineDollar.segment.expression)) {
      flushMarkdown();
      segments.push(inlineDollar.segment);
      index = inlineDollar.nextIndex;
      continue;
    }

    buffer += content[index];
    index += 1;
  }

  flushMarkdown();

  return segments.length > 0 ? segments : [{ type: "markdown", value: content }];
}

function promoteStandaloneMath(value: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let markdownBuffer = "";

  const flush = () => {
    if (markdownBuffer.trim()) {
      segments.push({ type: "markdown", value: markdownBuffer });
    }

    markdownBuffer = "";
  };

  for (const line of value.split("\n")) {
    const trimmed = line.trim();

    if (trimmed && isStandaloneFormula(trimmed)) {
      flush();
      segments.push({
        displayMode: true,
        expression: trimmed,
        type: "math",
      });
      continue;
    }

    markdownBuffer += `${line}\n`;
  }

  flush();

  return segments;
}

function readDelimitedMath(
  value: string,
  index: number,
  open: string,
  close: string,
  displayMode: boolean,
) {
  if (!value.startsWith(open, index)) return null;

  const start = index + open.length;
  const end = findUnescaped(value, close, start);
  if (end === -1) return null;

  const expression = value.slice(start, end).trim();
  if (!expression) return null;

  return {
    nextIndex: end + close.length,
    segment: {
      displayMode,
      expression,
      type: "math" as const,
    },
  };
}

function findUnescaped(value: string, needle: string, start: number) {
  let index = value.indexOf(needle, start);

  while (index !== -1) {
    if (!isEscaped(value, index)) return index;
    index = value.indexOf(needle, index + needle.length);
  }

  return -1;
}

function isEscaped(value: string, index: number) {
  let slashCount = 0;

  for (let i = index - 1; i >= 0 && value[i] === "\\"; i -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function hasMarkdownStructure(content: string) {
  return /(^|\n)(#{1,6}\s|\s*[-*]\s|\s*\d+\.\s|>\s)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|```/.test(
    content,
  );
}

function hasMathExpression(content: string) {
  return (
    /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/.test(content) ||
    content
      .split("\n")
      .some(line => isStandaloneFormula(line.trim()) || isLikelyInlineMath(line))
  );
}

function isLikelyInlineMath(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 180) return false;

  return /(?:\\frac|\\sqrt|\\sum|\\int|[=+\-*/^_<>≤≥±√∑∫π∞])/.test(trimmed);
}

function isStandaloneFormula(value: string) {
  if (!isLikelyInlineMath(value)) return false;
  if (/```|https?:\/\//i.test(value)) return false;

  const proseWords = value.match(/[A-Za-z]{4,}/g) ?? [];
  const mostlyFormula = /^[\s\w\d=+\-*/^_().,{}[\]<>:;|\\≤≥±√∑∫π∞]+$/.test(
    value,
  );

  return mostlyFormula && proseWords.length <= 3;
}

function openSafeLink(url: string) {
  if (!safeUrl(url)) return false;

  void Linking.openURL(url);
  return true;
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

const markdownStyles = StyleSheet.create({
  blockquote: {
    borderLeftColor: "rgba(138, 180, 248, 0.5)",
    borderLeftWidth: 3,
    marginVertical: 6,
    paddingLeft: 10,
  },
  body: {
    color: "#edf1f7",
    fontSize: 15,
    lineHeight: 23,
  },
  bullet_list: {
    marginBottom: 6,
  },
  code_inline: {
    backgroundColor: "rgba(100, 112, 132, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 6,
    borderWidth: 1,
    color: "#f4f7fb",
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  em: {
    color: "#d6dbe6",
  },
  heading1: {
    color: "#f4f7fb",
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 24,
    marginBottom: 8,
    marginTop: 4,
  },
  heading2: {
    color: "#f4f7fb",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
    marginBottom: 7,
    marginTop: 4,
  },
  heading3: {
    color: "#f4f7fb",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
    marginBottom: 6,
    marginTop: 3,
  },
  hr: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    height: 1,
    marginVertical: 10,
  },
  link: {
    color: "#8ab4f8",
    fontWeight: "800",
  },
  list_item: {
    color: "#edf1f7",
    marginBottom: 4,
  },
  ordered_list: {
    marginBottom: 6,
  },
  paragraph: {
    color: "#edf1f7",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 8,
    marginTop: 0,
  },
  strong: {
    color: "#ffffff",
    fontWeight: "900",
  },
  table: {
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 8,
  },
  td: {
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    color: "#d6dbe6",
    padding: 8,
  },
  th: {
    backgroundColor: "rgba(138, 180, 248, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    color: "#f4f7fb",
    fontWeight: "900",
    padding: 8,
  },
});

const styles = StyleSheet.create({
  codeBlock: {
    backgroundColor: "#090c12",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  codeLanguage: {
    backgroundColor: "rgba(100, 112, 132, 0.18)",
    color: "#8a93a5",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: "uppercase",
  },
  codeText: {
    color: "#edf1f7",
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
    fontSize: 12,
    lineHeight: 18,
    padding: 11,
  },
  compactRoot: {
    gap: 4,
  },
  mathDisplay: {
    height: 92,
  },
  mathDisplayFrame: {
    backgroundColor: "rgba(138, 180, 248, 0.06)",
    borderColor: "rgba(138, 180, 248, 0.14)",
    borderRadius: 13,
    borderWidth: 1,
    paddingVertical: 4,
  },
  mathFrame: {
    marginBottom: 9,
    overflow: "hidden",
  },
  mathInline: {
    height: 48,
  },
  mathWebView: {
    backgroundColor: "transparent",
    width: "100%",
  },
  root: {
    gap: 6,
  },
});
