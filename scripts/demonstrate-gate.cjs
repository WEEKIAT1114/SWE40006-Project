// Local proof that an expected validation failure prevents a packaging stage.
// This is not a fabricated GitHub Actions run or a production deployment.
const {spawnSync}=require('node:child_process');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const command="const M=require('./js/model.js'); M.parseBackup('{invalid JSON');";
const failed=spawnSync(process.execPath,['-e',command],{cwd:root,encoding:'utf8'});
if(failed.status===0)throw new Error('The deliberately invalid input unexpectedly passed.');
console.log('EXPECTED FAILURE: invalid backup input was rejected.');
console.log(`Validation stage exit code: ${failed.status}`);
console.log('Packaging stage: BLOCKED. Deployment stage: BLOCKED.');
console.log('PASS: local release-gate demonstration. GitHub run evidence must be collected after pushing the repository.');
