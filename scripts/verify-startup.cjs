const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
(async()=>{
  let url=process.env.QA_BASE_URL,server;
  const root=process.cwd(),results=[];
  if(!url){
    server=http.createServer((req,res)=>{
      const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/seiya-digital-atelier\//,'/');
      let file=path.resolve(root,'.'+rel);
      if(!file.startsWith(root+path.sep)&&file!==root)return res.writeHead(403).end();
      if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
      if(!fs.existsSync(file))return res.writeHead(404).end();
      res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    url=`http://127.0.0.1:${server.address().port}/`;
  }
  const browser=await chromium.launch();
  try{
    for(const width of [1440,390])for(const prefix of server?['','seiya-digital-atelier/']:[''])for(const route of ['','work/','about/','contact/']){
      const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      const response=await page.goto(url+prefix+route);assert.equal(response.status(),200);
      await page.waitForTimeout(1200);
      const textLength=(await page.locator('body').innerText()).length;
      assert(textLength>300);assert.equal(await page.locator('#__framer-badge-container').count(),0);
      assert.deepEqual(errors,[]);
      const brokenImages=await page.locator('img:visible').evaluateAll(nodes=>nodes.filter(node=>node.complete&&node.naturalWidth===0).map(node=>node.src));
      assert.deepEqual(brokenImages,[]);
      results.push({width,prefix,route,textLength,errors,brokenImages});await page.close();
    }
    if(process.env.QA_EVIDENCE)fs.writeFileSync(process.env.QA_EVIDENCE,JSON.stringify(results,null,2));
    console.log(JSON.stringify(results,null,2));
  }finally{await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1});
