'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const required=['worker.mjs','reviews.mjs','public/reviews.js','public/reviews.css','seed.mjs','wrangler.jsonc','package.json','package-lock.json','public/index.html','public/public-app.js','public/admin.html','public/admin-app.js','public/admin.css','migrations/0001_initial.sql'];
const missing=required.filter(name=>!fs.existsSync(path.join(root,name)));
if(missing.length){console.error('Missing files/folders. Upload the COMPLETE project, including public/ and migrations/:\n'+missing.join('\n'));process.exit(1)}
const config=JSON.parse(fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8'));
if(config.name!=='heng-x-2'||config.assets.directory!=='./public'||config.main!=='worker.mjs'||!config.d1_databases.some(b=>b.binding==='DB'&&b.database_name==='naypan-db'))throw Error('Unexpected Cloudflare configuration');
if(!fs.readFileSync(path.join(root,'public/index.html'),'utf8').includes('HENG X.2'))throw Error('Unexpected website brand');
console.log('OK: HENG X.2 website, admin, public/, migrations/ and Worker configuration are complete.');
