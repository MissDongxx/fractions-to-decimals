// scripts/generate-fraction-pages.js
// 用法：node scripts/generate-fraction-pages.js
// 输出：public/(lang/可选)/fractions/{a}-{b}-as-decimal/index.html + public/sitemap.xml

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

// ================= 配置区 =================
const CONFIG = {
  BASE_URL: 'https://fractionstodecimals.com', // 修改成你的正式域名
  OUT_ROOT: path.resolve(process.cwd(), 'examples'),
  OUT_DIR: 'fractions', // 主目录
  // URL 前缀（当页面部署在子路径如 /examples 下时）
  URL_PREFIX: '/examples',
  // 生成范围
  MIN_NUM: 1,
  MAX_NUM: 50,
  MIN_DEN: 2,
  MAX_DEN: 50,
  // 仅生成最简分数页面（true/false）
  ONLY_SIMPLEST: false,
  // 循环检测最大位数（性能与准确度权衡）
  MAX_DECIMAL_DIGITS: 150,
  // 多语言输出（如需多语言 SEO）
  MULTI_LANG_SUBDIRS: false,
  LANGS: ['en', 'zh-CN'], // 开启 MULTI_LANG_SUBDIRS 时生效
  DEFAULT_LANG: 'en',
  // 并发控制
  CONCURRENCY: 24,
  // 相关链接数量（同分母&相邻）
  RELATED_COUNT_PER_TYPE: 4,
};

// 简单 I18N（用于标题/说明文案；可扩展）
const I18N = {
  'en': {
    pageTitle: (n, d, dec) => `${n}/${d} as Decimal (${dec}) · Fraction to Decimal`,
    h1: (n, d, dec) => `${n}/${d} as Decimal (${dec})`,
    summary: (n, d, dec) => `Convert ${n}/${d} to decimal: ${dec}. Steps, method, FAQs, and percentage.`,
    decimalLabel: 'Decimal',
    simplifiedLabel: 'Simplified fraction',
    stepsTitle: 'How to convert fraction to decimal',
    step1: 'Divide numerator by denominator using long division or calculator.',
    step2: 'If the remainder repeats, the decimal is repeating; otherwise, it terminates.',
    repeatingNote: 'Repeating part is marked with parentheses, e.g., 0.(3).',
    relatedTitle: 'Related fractions',
    percentLabel: 'Percentage',
    tryInTool: 'Try in calculator',
    faq: {
      q1: (n, d) => `Is ${n}/${d} a repeating decimal?`,
      a1: (rep) => rep ? 'Yes, it is a repeating decimal.' : 'No, it is a terminating decimal.',
      q2: (n, d) => `What is ${n}/${d} as a percentage?`,
      a2: (pct) => `${pct}%`,
    }
  },
  'zh-CN': {
    pageTitle: (n, d, dec) => `${n}/${d} 转小数（${dec}）· 分数转小数`,
    h1: (n, d, dec) => `${n}/${d} 转小数（${dec}）`,
    summary: (n, d, dec) => `将 ${n}/${d} 转换为小数：${dec}。包含方法步骤、常见问题与百分比。`,
    decimalLabel: '小数值',
    simplifiedLabel: '最简分数',
    stepsTitle: '分数转小数的方法',
    step1: '用分子除以分母（长除法或计算器）。',
    step2: '若余数循环出现则为循环小数，否则为有限小数。',
    repeatingNote: '循环部分用括号标注，例如 0.(3)。',
    relatedTitle: '相关分数',
    percentLabel: '百分比',
    tryInTool: '在计算器中验证',
    faq: {
      q1: (n, d) => `${n}/${d} 是循环小数吗？`,
      a1: (rep) => rep ? '是，属于循环小数。' : '不是，属于有限小数。',
      q2: (n, d) => `${n}/${d} 换算为百分比是多少？`,
      a2: (pct) => `${pct}%`,
    }
  }
};
// =============== 配置区结束 ==============

function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }
function simplify(n, d) { const g = gcd(n, d); return [n / g, d / g]; }

function fractionToDecimal(numerator, denominator, maxDigits) {
  const sign = (numerator < 0) ^ (denominator < 0) ? '-' : '';
  let n = Math.abs(numerator);
  let d = Math.abs(denominator);
  const intPart = Math.floor(n / d);
  let remainder = n % d;

  if (remainder === 0) {
    const v = `${sign}${intPart}`;
    return { decimalPlain: v, decimalPretty: v, hasRepeating: false };
  }

  const seen = new Map(); // remainder -> index
  const decimals = [];
  let repeatingIndex = -1;

  for (let i = 0; remainder !== 0 && i < maxDigits; i++) {
    if (seen.has(remainder)) {
      repeatingIndex = seen.get(remainder);
      break;
    }
    seen.set(remainder, decimals.length);
    remainder *= 10;
    const digit = Math.floor(remainder / d);
    decimals.push(digit);
    remainder %= d;
  }

  const base = `${sign}${intPart}.`;
  if (repeatingIndex === -1) {
    const dec = decimals.join('');
    return { decimalPlain: base + dec, decimalPretty: base + dec, hasRepeating: false };
  } else {
    const nonRep = decimals.slice(0, repeatingIndex).join('');
    const rep = decimals.slice(repeatingIndex).join('');
    const pretty = base + (nonRep ? nonRep : '') + `(${rep})`;
    const plain = base + nonRep + rep;
    return { decimalPlain: plain, decimalPretty: pretty, hasRepeating: true };
  }
}

