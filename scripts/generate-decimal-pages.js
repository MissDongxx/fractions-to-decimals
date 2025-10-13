#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Compute GCD
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Parse decimal string into fraction.
 * Supports:
 * - Terminating decimals: e.g., "0.32", "1.4", "2.1", "3.2"
 * - Repeating notation: "0.(3)", "0.83(3)", "0.1(6)", "0.(142857)"
 * Returns { num, den, steps, type }
 */
function decimalToFraction(input) {
  const str = String(input).trim();

  // Repeating pattern: I NR (R)
  const repeatingRegex = /^(\d+)(?:\.(\d*))?\((\d+)\)$/; // e.g., 0.(3), 0.83(3), 1.2(34)
  const m = str.match(repeatingRegex);

  if (m) {
    const I = parseInt(m[1], 10); // integer part
    const NR = m[2] || '';        // non-repeating part
    const R = m[3];               // repeating part

    const n = NR.length;
    const r = R.length;

    // A: digits of I + NR + R
    const A = parseInt(`${I}${NR}${R}`, 10);
    // B: digits of I + NR
    const B = parseInt(`${I}${NR || ''}`, 10);

    const den = Math.pow(10, n) * (Math.pow(10, r) - 1);
    const fracNum = A - B;

    // total value = I + (A - B)/den
    const totalNum = I * den + fracNum;
    const totalDen = den;

    const g = gcd(totalNum, totalDen);
    const num = totalNum / g;
    const deno = totalDen / g;

    const steps = [
      `Identify: integer I=${I}, non-repeating NR="${NR}" (n=${n}), repeating R="${R}" (r=${r})`,
      `Form A = digits(I+NR+R) = ${A}, B = digits(I+NR) = ${B}`,
      `Fraction part = (A - B) / (10^n * (10^r - 1)) = (${A} - ${B}) / (${Math.pow(10, n)} * (${Math.pow(10, r)} - 1)) = ${fracNum} / ${den}`,
      `Total = I + fraction = ${I} + ${fracNum}/${den} = (${I}*${den} + ${fracNum})/${den} = ${totalNum}/${totalDen}`,
      `Simplify by gcd=${g}: ${totalNum}/${totalDen} = ${num}/${deno}`
    ];

    return { num, den: deno, steps, type: 'repeating', initialNum: totalNum, initialDen: totalDen, gcdUsed: g };
  }

  // Terminating decimal
  if (!str.includes('.')) {
    // Pure integer
    return { num: parseInt(str, 10), den: 1, steps: [`Pure integer: ${str} = ${str}/1`], type: 'integer' };
  }

  const [intPart, fracPartRaw] = str.split('.');
  const fracPart = fracPartRaw.replace(/[^\d]/g, ''); // safety
  const k = fracPart.length;
  const numerator = parseInt(intPart + fracPart, 10);
  const denominator = Math.pow(10, k);

  // Total = numerator/denominator
  const g = gcd(numerator, denominator);
  const num = numerator / g;
  const deno = denominator / g;

  const steps = [
    `Write as fraction with denominator 10^${k}: ${str} = ${numerator}/${denominator}`,
    `Simplify by gcd=${g}: ${numerator}/${denominator} = ${num}/${deno}`
  ];

  return { num, den: deno, steps, type: 'terminating', initialNum: numerator, initialDen: denominator, gcdUsed: g };
}

/**
 * Build slug and filename from decimal string
 * 0.32 -> 0-32.html
 * 1.4  -> 1-4.html
 * 0.(3) -> 0-(3).html (keep notation for clarity)
 */
