const { test } = require('node:test');
const assert = require('node:assert/strict');
const { makePortable } = require('../scripts/portable-report.cjs');

test('shared reports remove Windows machine paths and preserve test results', () => {
  const root = 'C:\\Users\\Student\\Projects\\StudySprint';
  const report = {
    config: {
      configFile: root + '\\playwright.config.cjs',
      argv: ['C:\\Program Files\\nodejs\\node.exe', root + '\\node_modules\\playwright\\cli.js'],
      rootDir: root.replaceAll('\\', '/') + '/tests/browser',
    },
    suites: [
      {
        file: root + '\\tests\\browser\\workflows.spec.cjs',
        status: 'failed',
        duration: 123,
        error: { message: 'See ' + root + '\\tests\\browser\\workflows.spec.cjs:12' },
      },
    ],
    stats: { expected: 8, unexpected: 1, skipped: 2 },
  };

  const portable = makePortable(report);
  assert.equal(portable.config.configFile, 'playwright.config.cjs');
  assert.equal(portable.config.rootDir, 'tests/browser');
  assert.deepEqual(portable.config.argv, ['node', 'node_modules/playwright/cli.js']);
  assert.equal(portable.suites[0].file, 'tests/browser/workflows.spec.cjs');
  assert.equal(portable.suites[0].error.message, 'See tests\\browser\\workflows.spec.cjs:12');
  assert.equal(portable.suites[0].status, 'failed');
  assert.equal(portable.suites[0].duration, 123);
  assert.deepEqual(portable.stats, report.stats);
  assert.equal(report.config.configFile, root + '\\playwright.config.cjs');
  assert.deepEqual(makePortable(portable), portable);
});

test('shared reports remove Unix project paths from attachments and errors', () => {
  const portable = makePortable({
    config: { configFile: '/home/student/StudySprint/playwright.config.cjs' },
    attachments: [{ path: '/home/student/StudySprint/test-results/trace.zip' }],
    errors: ['Failure at /home/student/StudySprint/tests/browser/workflows.spec.cjs:8'],
    metadata: null,
  });
  assert.equal(portable.attachments[0].path, 'test-results/trace.zip');
  assert.equal(portable.errors[0], 'Failure at tests/browser/workflows.spec.cjs:8');
  assert.equal(portable.metadata, null);
});
