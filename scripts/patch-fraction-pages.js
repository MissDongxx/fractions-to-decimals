//// Patch fraction pages: inject hreflang, tool tabs, popular, about, micro-story
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FRACTIONS_DIR = path.join(ROOT, 'examples', 'fractions');

function walkFractionPages(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const pages = [];
  for (const it of items) {
    if (it.isDirectory()) {
      const idx = path.join(dir, it.name, 'index.html');
      if (fs.existsSync(idx)) pages.push(idx);
    }
  }
  return pages;
}

function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }
function simplify(n, d) { const g = gcd(n, d); return [n / g, d / g]; }
function fractionToDecimal(n, d, maxDigits = 200) {
  const sign = (n * d) < 0 ? '-' : '';
  n = Math.abs(n); d = Math.abs(d);
  const intPart = Math.floor(n / d);
  let rem = n % d;
  if (rem === 0) {
    return { pretty: sign + String(intPart), ellipsis: sign + String(intPart), repeating: false, plain: sign + String(intPart) };
  }
  const map = new Map();
  let frac = '';
  let repeatStart = -1;
  while (rem !== 0 && frac.length < maxDigits) {
    if (map.has(rem)) { repeatStart = map.get(rem); break; }
    map.set(rem, frac.length);
    rem *= 10;
    const digit = Math.floor(rem / d);
    frac += String(digit);
    rem = rem % d;
  }
  let pretty, ellipsis, plain;
  if (repeatStart !== -1) {
    const nonRep = frac.slice(0, repeatStart);
    const rep = frac.slice(repeatStart);
    pretty = `${sign}${intPart}.${nonRep}(${rep})`;
    const repShow = rep.slice(0, Math.min(3, rep.length)) + (rep.length > 3 ? '…' : '');
    ellipsis = `${sign}${intPart}.${nonRep}${repShow}…`;
    plain = `${sign}${intPart}.${frac}`;
    return { pretty, ellipsis, repeating: true, plain };
  } else {
    pretty = `${sign}${intPart}.${frac}`;
    ellipsis = pretty;
    plain = pretty;
    return { pretty, ellipsis, repeating: false, plain };
  }
}

function toPercent(n, d, places = 2) {
  const val = (n / d) * 100;
  return val.toFixed(places) + '%';
}

function chooseStoryTemplate(percentVal, repeating) {
  // percentVal: number (0..100)
  // 5 themes: food, grade, discount, progress, distance
  // Light British/American humor, short 1-2 sentences
  const themes = [];
  if (percentVal >= 50) {
    themes.push('grade', 'progress', 'discount', 'food', 'distance');
  } else {
    themes.push('food', 'distance', 'progress', 'discount', 'grade');
  }
  // For repeating, add a math fun variant at first
  if (repeating) themes.unshift('mathfun');

  // Pick first as deterministic choice
  const theme = themes[0];

  const templates = {
    mathfun: ({ fraction, decimalPretty, percent }) =>
      `Math quirk alert: ${fraction} becomes ${decimalPretty}, which is about ${percent}. It looks like the digits fancy a conga line — repeating on and on. Mathematicians call it “periodic”; we call it “cheeky”.`,
    food: ({ fraction, decimalPretty, percent }) =>
      `Imagine a pizza party: ${fraction} as decimal is ${decimalPretty}, roughly ${percent} of the whole. Not quite a full slice, but enough to claim you “already had lunch” — technically true, morally dubious.`,
    grade: ({ fraction, decimalPretty, percent }) =>
      `${fraction} converts to ${decimalPretty}, about ${percent}. A respectable score — the kind that says “I revised… mostly”. Your teacher nods, your cat remains unimpressed.`,
    discount: ({ fraction, decimalPretty, percent }) =>
      `${fraction} equals ${decimalPretty}, nearly ${percent} off. Bargain hunters celebrate; wallets breathe a sigh of relief. Still, remember: two discounts don’t add up like fractions — sadly.`,
    progress: ({ fraction, decimalPretty, percent }) =>
      `Progress report: ${fraction} is ${decimalPretty}, around ${percent} done. Enough to deserve a biscuit break, not quite enough to write a triumphant email to the team.`,
    distance: ({ fraction, decimalPretty, percent }) =>
      `On the road: ${fraction} turns into ${decimalPretty}, which is about ${percent} of the journey. Stretch your legs, check the map, and pretend you always knew this was the scenic route.`
  };

  return templates[theme];
}

