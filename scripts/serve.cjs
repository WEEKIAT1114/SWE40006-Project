const http=require('node:http');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const args=process.argv.slice(2);const index=args.indexOf('--port');const port=Number(index>=0 ? args[index+1] : process.env.PORT || 8000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};
const allowed=new Set(['index.html','assignments.html','calendar.html','progress.html','app.js','storage.js','styles.css','favicon.svg','RELEASE.json']);
const server=http.createServer((request,response)=>{
  try{
    const url=new URL(request.url,'http://127.0.0.1');const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep) || (!allowed.has(relative) && !/^js\/[a-z-]+\.js$/.test(relative))){response.writeHead(404);response.end('Not found');return;}
    if(!fs.existsSync(file) || !fs.statSync(file).isFile()){response.writeHead(404);response.end('Not found');return;}
    response.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; frame-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'"});
    if(request.method==='HEAD')response.end();else fs.createReadStream(file).pipe(response);
  }catch{response.writeHead(400);response.end('Invalid request');}
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`StudySprint: http://127.0.0.1:${port}`));
