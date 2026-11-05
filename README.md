# HENG X.2

เว็บไซต์และ API ใน Cloudflare Worker เดียว พร้อม D1, หน้า `/admin`, แชท และรีวิวจาก Callball Reviews

Repository ที่ใช้: `johnniewelker729-max/HENG-X.2` — branch `main`

## Cloudflare

เปิด Worker **heng-x-2** แล้วไปที่ Settings → Builds เชื่อม Git Repository เป็น **johnniewelker729-max/HENG-X.2**

| การตั้งค่า | ค่า |
| --- | --- |
| Production branch | `main` |
| Root directory | `/` หรือเว้นว่าง |
| Build command | `npm ci && npm run build` |
| Deploy command | `npm run deploy` |

ชื่อ Worker ใน `wrangler.jsonc` คือ `heng-x-2` เพื่อใช้ URL เดิม: https://heng-x-2.johnniewelker729.workers.dev

ไฟล์เว็บอยู่ใน `public/` เท่านั้น ไม่ต้องเพิ่ม `--assets ./` ในคำสั่ง deploy

## D1 และแอดมิน

- D1 database: `naypan-db` / binding: `DB` ตั้งค่าไว้ใน `wrangler.jsonc`
- หากยังไม่เคยสร้างตาราง ให้รัน SQL จาก `migrations/0001_initial.sql` ใน D1 Console หรือใช้ `npx wrangler d1 migrations apply naypan-db --remote`
- ตั้งค่า runtime secrets ของ Worker: `AUTH_PEPPER` (สุ่มอย่างน้อย 32 ตัวอักษร) และ `SETUP_TOKEN` (สุ่มอย่างน้อย 24 ตัวอักษร)
- ถ้าใช้งานแอดมินอยู่แล้ว ให้รักษาค่า `AUTH_PEPPER` เดิม การเปลี่ยนค่าจะทำให้ตรวจรหัสผ่านเดิมไม่ได้
- เปิด `/admin` เพื่อสร้างบัญชีครั้งแรกด้วย `SETUP_TOKEN` และรหัสผ่าน 16–200 ตัวอักษร
- ไม่ต้องใส่รหัสผ่านหรือ secrets ลงใน GitHub

## Callball Reviews

ตั้งค่าฝั่งเซิร์ฟเวอร์ใน `wrangler.jsonc`:

```json
"vars": {
  "REVIEW_API_ORIGIN": "https://callballreview.com",
  "REVIEW_TARGET": ""
}
```

ใส่ slug ของบริการจริงใน `REVIEW_TARGET` แล้ว commit/deploy หากเว้นว่าง เว็บจะแสดงสถานะรอตั้งค่า ไม่มีการเดา slug

`GET /api/reviews` เรียก `/api/v1/reviews?target=...&limit=10` บน origin ที่ตั้งค่าไว้เท่านั้น ไม่รับปลายทางหรือ target จากผู้เข้าชม ไม่ต้องใช้ API key

แสดงข้อมูลจาก `response.data`: ชื่อ คะแนน ข้อความ และลิงก์อ่านรีวิวเต็ม ด้วยข้อความปลอดภัย ไม่มีการ render HTML จากรีวิว

Desktop แสดง 5 การ์ด / Mobile แสดง 3 การ์ด พร้อมปุ่ม ลูกศรคีย์บอร์ด และ touch swipe อัปเดตทุก 30 วินาที มีสถานะ loading, empty, error และปุ่มลองใหม่เมื่อโหลดไม่ได้ ไม่ใช้รีวิวจำลองแทน

## Meta Pixel

เปิด `/admin` → เนื้อหาเว็บไซต์ → Meta Pixel ใส่เฉพาะ Pixel ID เป็นตัวเลข เปิดสวิตช์ แล้วกดบันทึกและเผยแพร่ ค่าบันทึกใน D1 ไม่ต้อง deploy ทุกครั้งที่เปลี่ยน Pixel ID

ค่าเริ่มต้นปิดใช้งาน เมื่อเปิดแล้วหน้าเว็บผู้ชมจะโหลด Meta Pixel และส่ง PageView ครั้งเดียวต่อการเปิดหน้า ไม่โหลดในหน้าแอดมิน ไม่ต้องใส่ Access Token หรือโค้ด JavaScript การปิดมีผลเมื่อผู้ชมเปิดหรือโหลดหน้าใหม่

## ตรวจสอบในเครื่อง

```sh
npm ci
npm run build
node --test tests/reviews.test.mjs
npm run dev
```

การอัปเดต GitHub ไม่ได้ยืนยันว่า Cloudflare deploy แล้ว ให้ตรวจสถานะ Builds และทดสอบ `/api/reviews` บน URL จริงหลัง deploy
