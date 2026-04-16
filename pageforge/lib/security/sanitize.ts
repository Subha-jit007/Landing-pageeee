// ═══════════════════════════════════════════════════════════════════
// SECURITY LAYER 2: HTML sanitization (XSS prevention)
// All user-controlled HTML is run through DOMPurify before being
// rendered or stored. This strips <script>, inline event handlers,
// javascript: URLs, and other XSS vectors.
// ═══════════════════════════════════════════════════════════════════
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML intended for rendering. Allows rich landing page markup
 * but strips scripts, event handlers, and dangerous URI schemes.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    // Allow the tags we need for landing pages (semantic + styling)
    ALLOWED_TAGS: [
      "html", "head", "body", "meta", "title", "link", "style",
      "div", "span", "section", "article", "header", "footer", "nav", "main", "aside",
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "blockquote", "hr", "br",
      "ul", "ol", "li", "dl", "dt", "dd",
      "a", "strong", "em", "b", "i", "u", "small", "code", "pre", "mark",
      "img", "picture", "source", "figure", "figcaption", "svg", "path", "circle", "rect", "g", "defs", "linearGradient", "stop", "polygon", "polyline", "line", "text",
      "button", "label", "form", "input", "textarea", "select", "option",
      "table", "thead", "tbody", "tr", "td", "th",
    ],
    ALLOWED_ATTR: [
      "class", "id", "style", "href", "target", "rel", "src", "alt", "title",
      "width", "height", "viewBox", "fill", "stroke", "stroke-width", "d", "cx", "cy", "r",
      "x", "y", "x1", "y1", "x2", "y2", "points", "offset", "stop-color",
      "placeholder", "type", "name", "value", "disabled", "readonly", "aria-label",
      "aria-hidden", "role", "tabindex",
      "data-animate", "data-section", "data-gsap",
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "base", "applet"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "formaction"],
    ALLOW_DATA_ATTR: true,
    KEEP_CONTENT: false,
    // Preserve full-document wrappers (<html><head><body>) since we
    // generate complete pages, not fragments.
    WHOLE_DOCUMENT: true,
    RETURN_TRUSTED_TYPE: false,
  }) as string;
}

/**
 * Sanitize short user-provided text (titles, prompts) by escaping HTML.
 */
export function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
