/**
 * SlothitudeGames Blog — renders posts from posts.json
 * Inline expansion, simple markdown-to-HTML conversion
 */
(function () {
  'use strict';

  const POSTS_URL = 'blog/posts.json';
  let posts = [];

  // ---------------------------------------------------------------------------
  // Simple markdown → HTML renderer
  // Handles: headers (##), bold, italic, links, inline code, fenced code blocks,
  //          unordered lists, horizontal rules, tables
  // ---------------------------------------------------------------------------
  function renderMarkdown(md) {
    let html = md;

    // Fenced code blocks (```...```) — extract before other transforms
    html = html.replace(/```([\s\S]*?)```/g, function (_match, code) {
      // Trim leading newline from code block content
      code = code.replace(/^\n/, '').replace(/\n$/, '');
      return '<pre><code>' + escapeHtml(code) + '</code></pre>';
    });

    // Split into lines for block-level processing
    const lines = html.split('\n');
    const out = [];
    let inList = false;
    let inTable = false;
    let tableRows = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Skip lines inside <pre> blocks (already rendered above)
      if (line.includes('<pre>')) {
        if (inList) { out.push('</ul>'); inList = false; }
        if (inTable) { out.push(renderTable(tableRows)); inTable = false; tableRows = []; }
        // Collect the full pre block
        out.push(line);
        continue;
      }

      // Horizontal rule
      if (/^---+$/.test(line.trim())) {
        if (inList) { out.push('</ul>'); inList = false; }
        if (inTable) { out.push(renderTable(tableRows)); inTable = false; tableRows = []; }
        out.push('<hr>');
        continue;
      }

      // Table rows  (| col | col |)
      if (/^\|(.+)\|$/.test(line.trim())) {
        if (inList) { out.push('</ul>'); inList = false; }
        // Skip separator rows (|---|---|)
        if (/^\|[\s\-:]+\|$/.test(line.trim())) continue;
        inTable = true;
        tableRows.push(line.trim());
        continue;
      } else if (inTable) {
        out.push(renderTable(tableRows));
        inTable = false;
        tableRows = [];
      }

      // Headers  (## Title)
      const headerMatch = line.match(/^(#{1,4})\s+(.+)/);
      if (headerMatch) {
        if (inList) { out.push('</ul>'); inList = false; }
        const level = headerMatch[1].length;
        out.push('<h' + (level + 1) + '>' + inlineFormat(headerMatch[2]) + '</h' + (level + 1) + '>');
        continue;
      }

      // Unordered list items  (- text or * text)
      const listMatch = line.match(/^[\-\*]\s+(.+)/);
      if (listMatch) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + inlineFormat(listMatch[1]) + '</li>');
        continue;
      } else if (inList) {
        out.push('</ul>');
        inList = false;
      }

      // Numbered list  (1. text)
      const olMatch = line.match(/^\d+\.\s+(.+)/);
      if (olMatch) {
        // Treat as regular paragraph for simplicity
        out.push('<p>' + inlineFormat(olMatch[1]) + '</p>');
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        continue;
      }

      // Paragraph
      out.push('<p>' + inlineFormat(line) + '</p>');
    }

    if (inList) out.push('</ul>');
    if (inTable && tableRows.length) out.push(renderTable(tableRows));

    return out.join('\n');
  }

  function renderTable(rows) {
    let html = '<table>';
    rows.forEach(function (row, idx) {
      const cells = row.split('|').slice(1, -1).map(function (c) { return c.trim(); });
      const tag = idx === 0 ? 'th' : 'td';
      html += '<tr>';
      cells.forEach(function (cell) {
        html += '<' + tag + '>' + inlineFormat(cell) + '</' + tag + '>';
      });
      html += '</tr>';
    });
    html += '</table>';
    return html;
  }

  function inlineFormat(text) {
    // Inline code  (`code`)
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold  (**text**)
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic  (*text*)
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Links  [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return text;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ---------------------------------------------------------------------------
  // Date formatting
  // ---------------------------------------------------------------------------
  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  function renderPostPreviews() {
    const container = document.getElementById('blog-posts');
    if (!container) return;

    container.innerHTML = '';

    posts.forEach(function (post) {
      const el = document.createElement('article');
      el.className = 'blog-post';
      el.dataset.postId = post.id;

      el.innerHTML =
        '<div class="blog-post__header">' +
          '<time class="blog-post__date" datetime="' + post.date + '">' + formatDate(post.date) + '</time>' +
          '<h3 class="blog-post__title">' + escapeHtml(post.title) + '</h3>' +
          (post.tags ? '<div class="blog-post__tags">' + post.tags.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' : '') +
        '</div>' +
        '<p class="blog-post__excerpt">' + escapeHtml(post.excerpt) + '</p>' +
        '<button class="blog-post__read-more btn btn--outline btn--sm">Read More</button>' +
        '<div class="blog-post__content" hidden>' + renderMarkdown(post.content) + '</div>';

      el.querySelector('.blog-post__read-more').addEventListener('click', function () {
        togglePost(el);
      });

      el.querySelector('.blog-post__title').addEventListener('click', function () {
        togglePost(el);
      });

      container.appendChild(el);
    });
  }

  function togglePost(el) {
    const content = el.querySelector('.blog-post__content');
    const btn = el.querySelector('.blog-post__read-more');
    const expanded = !content.hidden;

    if (expanded) {
      content.hidden = true;
      el.classList.remove('blog-post--expanded');
      btn.textContent = 'Read More';
    } else {
      content.hidden = false;
      el.classList.add('blog-post--expanded');
      btn.textContent = 'Close';
      // Scroll into view smoothly
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  async function init() {
    try {
      const resp = await fetch(POSTS_URL);
      if (!resp.ok) throw new Error('Failed to load posts: ' + resp.status);
      posts = await resp.json();
      renderPostPreviews();
    } catch (err) {
      const container = document.getElementById('blog-posts');
      if (container) {
        container.innerHTML = '<p class="blog-error">Could not load blog posts. Please try again later.</p>';
      }
      console.error('[blog]', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