function ellipsisVersion(decimalPretty, limit = 12) {
  const m = decimalPretty.match(/^(-?\d+\.)(.*)$/);
  if (!m) return decimalPretty;
  const head = m[1], tail = m[2];
  const rm = tail.match(/^(.*)\((\d+)\)$/);
  if (!rm) return decimalPretty;
  const nonRep = rm[1];
  const rep = rm[2];
  const repeated = rep.repeat(Math.ceil(limit / rep.length)).slice(0, limit);
  return head + nonRep + repeated + '...';
}

function percentage(n, d) {
  return ((n / d) * 100).toFixed(2);
}

async function readTemplate() {
  const tplPath = path.resolve(process.cwd(), 'templates', 'fraction-as-decimal.html');
  return fsp.readFile(tplPath, 'utf8');
}

function replaceTokens(tpl, map) {
  // 兼容 Node 低版本：不用 replaceAll
  let out = tpl;
  for (const [key, val] of Object.entries(map)) {
    const token = `{{${key}}}`;
    out = out.split(token).join(String(val));
  }
  return out;
}

function buildRelatedLinks(n, d, countPerType = 4, pathPrefix = '', langPrefix = '') {
  const items = [];
  // 同分母：围绕 n 的上下若干
  for (let delta = 1; delta <= countPerType; delta++) {
    const up = n + delta;
    if (up > 0) items.push([up, d]);
    const down = n - delta;
    if (down > 0) items.push([down, d]);
  }
  // 同分子：围绕 d 的上下若干（分母 >= 2）
  for (let delta = 1; delta <= countPerType; delta++) {
    const up = d + delta; if (up >= 2) items.push([n, up]);
    const down = d - delta; if (down >= 2) items.push([n, down]);
  }

  const seen = new Set();
  const links = [];
  for (const [nn, dd] of items) {
    const key = `${nn}/${dd}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const href = `${pathPrefix}${langPrefix}/fractions/${nn}-${dd}-as-decimal/`;
    links.push(`<li><a href="${href}">${nn}/${dd} as decimal</a></li>`);
    if (links.length >= countPerType * 2) break;
  }
  return `<ul>${links.join('')}</ul>`;
}

function makeOutDir(root, lang, subdir) {
  const parts = [root];
  if (lang) parts.push(lang);
  if (subdir) parts.push(subdir);
  return path.resolve(...parts);
}

function pagePathParts(n, d) {
  return `${n}-${d}-as-decimal`;
}

function canonicalUrl(base, lang, slug) {
  const langSeg = lang ? `/${lang}` : '';
  const prefix = CONFIG.URL_PREFIX || '';
  return `${base}${prefix}${langSeg}/fractions/${slug}/`;
}

function alternateLinks(base, langs, slug) {
  // 输出 hreflang alternate
  return langs.map(l => {
    const href = canonicalUrl(base, l, slug);
    return `<link rel="alternate" hreflang="${l}" href="${href}">`;
  }).join('\n  ');
}

function makeFAQData(n, d, pct, isRepeating, i18n) {
  const q1 = i18n.faq.q1(n, d);
  const a1 = i18n.faq.a1(isRepeating);
  const q2 = i18n.faq.q2(n, d);
  const a2 = i18n.faq.a2(pct);
  return { q1, a1, q2, a2 };
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function writeFileSafe(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fsp.writeFile(filePath, content, 'utf8');
}

function limitConcurrency(tasks, limit) {
  const results = [];
  let i = 0;
  let active = 0;
  return new Promise((resolve, reject) => {
    const next = () => {
      if (i >= tasks.length && active === 0) return resolve(Promise.all(results));
      while (active < limit && i < tasks.length) {
        const idx = i++;
        active++;
        const p = tasks[idx]()
          .then(res => { active--; next(); return res; })
          .catch(err => { reject(err); });
        results.push(p);
      }
    };
    next();
  });
}

async function generate() {
  const tpl = await readTemplate();
  const nowISO = new Date().toISOString();
  const langs = CONFIG.MULTI_LANG_SUBDIRS ? CONFIG.LANGS : [CONFIG.DEFAULT_LANG];
  const sitemapEntries = [];

  const tasks = [];

  for (const lang of langs) {
    const i18n = I18N[lang] || I18N[CONFIG.DEFAULT_LANG];
    const langPrefix = CONFIG.MULTI_LANG_SUBDIRS ? `/${lang}` : '';
    const pathPrefix = CONFIG.URL_PREFIX || '';
    for (let n = CONFIG.MIN_NUM; n <= CONFIG.MAX_NUM; n++) {
      for (let d = CONFIG.MIN_DEN; d <= CONFIG.MAX_DEN; d++) {
        if (CONFIG.ONLY_SIMPLEST) {
          const [sn, sd] = simplify(n, d);
          if (sn !== n || sd !== d) continue;
        }
        const slug = pagePathParts(n, d);
        const outDir = makeOutDir(CONFIG.OUT_ROOT, CONFIG.MULTI_LANG_SUBDIRS ? lang : '', path.join(CONFIG.OUT_DIR, slug));
        const outFile = path.join(outDir, 'index.html');
        const canonical = canonicalUrl(CONFIG.BASE_URL, CONFIG.MULTI_LANG_SUBDIRS ? lang : '', slug);

        tasks.push(async () => {
          const { decimalPlain, decimalPretty, hasRepeating } = fractionToDecimal(n, d, CONFIG.MAX_DECIMAL_DIGITS);
          const ellipsis = hasRepeating ? ellipsisVersion(decimalPretty) : decimalPretty;
          const [sn, sd] = simplify(n, d);
          const simplified = `${sn}/${sd}`;
          const pct = percentage(n, d);
          const title = i18n.pageTitle(n, d, decimalPretty);
          const h1 = i18n.h1(n, d, decimalPretty);
          const summary = i18n.summary(n, d, decimalPretty);
          const relatedLinksHtml = buildRelatedLinks(n, d, CONFIG.RELATED_COUNT_PER_TYPE, pathPrefix, langPrefix);
          const altLinks = CONFIG.MULTI_LANG_SUBDIRS ? alternateLinks(CONFIG.BASE_URL, langs, slug) : '';

          const faq = makeFAQData(n, d, pct, hasRepeating, i18n);

          const map = {
            LANG: lang,
            PAGE_TITLE: title,
            SUMMARY: summary,
            CANONICAL: canonical,
            HREFLANG_LINKS: altLinks,
            NUM: n,
            DEN: d,
            H1: h1,
            I18N_DECIMAL: i18n.decimalLabel,
            I18N_SIMPLIFIED: i18n.simplifiedLabel,
            I18N_STEPS: i18n.stepsTitle,
            I18N_STEP1: i18n.step1,
            I18N_STEP2: i18n.step2,
            I18N_NOTE: i18n.repeatingNote,
            I18N_RELATED: i18n.relatedTitle,
            DECIMAL_PRETTY: decimalPretty,
            DECIMAL_PLAIN: decimalPlain,
            DECIMAL_ELLIPSIS: ellipsis,
            SIMPLIFIED: simplified,
            PERCENT_LABEL: i18n.percentLabel,
            PERCENT: pct,
            RELATED_LINKS: relatedLinksHtml,
            TOOL_LINK_TEXT: i18n.tryInTool,
            FAQ_Q1: faq.q1,
            FAQ_A1: faq.a1,
            FAQ_Q2: faq.q2,
            FAQ_A2: faq.a2
          };

          const html = replaceTokens(tpl, map);
          await writeFileSafe(outFile, html);
          sitemapEntries.push({ loc: canonical, lastmod: nowISO });
        });
      }
    }
  }

  await limitConcurrency(tasks, CONFIG.CONCURRENCY);
  await emitSitemap(sitemapEntries);
  // 提示输出路径
  console.log(`Done. See ${CONFIG.OUT_ROOT}${CONFIG.MULTI_LANG_SUBDIRS ? '/{lang}' : ''}/${CONFIG.OUT_DIR}/...`);
}

async function emitSitemap(entries) {
  // 去重
  const seen = new Set();
  const uniq = [];
  for (const e of entries) {
    if (!seen.has(e.loc)) {
      seen.add(e.loc);
      uniq.push(e);
    }
  }
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...uniq.map(e => [
      `  <url>`,
      `    <loc>${e.loc}</loc>`,
      `    <lastmod>${e.lastmod}</lastmod>`,
      `    <changefreq>weekly</changefreq>`,
      `    <priority>0.6</priority>`,
      `  </url>`
    ].join('\n')),
    `</urlset>`
  ].join('\n');

  const filePath = path.resolve(CONFIG.OUT_ROOT, 'sitemap.xml');
  await writeFileSafe(filePath, xml);
}

generate().catch(err => {
  console.error('[generator] failed:', err);
  process.exit(1);
});