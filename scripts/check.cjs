const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');const pages=['index.html','assignments.html','calendar.html','progress.html'];let count=0;
for(const file of ['app.js','storage.js',...fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js')).map(f=>'js/'+f)]){new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});count++;}
for(const file of pages){
  const html=fs.readFileSync(path.join(root,file),'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(ids.length!==new Set(ids).size)throw new Error(file+': duplicate IDs');
  if([...html.matchAll(/<h1\b/g)].length!==1)throw new Error(file+': one H1 is required');
  for(const [,asset] of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!/^(https?:|data:)/.test(asset) && !fs.existsSync(path.resolve(root,asset.split('?')[0].split('#')[0])))throw new Error(file+': missing '+asset);
  for(const target of pages)if(!html.includes(`href="${target}"`))throw new Error(file+': missing navigation '+target);
}
console.log(`PASS: ${count} JavaScript files parse; 4 HTML pages have unique IDs, valid local assets, and page links.`);
