const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { sanitizeReport } = require('./portable-report.cjs');

const root = path.resolve(__dirname, '..');
const reportFile = path.join(root, 'reports', 'test-results', 'browser-results.json');
const startedAt = Date.now();
const result = spawnSync(
  process.execPath,
  [require.resolve('@playwright/test/cli'), 'test', ...process.argv.slice(2)],
  { cwd: root, stdio: 'inherit' }
);

// Failed runs also produce useful evidence. Preserve their original exit status.
if (fs.existsSync(reportFile) && fs.statSync(reportFile).mtimeMs >= startedAt) {
  try {
    sanitizeReport(reportFile);
  } catch (error) {
    console.error(`Could not make browser report paths portable: ${error.message}`);
    process.exitCode = 1;
  }
}

if (result.error) {
  console.error(result.error.message);
}
process.exitCode = process.exitCode || (result.status ?? 1);
