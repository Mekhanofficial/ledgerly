import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn, spawnSync } from 'node:child_process';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';

const OUTPUT_DIR = path.resolve('test-results');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'lighthouse-report.json');
const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const API_URL = process.env.E2E_API_URL || 'http://127.0.0.1:7000/api/v1';

const thresholds = {
  firstContentfulPaint: 3000,
  largestContentfulPaint: 4000,
  timeToInteractive: 5000,
  totalByteWeight: 1_500_000,
  optimizedImageSavings: 100_000
};

const ensureOutputDir = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
};

const waitForServer = async (url, timeoutMs = 90_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // ignore until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
};

const getAuditValue = (audit, fallback = null) => {
  if (!audit) return fallback;
  return audit.numericValue ?? fallback;
};

const buildSummary = (lhr) => {
  const audits = lhr.audits || {};
  const metrics = {
    firstContentfulPaint: getAuditValue(audits['first-contentful-paint'], 0),
    largestContentfulPaint: getAuditValue(audits['largest-contentful-paint'], 0),
    timeToInteractive: getAuditValue(audits.interactive, 0),
    totalByteWeight: getAuditValue(audits['total-byte-weight'], 0),
    optimizedImageSavings: getAuditValue(audits['uses-optimized-images'], 0)
  };

  const failures = [];
  if (metrics.firstContentfulPaint > thresholds.firstContentfulPaint) {
    failures.push(`FCP too high: ${Math.round(metrics.firstContentfulPaint)}ms`);
  }
  if (metrics.largestContentfulPaint > thresholds.largestContentfulPaint) {
    failures.push(`LCP too high: ${Math.round(metrics.largestContentfulPaint)}ms`);
  }
  if (metrics.timeToInteractive > thresholds.timeToInteractive) {
    failures.push(`TTI too high: ${Math.round(metrics.timeToInteractive)}ms`);
  }
  if (metrics.totalByteWeight > thresholds.totalByteWeight) {
    failures.push(`Bundle weight too high: ${Math.round(metrics.totalByteWeight / 1024)}KB`);
  }
  if (metrics.optimizedImageSavings > thresholds.optimizedImageSavings) {
    failures.push(
      `Image optimization savings too high: ${Math.round(metrics.optimizedImageSavings / 1024)}KB`
    );
  }

  return {
    url: lhr.finalDisplayedUrl || BASE_URL,
    performanceScore: lhr.categories?.performance?.score ?? null,
    metrics,
    thresholds,
    failures
  };
};

const run = async () => {
  await ensureOutputDir();
  const buildResult = spawnSync('npm run build', {
    cwd: path.resolve('.'),
    env: {
      ...process.env,
      VITE_API_URL: API_URL
    },
    stdio: 'inherit',
    shell: true
  });

  if (buildResult.status !== 0) {
    throw new Error('Frontend build failed before Lighthouse run.');
  }

  const previewProcess = spawn(
    'npx vite preview --host 127.0.0.1 --port 4173 --strictPort',
    {
      cwd: path.resolve('.'),
      env: {
        ...process.env,
        VITE_API_URL: API_URL
      },
      stdio: 'pipe',
      shell: true
    }
  );

  const ready = await waitForServer(BASE_URL, 90_000);
  if (!ready) {
    previewProcess.kill();
    throw new Error(`Preview server did not start at ${BASE_URL} in time.`);
  }

  const chromePath = process.env.LIGHTHOUSE_CHROME_PATH || chromium.executablePath();

  const chrome = await launch({
    chromePath,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });

  try {
    const runnerResult = await lighthouse(
      BASE_URL,
      {
        port: chrome.port,
        output: 'json',
        onlyCategories: ['performance'],
        logLevel: 'error'
      }
    );

    const lhr = runnerResult?.lhr;
    if (!lhr) {
      throw new Error('Lighthouse did not return an LHR payload.');
    }

    const summary = buildSummary(lhr);
    const report = {
      generatedAt: new Date().toISOString(),
      summary,
      audits: lhr.audits
    };

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf8');

    if (summary.failures.length > 0) {
      console.error('Lighthouse threshold failures:\n- ' + summary.failures.join('\n- '));
      process.exitCode = 1;
      return;
    }

    console.log('Lighthouse performance checks passed.');
  } finally {
    await chrome.kill();
    previewProcess.kill();
  }
};

run().catch(async (error) => {
  await ensureOutputDir();
  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        error: error?.message || String(error)
      },
      null,
      2
    ),
    'utf8'
  );
  console.error('Lighthouse run failed:', error?.message || error);
  process.exit(1);
});
