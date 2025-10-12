// scripts/apply-longtail-layout.js
// Batch apply long-tail layout updates to examples/fractions/**/index.html
// - Remove: injected tool-tabs, injected popular, injected micro-story, "What is ... as a decimal?" section
// - Ensure/replace: "Instant result" section and "Long division (final steps)" pre diagram
// - Keep other content intact (head/meta/JSON-LD/How to/Related/About)
// - Idempotent: detects and replaces existing sections rather than duplicating
// Usage:
//   node scripts/apply-longtail-layout.js
//   node scripts/apply-longtail-layout.js --only=1-4-as-decimal

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FRACTIONS_DIR = path.join(ROOT, 'examples', 'fractions');

// ---- Math helpers ----
function fractionToDecimal(n, d, maxDigits = 200) {
  const sign = (n * d) < 0 ? '-' : '';
  n = Math.abs(n); d = Math.abs(d);
  const intPart = Math.floor(n / d);
  let rem = n % d;
  if (rem === 0) {
    const plain = sign + String(intPart);
    return { pretty: plain, ellipsis: plain, repeating: false, plain };
  }
  const seen = new Map();
  let frac = '';
  let repStart = -1;
  while (rem !== 0 && frac.length < maxDigits) {
    if (seen.has(rem)) { repStart = seen.get(rem); break; }
    seen.set(rem, frac.length);
    rem *= 10;
    const digit = Math.floor(rem / d);
    frac += String(digit);
    rem %= d;
  }
  if (repStart !== -1) {
    const nonRep = frac.slice(0, repStart);
    const rep = frac.slice(repStart);
    const pretty = `${sign}${intPart}.${nonRep}(${rep})`;
    const repShow = rep.slice(0, 3) + (rep.length > 3 ? '…' : '');
    const ellipsis = `${sign}${intPart}.${nonRep}${repShow}…`;
    return { pretty, ellipsis, repeating: true, plain: `${sign}${intPart}.${frac}` };
  } else {
    const plain = `${sign}${intPart}.${frac}`;
    return { pretty: plain, ellipsis: plain, repeating: false, plain };
  }
}
function twoDp(n, d) {
  const val = (n / d);
  return val.toFixed(2);
}
function percentStr(n, d, places = 2) {
  return ((n / d) * 100).toFixed(places) + '%';
}

// Generate a short, unique English micro-story for each fraction
function buildMicroStory(n, d) {
  const dec = fractionToDecimal(n, d);
  const pct = percentStr(n, d, 2);
  const num = Math.abs(n), den = Math.abs(d);
  const isRepeating = dec.repeating;
  const pretty = dec.pretty;
  const two = twoDp(n, d);

  const templatesRepeating = [
    `Math quirk alert: ${num}/${den} becomes ${pretty}, about ${pct}. The digits seem to love an encore — repeating on and on with unapologetic flair.`,
    `Endless rhythm: ${num}/${den} turns into ${pretty} (${pct}). It keeps looping like a catchy chorus you can’t shake off.`,
    `Spot the loop: ${num}/${den} is ${pretty}, roughly ${pct}. Not a bug — a stylish repeat performance in decimal form.`
  ];
  const templatesTerminating = [
    `Clean cut: ${num}/${den} is ${two} — that’s ${pct}. Precise, tidy, and done. Like a well‑timed exit.`,
    `No fuss: ${num}/${den} equals ${two} (${pct}). Takes its share and leaves no crumbs behind.`,
    `Neat finish: ${num}/${den} becomes ${two}, about ${pct}. Straightforward math with a polite full stop.`
  ];
  const pool = isRepeating ? templatesRepeating : templatesTerminating;
  // Pick a template deterministically for idempotency
  const idx = (num * 31 + den * 17) % pool.length;
  return pool[idx];
}

