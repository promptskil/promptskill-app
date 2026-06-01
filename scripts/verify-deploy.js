// verify-deploy.js
// Content-marker deploy verification for Vaine web (Vercel).
//
// The Expo web export is client-rendered — raw HTTP fetch sees only the SPA
// shell. A working verification must execute JavaScript and read the DOM
// after React has mounted. This script does that with Playwright.
//
// Usage:
//   node scripts/verify-deploy.js <route> <marker> [base-url]
//
// Examples:
//   node scripts/verify-deploy.js /privacy "Privacy Policy"
//   node scripts/verify-deploy.js /home "Vaine"
//   node scripts/verify-deploy.js /privacy "Privacy Policy" https://promptskill-app.vercel.app
//
// Exits 0 if the marker is found in rendered body text, 1 otherwise.
// Designed to be called from CI or a local PowerShell deploy script.
//
// Setup (one-time):
//   npm install -D playwright
//   npx playwright install chromium
//
// Why this exists:
//   Session-loop history records the privacy.tsx deploy where a 200 status
//   code was treated as proof of success, but the SPA fallback was serving
//   index.html for an unknown route. This script prevents that class of
//   false-positive deploy verification.

const { chromium } = require('playwright');

const route = process.argv[2];
const marker = process.argv[3];
const baseUrl = process.argv[4] || 'https://www.vaineai.com';

if (!route || !marker) {
    console.error('Usage: node scripts/verify-deploy.js <route> <marker> [base-url]');
    console.error('Example: node scripts/verify-deploy.js /privacy "Privacy Policy"');
    process.exit(2);
}

const url = `${baseUrl}${route}`;

(async () => {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        // Read all visible text on the page after JS has mounted.
        const text = await page.evaluate(() => document.body.innerText || '');
        const found = text.includes(marker);

        if (found) {
            console.log(`PASS: marker "${marker}" rendered at ${url}`);
            process.exit(0);
        } else {
            console.error(`FAIL: marker "${marker}" NOT rendered at ${url}`);
            console.error('--- First 300 chars of rendered body ---');
            console.error(text.substring(0, 300));
            console.error('--- end preview ---');
            process.exit(1);
        }
    } catch (err) {
        console.error(`ERROR: ${err.message}`);
        process.exit(3);
    } finally {
        if (browser) await browser.close();
    }
})();
