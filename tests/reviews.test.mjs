import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.mjs';
const request = (method='GET') => new Request('https://site.test/api/reviews?target=evil&url=https://evil.test',{method});
test('reviews wait for configuration without fetching or requiring D1', async()=>{
 const old=globalThis.fetch; globalThis.fetch=()=>{throw Error('unexpected fetch')};
 try {const r=await worker.fetch(request(),{});assert.equal(r.status,200);assert.equal((await r.json()).status,'unconfigured')} finally {globalThis.fetch=old}
});
test('reviews use only server config and approved response.data fields',async()=>{
 const old=globalThis.fetch;let called;
 globalThis.fetch=async(url,options)=>{called={url:String(url),options};return Response.json({data:[{id:'r1',display_name:'<img onerror=alert(1)>',rating:4,content:'Great',permalink:'https://callballreview.com/?review=r1'}]})};
 try {const r=await worker.fetch(request(),{REVIEW_API_ORIGIN:'https://callballreview.com',REVIEW_TARGET:'my-service'});assert.equal(r.status,200);const b=await r.json();assert.equal(b.data[0].display_name,'<img onerror=alert(1)>');assert.equal(called.url,'https://callballreview.com/api/v1/reviews?target=my-service&limit=10');assert.equal(called.options.redirect,'error');assert.match(r.headers.get('Cache-Control'),/no-store/)}finally{globalThis.fetch=old}
});
test('upstream errors and malformed payload never become fake reviews',async()=>{
 const old=globalThis.fetch;
 try{for(const result of [new Response('down',{status:500}),Response.json({data:{}}),Response.json({data:[{rating:5,permalink:'javascript:alert(1)'}]})]){globalThis.fetch=async()=>result;const r=await worker.fetch(request(),{REVIEW_TARGET:'real'});assert.equal(r.status,502);assert.equal((await r.json()).status,'error')}}finally{globalThis.fetch=old}
});
test('reviews preserve empty state, reject unsafe config and non-GET',async()=>{
 const old=globalThis.fetch;globalThis.fetch=async()=>Response.json({data:[]});
 try{const r=await worker.fetch(request(),{REVIEW_TARGET:'real'});assert.deepEqual((await r.json()).data,[]);assert.equal((await worker.fetch(request(),{REVIEW_TARGET:'real',REVIEW_API_ORIGIN:'http://localhost'})).status,503);assert.equal((await worker.fetch(request('POST'),{REVIEW_TARGET:'real'})).status,405)}finally{globalThis.fetch=old}
});