// Generate minimal final long-division diagram as pre text
function buildLongDivisionPre(n, d, maxLines = 10) {
  const dec = fractionToDecimal(n, d);
  let top;
  if (dec.repeating) {
    // 循环：顶行显示完整值（整数部分 + 至少3位小数，不四舍五入）
    const m = dec.pretty.match(/^(-?\d+)\.(\d*?)(?:\((\d+)\))?$/);
    if (m) {
      const intPartStr = m[1];
      const nonRep = m[2] || '';
      const rep = m[3] || '';
      let frac = `${nonRep}${rep}`;
      if (rep) {
        while (frac.length < 3) frac += rep;
        // 至少3位；若非循环+1个循环节更长，则保留完整（如 0.142857）
        frac = frac.slice(0, Math.max(3, (nonRep + rep).length));
      }
      top = frac ? `${intPartStr}.${frac}` : intPartStr;
    } else {
      // 兜底：从 plain 解析整数与小数，最多10位（不四舍五入）
      const plain = dec.plain;
      const [intPartStr = '0', fracStr = ''] = plain.split('.');
      const frac = fracStr.slice(0, 10);
      top = frac ? `${intPartStr}.${frac}` : intPartStr;
    }
  } else {
    // 非循环：显示完整数值（整数部分 + 小数部分），小数最多10位（不四舍五入）
    const plain = dec.plain;
    const [intPartStr, fracStr = ''] = plain.split('.');
    top = fracStr ? `${intPartStr}.${fracStr.slice(0, 10)}` : intPartStr;
  }

  let lines = [];
  n = Math.abs(n); d = Math.abs(d);
  const intPart = Math.floor(n / d);
  let rem = n % d;

  // 顶行对齐到 n 的最后一位（如 50 的“0”列）
  const headerNStart = 4 + String(d).length + 1; // 4空格 + d + '｜'
  const topIndent = headerNStart + (String(n).length);
  lines.push(`${' '.repeat(topIndent)}${top}`);
  lines.push(`      --------`);
  lines.push(`    ${d}｜${n}.${'0'.repeat(3)}`);

  // If there is a non-zero integer part, print the initial product (intPart * d) aligned under n
  if (intPart > 0) {
    const intProd = intPart * d;
    // 4 leading spaces + length of d + '｜' positions before n
    const headerNStart = 4 + String(d).length + 1;
    const prodIndent0 = headerNStart + (String(n).length - String(intProd).length);
    lines.push(`${' '.repeat(prodIndent0)}${intProd}`);
    // separator starts one column left of product start
    lines.push(`${' '.repeat(prodIndent0 - 1)}----`);
  }



  // 根据顶行小数位数，按位输出长除法小数步骤
  let current = rem;
  const parts = top.includes('.') ? top.split('.') : [top, ''];
  const cycles = parts[1].length;

  let lastProdIndent = null;
  let lastProdStrLen = null;

  if (intPart === 0) {
    // 无整数部分：首位仅输出乘积与分隔线（不打印 dividend）
    if (cycles > 0) {
      const dividend0 = current * 10;
      const q0 = Math.floor(dividend0 / d);
      const prod0 = q0 * d;
      const baseIndent0 = 8 + 0;
      const prodStr0 = String(prod0);
      const prodIndent0 = baseIndent0 + (String(dividend0).length - prodStr0.length);
      lines.push(`${' '.repeat(prodIndent0)}${prodStr0}`);
      lines.push(`${' '.repeat(prodIndent0 - 1)}----`);
      current = dividend0 - prod0;
      lastProdIndent = prodIndent0;
      lastProdStrLen = prodStr0.length;
    }
    for (let i = 1; i < cycles; i++) {
      const dividend = current * 10;
      const q = Math.floor(dividend / d);
      const prod = q * d;
      const baseIndent = 8 + i;
      lines.push(`${' '.repeat(baseIndent)}${dividend}`);
      const prodStr = String(prod);
      const prodIndent = baseIndent + (String(dividend).length - prodStr.length);
      lines.push(`${' '.repeat(prodIndent)}${prodStr}`);
      lines.push(`${' '.repeat(prodIndent - 1)}----`);
      current = dividend - prod;
      lastProdIndent = prodIndent;
      lastProdStrLen = prodStr.length;
    }
  } else {
    // 有整数部分：每个小数位都打印 dividend → product → ----
    for (let i = 0; i < cycles; i++) {
      const dividend = current * 10;
      const q = Math.floor(dividend / d);
      const prod = q * d;
      const baseIndent = 8 + i;
      lines.push(`${' '.repeat(baseIndent)}${dividend}`);
      const prodStr = String(prod);
      const prodIndent = baseIndent + (String(dividend).length - prodStr.length);
      lines.push(`${' '.repeat(prodIndent)}${prodStr}`);
      lines.push(`${' '.repeat(prodIndent - 1)}----`);
      current = dividend - prod;
      lastProdIndent = prodIndent;
      lastProdStrLen = prodStr.length;
    }
  }

  // 输出余数：与上一行乘积的个位对齐
  const remStr = String(current);
  const remIndent = (lastProdIndent ?? (4 + String(d).length + 1)) + Math.max(0, (lastProdStrLen ?? 1) - remStr.length);
  lines.push(`${' '.repeat(remIndent)}${remStr}`);

  return lines.join('\n');
}

