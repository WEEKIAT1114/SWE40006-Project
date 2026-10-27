const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');const output=path.resolve(root,'dist');
if(output!==path.join(root,'dist') || path.dirname(output)!==root)throw new Error('Unsafe build destination');
if(fs.existsSync(output))fs.rmSync(output,{recursive:true});fs.mkdirSync(output);
const files=['index.html','assignments.html','calendar.html','progress.html','styles.css','favicon.svg','app.js','storage.js',...fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js')).map(f=>'js/'+f)];
const hashes={};for(const file of files){const target=path.join(output,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);hashes[file]=crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');}
fs.writeFileSync(path.join(output,'RELEASE.json'),JSON.stringify({name:'StudySprint',version:require('../package.json').version,builtAt:new Date().toISOString(),files:hashes},null,2));
console.log(`Packaged ${files.length} static files in dist with SHA-256 checksums.`);
