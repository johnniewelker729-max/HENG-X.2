import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMetaPixel} from '../meta-pixel.mjs';
test('pixel defaults disabled and preserves valid settings',()=>{
 assert.deepEqual(normalizeMetaPixel(),{id:'',enabled:false});
 assert.deepEqual(normalizeMetaPixel({id:'123456789012345',enabled:true}),{id:'123456789012345',enabled:true});
 assert.deepEqual(normalizeMetaPixel({id:'123456789012345',enabled:false}),{id:'123456789012345',enabled:false});
});
test('pixel rejects arbitrary code, invalid ID and invalid switches',()=>{
 for(const v of [{id:'<script>alert(1)</script>',enabled:true},{id:'123',enabled:true},{id:'',enabled:true},{id:123456,enabled:true},{id:'123456789',enabled:'true'},'123456789'])assert.throws(()=>normalizeMetaPixel(v),e=>e.status===400);
});