function ensureHreflang(html, canonicalUrl) {
  if (html.includes('<!-- injected:hreflang -->')) return html;
  const linkBlock =
`  <!-- injected:hreflang -->
  <link rel="alternate" href="${canonicalUrl}" hreflang="en" />
  <link rel="alternate" href="${canonicalUrl}" hreflang="x-default" />
`;
  return html.replace(/<\/head>/i, linkBlock + '\n</head>');
}

function ensureToolTabs(html) {
  if (html.includes('<!-- injected:tool-tabs -->')) return html;
  // Insert after <header ...> ... </header> OR just after <header> closing h1
  const nav =
`\n      <!-- injected:tool-tabs -->
      <nav class="tool-tabs" aria-label="Tools">
        <a href="/fraction-to-decimal.html" class="tab-btn" data-i18n="fractionToDecimal">Fraction to Decimal</a>
        <a href="/decimal-to-fraction.html" class="tab-btn" data-i18n="decimalToFraction">Decimal to Fraction</a>
      </nav>\n`;
  if (html.includes('</header>')) {
    return html.replace('</header>', `</header>${nav}`);
  }
  // Fallback: insert after <h1>
  return html.replace(/<h1[^>]*>[^<]*<\/h1>/i, (m) => m + nav);
}

function ensurePopular(html) {
  if (html.includes('<!-- injected:popular -->')) return html;
  const block =
`\n      <!-- injected:popular -->
      <section class="popular block">
        <h2>Popular Conversions</h2>
        <ul>
          <li><a href="/examples/fractions/1-2-as-decimal/">1/2 as decimal</a></li>
          <li><a href="/examples/fractions/3-4-as-decimal/">3/4 as decimal</a></li>
          <li><a href="/examples/fractions/5-8-as-decimal/">5/8 as decimal</a></li>
        </ul>
      </section>\n`;
  // Insert before the last custom section or before </main>
  return html.replace('</main>', block + '    </main>');
}

function ensureAbout(html) {
  if (html.includes('<!-- injected:about -->')) return html;
  const block =
`\n      <!-- injected:about -->
      <section class="intro block">
        <h2>About Fraction to Decimal Converter</h2>
        <p>
          The Fraction to Decimal Converter is a free online math tool that helps students, teachers, and professionals effortlessly convert fractions into decimals.
          It supports both terminating and repeating decimals and demonstrates long division steps with clear explanations. Use it to verify homework,
          prepare class materials, or double-check calculations at work — quick, accurate, and pleasantly distraction-free.
        </p>
      </section>\n`;
  return html.replace('</main>', block + '    </main>');
}

function ensureMicroStory(html, slug) {
  if (html.includes('<!-- injected:micro-story -->')) return html;
  const m = slug.match(/^(\d+)-(\d+)-as-decimal$/);
  if (!m) return html;
  const n = parseInt(m[1], 10);
  const d = parseInt(m[2], 10);
  if (!(d > 0)) return html;

  const dec = fractionToDecimal(n, d);
  const percentNum = (n / d) * 100;
  const percentText = toPercent(n, d, 2);
  const tmpl = chooseStoryTemplate(percentNum, dec.repeating);
  const story = tmpl({
    fraction: `${n}/${d}`,
    decimalPretty: dec.pretty,
    percent: percentText
  });

  const block =
`\n      <!-- injected:micro-story -->
      <section class="micro-story block">
        <h2>Micro Story</h2>
        <p>${escapeHtml(story)}</p>
      </section>\n`;
  return html.replace('</main>', block + '    </main>');
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
}

function extractCanonical(html, fallback) {
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/i);
  if (m) return m[1];
  return fallback;
}

function patchOne(filePath) {
  const dir = path.dirname(filePath);
  const slug = path.basename(dir); // e.g., 1-2-as-decimal
  let html = fs.readFileSync(filePath, 'utf8');

  // Hreflang
  const fallbackCanonical = `https://fractionstodecimals.com/examples/fractions/${slug}/`;
  const canonical = extractCanonical(html, fallbackCanonical);
  html = ensureHreflang(html, canonical);

  // Tool tabs
  html = ensureToolTabs(html);

  // Popular
  html = ensurePopular(html);

  // About
  html = ensureAbout(html);

  // Micro Story
  html = ensureMicroStory(html, slug);

  fs.writeFileSync(filePath, html, 'utf8');
  return { filePath, slug };
}

function main() {
  const files = walkFractionPages(FRACTIONS_DIR);
  let count = 0;
  for (const f of files) {
    try {
      patchOne(f);
      count += 1;
    } catch (e) {
      console.error('Patch failed for', f, e.message);
    }
  }
  console.log('Patched pages:', count);
}

if (require.main === module) {
  main();
}