export function normalizeMetaPixel(value){
 if(value===undefined||value===null)return {id:'',enabled:false};
 const invalid=()=>{throw Object.assign(new Error('Meta Pixel: use a numeric Pixel ID (5–25 digits); an enabled pixel requires an ID'),{status:400})};
 if(typeof value!=='object'||Array.isArray(value)||typeof value.id!=='string'||typeof value.enabled!=='boolean')invalid();
 const id=value.id.trim();if((id&&!/^\d{5,25}$/.test(id))||(value.enabled&&!id))invalid();
 return {id,enabled:value.enabled};
}