// ---- HTML patch helpers ----
function listPages(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      const p = path.join(dir, e.name, 'index.html');
      if (fs.existsSync(p)) out.push(p);
    }
  }
  return out;
}

function parseSlug(filePath) {
  const slug = path.basename(path.dirname(filePath)); // e.g., 1-3-as-decimal
  const m = slug.match(/^(\d+)-(\d+)-as-decimal$/);
  if (!m) return null;
  return { n: Number(m[1]), d: Number(m[2]), slug };
}

function removeBlocks(html) {
  // Remove injected tool-tabs
  html = html.replace(/[\t ]*<!-- injected:tool-tabs -->(?:.|\n)*?<nav[^>]*class="tool-tabs"[\s\S]*?<\/nav>\s*/i, '');
  // Remove injected:popular section
  html = html.replace(/[\t ]*<!-- injected:popular -->(?:.|\n)*?<section[^>]*class="popular[^"]*"[\s\S]*?<\/section>\s*/i, '');
  // Remove injected:micro-story section
  html = html.replace(/[\t ]*<!-- injected:micro-story -->(?:.|\n)*?<section[^>]*class="micro-story[^"]*"[\s\S]*?<\/section>\s*/i, '');
  // Remove "What is X/Y as a decimal?" section heuristically by its H2 text
  html = html.replace(/[\t ]*<section[^>]*>\s*<h2>\s*What is [^<]+ as a decimal\?\s*<\/h2>[\s\S]*?<\/section>\s*/i, '');
  // Remove legacy summary grid (Decimal/Simplified/Percentage)
  html = html.replace(/[\t ]*<section\s+class="grid">[\s\S]*?<\/section>\s*/i, '');
  return html;
}

function upsertMicroStory(html, n, d) {
  const story = buildMicroStory(n, d);
  const block = `<!-- Micro Story -->\n      <p>${story}</p>\n`;

  // If our marker exists, replace it
  if (html.match(/<!-- Micro Story -->/)) {
    html = html.replace(/<!-- Micro Story -->[\s\S]*?<p>[\s\S]*?<\/p>\s*/i, block);
    return html;
  }

  // If the page already has a paragraph immediately after <main class="card">, respect it (likely a curated story)
  if (/<main\s+class="card">\s*<p/i.test(html)) {
    return html;
  }

  // Otherwise insert our story right after <main class="card">
  html = html.replace(/<main\s+class="card">/i, `<main class="card">\n${block}`);
  return html;
}