function makeFilename(decimalStr) {
  // Replace '.' with '-' for simple decimals; keep parentheses for repeating
  if (/\(/.test(decimalStr)) {
    return `${decimalStr.replace(/\./g, '-')}.html`; // e.g., 0-(3).html, 0-83(3).html
  }
  return `${decimalStr.replace(/\./g, '-')}.html`;
}

/**
 * HTML template (English), based on 0-5.html
 */
function buildHtml(decimalStr, fraction, steps, relatedLinks, cardLinks) {
  const { num, den, type, initialNum, initialDen, gcdUsed } = fraction;
  const canonical = `https://fractionstodecimals.com/decimal-to-fraction/${decimalStr.replace(/\./g, '-')}.html`;
  const parts = decimalStr.split('.');
  const k = parts[1] ? parts[1].replace(/[^0-9]/g, '').length : 0;

  const faqLD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How to convert ${decimalStr} to a fraction?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": fraction.type === 'repeating'
            ? `${decimalStr} = ${num}/${den}.`
            : `${decimalStr} = ${initialNum}/${initialDen} Then simplify to ${num}/${den}.`
        }
      },
      {
        "@type": "Question",
        "name": `${decimalStr} terminating or repeating?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": fraction.type === 'repeating'
            ? `It is a repeating decimal. The simplest fraction is ${num}/${den}.`
            : `It is a terminating decimal. The simplest fraction is ${num}/${den}.`
        }
      }
    ]
  };

  const howToLD = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `Convert ${decimalStr} to a fraction`,
    "description": `Convert the decimal ${decimalStr} to a fraction and simplify.`,
    "totalTime": "PT1M",
    "step": steps.map((s, i) => ({
      "@type": "HowToStep",
      "name": `Step ${i + 1}`,
      "text": s
    }))
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${decimalStr} Decimal to Fraction</title>
  <meta name="description" content="Convert ${decimalStr} to a fraction: ${num}/${den}. Detailed steps, simplification, and FAQs."/>
  <link rel="canonical" href="${canonical}"/>
  <link rel="stylesheet" href="/styles.css"/>

  <script type="application/ld+json">
${JSON.stringify(faqLD, null, 2)}
  </script>

  <script type="application/ld+json">
${JSON.stringify(howToLD, null, 2)}
  </script>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>Convert ${decimalStr} to a Fraction</h1>
      <p>Quickly express ${decimalStr} as a fraction and see detailed conversion steps and simplification rules.</p>
    </header>

    <main>
      <section class="controls" aria-label="Controls">
        <div class="input-group">
          <label for="quickDecimal">Quick Convert (enter a decimal)</label>
          <input id="quickDecimal" type="text" value="${decimalStr}" aria-label="Enter a decimal value"/>
        </div>
        <div class="button-group">
          <button class="btn btn-primary" aria-label="Run conversion">Convert</button>
          <a class="btn btn-secondary" href="/decimal-to-fraction.html" aria-label="Open full converter">Open Full Converter</a>
        </div>
      </section>

      <section class="conversion-display">
        <div class="conversion-step">
          <h3>Result</h3>
          <div class="final-conclusion">
            <span class="decimal-value">${decimalStr}</span>
            <span class="equals">=</span>
            <div class="fraction">
              <div class="numerator">${num}</div>
              <div class="fraction-line"></div>
              <div class="denominator">${den}</div>
            </div>
          </div>
        </div>

        <div class="equation-display" aria-label="Step-by-step equations">
          <div class="equation-step">
            <div class="decimal-value">${decimalStr}</div>
            <div class="equals">=</div>
            <div class="final-result">
              <div class="fraction">
                <div class="numerator">${initialNum}</div>
                <div class="fraction-line"></div>
                <div class="denominator">${initialDen}</div>
              </div>
            </div>
            <span>${type === 'terminating' ? `(${k} decimal place${k===1?'':'s'} → denominator ${initialDen})` : `(convert repeating part to fraction)`}</span>
          </div>

          <div class="equation-step">
            <div class="decimal-value">${initialNum}/${initialDen}</div>
            <div class="equals">→ simplify ÷${gcdUsed || 1}</div>
            <div class="final-result">
              <div class="fraction">
                <div class="numerator">${num}</div>
                <div class="fraction-line"></div>
                <div class="denominator">${den}</div>
              </div>
            </div>
            <span>${(gcdUsed && gcdUsed > 1) ? `(divide numerator and denominator by ${gcdUsed})` : `(already in simplest terms, gcd=1)`}</span>
          </div>
        </div>

        <div class="step-details">
          ${type === 'terminating'
            ? `<p><strong>Step 1:</strong> ${decimalStr} has ${k} decimal place${k===1?'':'s'}, so write it as ${initialNum}/${initialDen}.</p>
               <p><strong>Step 2:</strong> ${(gcdUsed && gcdUsed > 1) ? `Divide numerator and denominator by ${gcdUsed}: ${initialNum}/${initialDen} → ${num}/${den}.` : `Already in simplest form (gcd=1): ${num}/${den}.`}</p>
               <p><strong>Property:</strong> In simplest terms, denominators with prime factors only 2 and/or 5 produce terminating decimals.</p>`
            : `<p><strong>Step 1:</strong> Interpret the repeating part and express ${decimalStr} as a fraction ${initialNum}/${initialDen}.</p>
               <p><strong>Step 2:</strong> ${(gcdUsed && gcdUsed > 1) ? `Divide numerator and denominator by ${gcdUsed}: ${initialNum}/${initialDen} → ${num}/${den}.` : `Already in simplest form (gcd=1): ${num}/${den}.`}</p>
               <p><strong>Property:</strong> Repeating decimals occur when the simplest denominator has prime factors other than 2 and 5.</p>`
          }
        </div>
      </section>

      <section>
        <h2>FAQ</h2>
        ${decimalStr === "0.(3)" ? `
        <dl>
          <dt>Why can 0.(3) be converted to a fraction?</dt>
          <dd>
            Because repeating decimals represent a continuous pattern. 
            By using algebra, we can show that 0.(3) = 1/3. 
            For example, if x = 0.(3), then 10x = 3.(3). Subtracting gives 9x = 3, so x = 1/3.
          </dd>

          <dt>Is 0.(3) a terminating decimal?</dt>
          <dd>
            No. When a fraction’s denominator (in simplest form) has prime factors other than 2 or 5, 
            the decimal becomes repeating. Here, 1/3 has denominator 3, so 0.(3) repeats forever.
          </dd>

          <dt>Can it be simplified further?</dt>
          <dd>
            No. 1/3 is already in simplest form.
          </dd>

          <dt>Is 0.(3) exactly equal to 1/3?</dt>
          <dd>
            Yes! Mathematically, 0.(3) = 1/3 exactly, not approximately. 
            The repeating digits go on infinitely, but they represent the same rational number.
          </dd>
        </dl>
        ` : `
        <dl>
          <dt>Why can ${decimalStr} be converted to a fraction?</dt>
          <dd>Decimals can be expressed as fractions by using place value and simplifying.</dd>
          <dt>${decimalStr} terminating or repeating?</dt>
          <dd>${type === 'repeating' ? 'It is repeating.' : 'It is terminating.'}</dd>
          <dt>Can it be simplified further?</dt>
          <dd>${num}/${den} is simplest.</dd>
        </dl>
        `}
      </section>

      <section>
        <h2>Related Conversions</h2>
        <div class="button-group demo-controls" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
          ${relatedLinks.map(l => `<a class="btn btn-secondary" href="${l.href}">${l.label}</a>`).join('')}
          <a class="btn btn-primary" href="/decimal-to-fraction.html">Open Full Converter</a>
        </div>
      </section>

      <!-- Extended Reading -->
      <section class="extended-reading">
        ${decimalStr === "0.(3)" ? `
        <h2>Extended Reading: What 0.(3) Means in Real Life</h2>
        <p>
          The decimal 0.(3) equals one-third (1/3), which appears frequently in daily situations.  
        </p>
        <ul>
          <li><strong>Percentage & Ratio:</strong> 1/3 ≈ 33.33%. You might see it when dividing items equally among three people.</li>
          <li><strong>Statistics:</strong> In probability, 0.(3) can represent one-third of total outcomes, such as rolling a 1 or 2 on a six-sided die.</li>
          <li><strong>Finance:</strong> A 1/3 rate could describe interest periods, payment splits, or market share portions.</li>
        </ul>
        ` : `
        <h2>Extended Reading: What ${decimalStr} Means in Real Life</h2>
        <div class="step-details">
          <p><strong>Percentage & Ratio:</strong> ${decimalStr} can be interpreted as ${type==='terminating' ? `${num}/${den}` : `a repeating proportion`} in practical scenarios like discounts and rates.</p>
          <p><strong>Statistics:</strong> A proportion of ${decimalStr} often represents a ${
            (() => {
              const v = parseFloat(decimalStr);
              if (Number.isFinite(v)) {
                const p = (v * 100);
                // 去掉多余的尾随零，如 5.00 -> 5, 12.30 -> 12.3
                return String(p).replace(/\.0+$/,'');
              }
              return decimalStr;
            })()
          }% probability — for example, a ${
            (() => {
              const v = parseFloat(decimalStr);
              if (Number.isFinite(v)) {
                const p = (v * 100);
                return String(p).replace(/\.0+$/,'');
              }
              return decimalStr;
            })()
          }% significance level (p-value) in experiments or surveys.</p>
          <p><strong>Finance:</strong> Rates expressed with ${decimalStr} (e.g., ${parts[1] ? Math.round(parseFloat(decimalStr)*100) : 100*parseFloat(decimalStr)}%) appear in returns and fees.</p>
        </div>
        `}
      </section>

      <!-- Recommendations -->
      <section>
        <h2>You May Also Like</h2>
        <div class="content-grid">
          <div class="content-card">
            <h4>Convert repeating decimals</h4>
            <p>Tutorial: convert 0.(3), 0.(142857) to fractions</p>
            <a href="/examples/decimals/0.(3)-decimal-to-fraction/index.html">View tutorial</a>
          </div>
          <div class="content-card">
            <h4>Why denominator decides termination</h4>
            <p>Denominators with only 2 and 5 terminate</p>
            <a href="/examples/decimals/0.32-decimal-to-fraction/index.html">Learn the principle</a>
          </div>
          ${cardLinks && cardLinks.length ? `
          <div class="content-card">
            <h4>${cardLinks[0].title}</h4>
            <p>${cardLinks[0].subtitle}</p>
            <a href="${cardLinks[0].href}">View details</a>
          </div>
          ` : ``}
        </div>
      </section>
    </main>

    <footer>
      <p>© 2025 Common Decimal to Fraction Reference | Learning & Teaching Aid</p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Generate a single page
 */
function generateOne(decimalStr, outDir, allDecimals) {
  const { num, den, steps, type, initialNum, initialDen } = decimalToFraction(decimalStr);

  // Build random related links (exclude current)
  const candidates = Array.isArray(allDecimals) ? allDecimals.filter(d => d !== decimalStr) : [];
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);

  const pickRelated = shuffled.slice(0, 3).map(d => {
    const f = decimalToFraction(d);
    return {
      label: `${d} → ${f.num}/${f.den}`,
      href: `/examples/decimals/${d}-decimal-to-fraction/index.html`
    };
  });

  // Pick exactly one terminating decimal card (exclude current)
  const termCandidates = shuffled.filter(d => decimalToFraction(d).type === 'terminating');
  const chosen = termCandidates.length ? [termCandidates[0]] : [];
  const pickCards = chosen.map(d => {
    const f = decimalToFraction(d);
    return {
      title: `${d} to fraction`,
      subtitle: `${d} = ${f.num}/${f.den}`,
      href: `/examples/decimals/${d}-decimal-to-fraction/index.html`
    };
  });

  const html = buildHtml(decimalStr, { num, den, type, initialNum, initialDen, gcdUsed: gcd(initialNum, initialDen) }, steps, pickRelated, pickCards);

  // 每个小数独立子目录：<decimal>-decimal-to-fraction，文件名统一为 index.html
  const subDir = path.join(outDir, `${decimalStr}-decimal-to-fraction`);
  const targetPath = path.join(subDir, 'index.html');
  fs.mkdirSync(subDir, { recursive: true });
  fs.writeFileSync(targetPath, html, 'utf8');
  return targetPath;
}

/**
 * Entrypoint
 */
function main() {
  // Build the full decimals list from range config if available
  const rangesPath = path.join(process.cwd(), 'scripts', 'batch-decimal-ranges.json');
  let allDecimals = [];

  if (fs.existsSync(rangesPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(rangesPath, 'utf8'));
      const { terminating = [], repeating = [] } = cfg;

      // Expand terminating ranges
      for (const r of terminating) {
        const start = Number(r.start);
        const end = Number(r.end);
        const step = Number(r.step);
        const decimals = Number(r.decimals);
        for (let v = start; v <= end + 1e-12; v = Number((v + step).toFixed(decimals))) {
          const s = v.toFixed(decimals); // keep trailing zeros (e.g., "1.0")
          allDecimals.push(s);
        }
      }

      // Append repeating set
      for (const rep of repeating) {
        allDecimals.push(String(rep));
      }

      // Deduplicate while preserving order
      const seen = new Set();
      allDecimals = allDecimals.filter(d => {
        if (seen.has(d)) return false;
        seen.add(d);
        return true;
      });
    } catch (e) {
      console.warn('Failed to read ranges config, using built-in defaults:', e.message);
      allDecimals = [
        "0.5", "0.32", "1.4", "2.1", "3.2",
        "0.(3)", "0.(6)", "0.(1)", "0.(2)", "0.(4)", "0.(5)", "0.(7)", "0.(8)",
        "0.1(6)", "0.83(3)", "0.(142857)"
      ];
    }
  } else {
    // Fallback to built-in minimal set
    allDecimals = [
      "0.5", "0.32", "1.4", "2.1", "3.2",
      "0.(3)", "0.(6)", "0.(1)", "0.(2)", "0.(4)", "0.(5)", "0.(7)", "0.(8)",
      "0.1(6)", "0.83(3)", "0.(142857)"
    ];
  }

  const args = process.argv.slice(2);
  const singleIdx = args.indexOf('--single');
  const outDir = path.join(process.cwd(), 'examples', 'decimals');

  if (singleIdx !== -1 && args[singleIdx + 1]) {
    const d = args[singleIdx + 1];
    const p = generateOne(d, outDir, allDecimals);
    console.log('Generated (single):', p);
    return;
  }

  // Batch
  for (const d of allDecimals) {
    const p = generateOne(d, outDir, allDecimals);
    console.log('Generated:', p);
  }
}

if (require.main === module) {
  main();
}