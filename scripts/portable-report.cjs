const fs = require('node:fs');

// Keep shared test evidence independent of the machine that ran the tests.
function makePortable(report) {
  const configFile = report.config?.configFile;
  if (!configFile) {
    throw new Error('The browser report does not contain a configuration file path.');
  }

  const normalizedConfig = configFile.replaceAll('\\', '/');
  const isAbsolute = /^(?:[a-z]:\/|\/)/i.test(normalizedConfig);
  const projectRoot = isAbsolute
    ? normalizedConfig.slice(0, normalizedConfig.lastIndexOf('/'))
    : null;
  const roots = projectRoot ? [...new Set([projectRoot, projectRoot.replaceAll('/', '\\')])] : [];

  function replacePaths(value) {
    if (typeof value === 'string') {
      const isProjectPath = roots.some((root) => value.startsWith(root));
      for (const root of roots) {
        value = value.replaceAll(root + '/', '').replaceAll(root + '\\', '');
        if (value === root) {
          value = '.';
        }
      }
      return isProjectPath ? value.replaceAll('\\', '/') : value;
    }

    if (Array.isArray(value)) {
      return value.map(replacePaths);
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, replacePaths(item)])
      );
    }

    return value;
  }

  const portable = replacePaths(report);
  if (portable.config.argv?.length) {
    portable.config.argv[0] = 'node';
  }
  return portable;
}

function sanitizeReport(file) {
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(file, JSON.stringify(makePortable(report), null, 2) + '\n');
}

module.exports = { makePortable, sanitizeReport };

if (require.main === module) {
  for (const file of process.argv.slice(2)) {
    sanitizeReport(file);
    console.log(`Saved portable paths in ${file}`);
  }
}
