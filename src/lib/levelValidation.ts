export type CSSRule = {
  selector?: string;
  property?: string;
  value?: string;
  withinMedia?: string;
  rule?: string;
  inside?: string;
};

export type HTMLRule = {
  tag: string;
  contentRequired?: boolean;
};

export type JSRule = {
  codePattern: string;
};

export type Validation = {
  type: "cssContains" | "htmlContains" | "jsContains" | "manual";
  rules: (CSSRule | HTMLRule | JSRule)[];
};

export type RuleCheckResult = {
  passed: boolean;
  targetTab: "html" | "css";
  line: number;
  message: string;
  arrowLabel: string;
  expectedSnippet: string;
};

export type ValidationOutcome = {
  allPassed: boolean;
  results: RuleCheckResult[];
  expectedHtml: string;
  expectedCss: string;
};

function findLineContaining(code: string, search: string | RegExp): number {
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (typeof search === "string" ? line.includes(search) : search.test(line)) {
      return i + 1;
    }
  }
  return 1;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function checkCssRule(cssCode: string, rule: CSSRule): boolean {
  const { selector, property, value, withinMedia, rule: mediaRule, inside } = rule;
  if (selector && property && value && !withinMedia) {
    const regex = new RegExp(
      `${escapeRegex(selector)}\\s*\\{[^}]*${escapeRegex(property)}\\s*:\\s*${escapeRegex(value)}[;\\s]`,
      "i",
    );
    return regex.test(cssCode);
  }
  if (mediaRule && inside) {
    const mediaRegex = new RegExp(
      `${escapeRegex(mediaRule)}\\s*\\{[^}]*${escapeRegex(inside)}[^}]*\\}`,
      "i",
    );
    return mediaRegex.test(cssCode);
  }
  if (selector && property && value && withinMedia) {
    const mediaRegex = new RegExp(
      `${escapeRegex(withinMedia)}\\s*\\{[^}]*${escapeRegex(selector)}\\s*\\{[^}]*${escapeRegex(property)}\\s*:\\s*${escapeRegex(value)}[;\\s][^}]*\\}[^}]*\\}`,
      "i",
    );
    return mediaRegex.test(cssCode);
  }
  return false;
}

function checkHtmlRule(htmlCode: string, rule: HTMLRule): boolean {
  const { tag, contentRequired } = rule;
  if (!tag) return false;
  const tagRegex = new RegExp(`<${tag}[\\s>]`, "i");
  if (!tagRegex.test(htmlCode)) return false;
  if (contentRequired) {
    const contentRegex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
    const match = htmlCode.match(contentRegex);
    return !!(match && match[1] && match[1].trim().length > 0);
  }
  return true;
}

function cssRuleMessage(rule: CSSRule): string {
  const { selector, property, value, withinMedia, rule: mediaRule, inside } = rule;
  if (mediaRule && inside) {
    return `Внутри ${mediaRule} должно быть: ${inside}`;
  }
  if (selector && property && value && withinMedia) {
    return `В ${withinMedia} для ${selector} задайте ${property}: ${value}`;
  }
  if (selector && property && value) {
    return `В ${selector} добавьте ${property}: ${value}`;
  }
  return "Проверьте CSS-правило";
}

function cssArrowLabel(rule: CSSRule): string {
  const { selector, property, value } = rule;
  if (selector && property && value) {
    return `${selector} → ${property}: ${value}`;
  }
  return cssRuleMessage(rule);
}

function cssExpectedSnippet(rule: CSSRule): string {
  const { selector, property, value } = rule;
  if (selector && property && value) {
    return `${selector} {\n  ${property}: ${value};\n}`;
  }
  return cssRuleMessage(rule);
}

function findCssRuleLine(cssCode: string, rule: CSSRule): number {
  const { selector, property } = rule;
  if (selector) {
    const line = findLineContaining(cssCode, selector);
    if (line > 1 || cssCode.includes(selector)) return line;
  }
  if (property) {
    return findLineContaining(cssCode, property);
  }
  return 1;
}

function applyCssFix(cssCode: string, rule: CSSRule): string {
  const { selector, property, value } = rule;
  if (!selector || !property || !value) return cssCode;

  const blockRegex = new RegExp(
    `(${escapeRegex(selector)}\\s*\\{)([^}]*)\\}`,
    "i",
  );
  const match = cssCode.match(blockRegex);
  if (match) {
    const inner = match[2];
    if (new RegExp(`${escapeRegex(property)}\\s*:`, "i").test(inner)) {
      const updatedInner = inner.replace(
        new RegExp(`${escapeRegex(property)}\\s*:[^;]+;?`, "i"),
        `${property}: ${value};`,
      );
      return cssCode.replace(blockRegex, `$1${updatedInner}}`);
    }
    return cssCode.replace(
      blockRegex,
      `$1${inner.trim() ? inner : "\n  "}${inner.trim() && !inner.trim().endsWith(";") ? ";" : ""}\n  ${property}: ${value};\n}`,
    );
  }
  return `${cssCode.trim()}\n\n${selector} {\n  ${property}: ${value};\n}`;
}