function upsertInstantResult(html, n, d) {
  const dec = fractionToDecimal(n, d);
  const two = twoDp(n, d);
  const percent = percentStr(n, d, 2);
  const typeText = dec.repeating ? 'Repeating decimal' : 'Terminating decimal';
  const prettyParen = dec.repeating ? dec.pretty : dec.plain;
  const ellipsis = dec.ellipsis;

  const block = `
      <!-- Instant Result -->
      <section class="block" aria-labelledby="instant-result-heading">
        <h2 id="instant-result-heading">Instant result</h2>
        <div class="grid" style="margin-top:10px">
          <div class="muted">Expression</div>
          <div><strong><span class="fraction">${n}/${d}</span></strong></div>

          <div class="muted">Decimal (2dp)</div>
          <div><strong>${Number(two).toFixed(2)}</strong></div>

          <div class="muted">Decimal (parentheses)</div>
          <div><strong>${prettyParen}</strong></div>

          <div class="muted">Decimal (ellipsis)</div>
          <div><strong>${ellipsis}</strong></div>

          <div class="muted">Percentage</div>
          <div><strong>${percent}</strong></div>

          <div class="muted">Type</div>
          <div><strong>${typeText}</strong></div>
        </div>
      </section>`.trim();

  // Always remove existing Instant Result first to enforce correct ordering
  html = html.replace(/<section[^>]*aria-labelledby="instant-result-heading"[^>]*>[\s\S]*?<\/section>/i, '');

  // Insert after Micro Story, else after first paragraph under <main>, else after <main> opening
  if (html.match(/<!-- Micro Story -->/i)) {
    html = html.replace(/(<!-- Micro Story -->[\s\S]*?<\/p>\s*)/i, `$1\n${block}\n`);
  } else if (/<main\s+class="card">\s*<p[\s>]/i.test(html)) {
    html = html.replace(/(<main\s+class="card">\s*<p[\s\S]*?<\/p>\s*)/i, `$1\n${block}\n`);
  } else {
    html = html.replace(/<main\s+class="card">/i, `<main class="card">\n${block}\n`);
  }
  return html;
}

function upsertLongDivision(html, n, d) {
  const pre = buildLongDivisionPre(n, d);
  const block = `
      <!-- Long division Process -->
      <section class="block" aria-labelledby="long-division-steps-heading">
        <h2 id="long-division-steps-heading">Long division calculation process</h2>
        <pre class="long-division" style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size:14px; line-height:1.4; white-space: pre; overflow:auto;">
${pre}
        </pre>
      </section>`.trim();

  // Remove existing long division blocks (ours or legacy) to avoid duplicates
  html = html.replace(/<!-- Long division Process -->[\s\S]*?<section[\s\S]*?<\/section>\s*/i, '');
  html = html.replace(/<section[^>]*long-division-steps-heading[^>]*>[\s\S]*?<\/section>\s*/i, '');

  // Prefer inserting before "How to convert fraction to decimal"
  if (html.match(/<h2>\s*How to convert fraction to decimal\s*<\/h2>/i)) {
    html = html.replace(
      /\s*<section class="block">\s*<h2>\s*How to convert fraction to decimal\s*<\/h2>/i,
      `\n${block}\n      <section class="block">\n        <h2>How to convert fraction to decimal</h2>`
    );
  } else {
    // Fallback: insert before </main>
    html = html.replace(/<\/main>/i, `${block}\n    </main>`);
  }

  return html;
}

function processFile(filePath) {
  const parsed = parseSlug(filePath);
  if (!parsed) return false;
  let html = fs.readFileSync(filePath, 'utf8');
  // Cleanup stray duplicated Instant Result comment markers before rebuilding the section
  html = html.replace(/[\t ]*<!-- Instant Result -->\s*\n?/g, '');

  // 1) Remove undesired blocks
  html = removeBlocks(html);

  // 2) Upsert Micro Story (unique per page)
  html = upsertMicroStory(html, parsed.n, parsed.d);

  // 3) Upsert Instant result
  html = upsertInstantResult(html, parsed.n, parsed.d);

  // 3) Upsert Long division final steps
  html = upsertLongDivision(html, parsed.n, parsed.d);

  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

function main() {
  const onlyArg = process.argv.find(a => a.startsWith('--only='));
  let targets = [];

  if (onlyArg) {
    const slug = onlyArg.split('=')[1];
    if (!slug) {
      console.error('Invalid --only arg');
      process.exit(1);
    }
    const filePath = path.join(FRACTIONS_DIR, slug, 'index.html');
    if (!fs.existsSync(filePath)) {
      console.error('Target not found:', filePath);
      process.exit(1);
    }
    targets = [filePath];
  } else {
    targets = listPages(FRACTIONS_DIR);
  }

  let ok = 0, fail = 0;
  for (const f of targets) {
    try {
      if (processFile(f)) ok++;
    } catch (e) {
      console.error('Failed:', f, e.message);
      fail++;
    }
  }
  console.log(`Updated pages: ${ok}, failed: ${fail}`);
}

if (require.main === module) main();