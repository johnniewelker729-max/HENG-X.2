// Public review proxy. Destination and target are exclusively server configuration.
export async function reviews(request, env) {
 const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
 if(request.method!=='GET')return reply({status:'error',error:'Method not allowed'},405);
 const target=typeof env.REVIEW_TARGET==='string'?env.REVIEW_TARGET.trim():'';
 if(!target)return reply({status:'unconfigured',data:[]});
 let origin;
 try{
  origin=new URL(env.REVIEW_API_ORIGIN||'https://callballreview.com');
  if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash||target.length>200)throw Error();
 }catch{return reply({status:'error',error:'Review server configuration is invalid'},503)}
 const url=new URL('/api/v1/reviews',origin);
 url.searchParams.set('target',target);url.searchParams.set('limit','10');
 try{
  const response=await fetch(url,{headers:{Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(8000),cache:'no-store'});
  if(!response.ok)throw Error();
  const reader=response.body.getReader();let size=0;const chunks=[];
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1048576){await reader.cancel();throw Error()}chunks.push(value)}
  const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
  const payload=JSON.parse(new TextDecoder().decode(bytes));
  if(!Array.isArray(payload.data))throw Error();
  const data=payload.data.slice(0,10).map(r=>{
   if(!r||typeof r.display_name!=='string'||!r.display_name.trim()||typeof r.content!=='string'||!Number.isFinite(r.rating)||r.rating<1||r.rating>5||typeof r.permalink!=='string')throw Error();
   const link=new URL(r.permalink);
   if(link.protocol!=='https:'||link.origin!==origin.origin||link.username||link.password)throw Error();
   return {id:typeof r.id==='string'?r.id:'',display_name:r.display_name.slice(0,200),rating:r.rating,content:r.content.slice(0,10000),permalink:link.href};
  });
  return reply({status:'ready',data});
 }catch{return reply({status:'error',error:'Unable to load Callball Reviews'},502)}
}