function findHtmlRuleLine(htmlCode: string, rule: HTMLRule): number {
  const tagLine = findLineContaining(htmlCode, new RegExp(`<${rule.tag}`, "i"));
  return tagLine;
}

function htmlRuleMessage(rule: HTMLRule): string {
  if (rule.contentRequired) {
    return `Тег <${rule.tag}> должен содержать текст`;
  }
  return `Добавьте тег <${rule.tag}>`;
}

function applyHtmlFix(htmlCode: string, rule: HTMLRule): string {
  const { tag, contentRequired } = rule;
  const openRegex = new RegExp(`<${tag}([^>]*)>\\s*</${tag}>`, "i");
  if (openRegex.test(htmlCode) && contentRequired) {
    return htmlCode.replace(openRegex, `<${tag}$1>Текст</${tag}>`);
  }
  const selfClose = new RegExp(`<${tag}([^>]*)\\s*/>`, "i");
  if (selfClose.test(htmlCode) && contentRequired) {
    return htmlCode.replace(selfClose, `<${tag}$1>Текст</${tag}>`);
  }
  if (!new RegExp(`<${tag}[\\s>]`, "i").test(htmlCode)) {
    return `${htmlCode.trim()}\n<${tag}>${contentRequired ? "Текст" : ""}</${tag}>`;
  }
  const emptyRegex = new RegExp(`<${tag}([^>]*)>\\s*</${tag}>`, "i");
  if (contentRequired && emptyRegex.test(htmlCode)) {
    return htmlCode.replace(emptyRegex, `<${tag}$1>Текст</${tag}>`);
  }
  return htmlCode;
}

export function validateLevelCode(
  htmlCode: string,
  cssCode: string,
  validationJson: string | null | undefined,
): ValidationOutcome {
  const fallback: ValidationOutcome = {
    allPassed: false,
    results: [],
    expectedHtml: htmlCode,
    expectedCss: cssCode,
  };

  if (!validationJson) return fallback;

  let validation: Validation;
  try {
    validation = JSON.parse(validationJson);
  } catch {
    return fallback;
  }

  if (validation.type === "manual") {
    return { allPassed: false, results: [], expectedHtml: htmlCode, expectedCss: cssCode };
  }

  const results: RuleCheckResult[] = [];
  let expectedHtml = htmlCode;
  let expectedCss = cssCode;

  if (validation.type === "cssContains") {
    for (const rule of validation.rules as CSSRule[]) {
      const passed = checkCssRule(cssCode, rule);
      if (!passed) {
        results.push({
          passed: false,
          targetTab: "css",
          line: findCssRuleLine(cssCode, rule),
          message: cssRuleMessage(rule),
          arrowLabel: cssArrowLabel(rule),
          expectedSnippet: cssExpectedSnippet(rule),
        });
        expectedCss = applyCssFix(expectedCss, rule);
      }
    }
  }

  if (validation.type === "htmlContains") {
    for (const rule of validation.rules as HTMLRule[]) {
      const passed = checkHtmlRule(htmlCode, rule);
      if (!passed) {
        results.push({
          passed: false,
          targetTab: "html",
          line: findHtmlRuleLine(htmlCode, rule),
          message: htmlRuleMessage(rule),
          arrowLabel: `<${rule.tag}>`,
          expectedSnippet: rule.contentRequired
            ? `<${rule.tag}>Текст</${rule.tag}>`
            : `<${rule.tag}></${rule.tag}>`,
        });
        expectedHtml = applyHtmlFix(expectedHtml, rule);
      }
    }
  }

  if (validation.type === "jsContains") {
    const scriptMatch = htmlCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const jsCode = scriptMatch ? scriptMatch[1] : htmlCode;
    for (const rule of validation.rules as JSRule[]) {
      const { codePattern } = rule;
      const passed = codePattern
        ? new RegExp(codePattern, "i").test(jsCode)
        : false;
      if (!passed) {
        results.push({
          passed: false,
          targetTab: "html",
          line: findLineContaining(htmlCode, "<script"),
          message: `В скрипте должно быть: ${codePattern}`,
          arrowLabel: codePattern,
          expectedSnippet: `// ${codePattern}`,
        });
      }
    }
  }

  return {
    allPassed: results.length === 0,
    results,
    expectedHtml,
    expectedCss,
  };
}
