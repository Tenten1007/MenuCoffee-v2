# คู่มือการ Deploy โปรเจกต์ MenuCoffee สู่ Production

เอกสารนี้เป็นแนวทางสำหรับขั้นตอนการนำโปรเจกต์ MenuCoffee ขึ้นสู่ระบบ Production อย่างเต็มรูปแบบ โดยใช้แพลตฟอร์ม Railway.app เป็นหลัก

## 📋 ขั้นตอนเตรียมการก่อน Deploy (Pre-deployment Checklist)

ก่อนที่จะเริ่มกระบวนการ deploy กรุณาตรวจสอบให้แน่ใจว่าได้ดำเนินการตามขั้นตอนเหล่านี้ครบถ้วนแล้ว

### 1. การจัดการ Environment Variables (สำคัญมาก)
- [ ] **สร้างไฟล์ `.env` สำหรับ Production:** ที่ Root ของโปรเจกต์ `server` ให้สร้างไฟล์ชื่อ `.env` ขึ้นมาใหม่
- [ ] **ตั้งค่า Secret Keys:** สร้างค่าลับที่แข็งแกร่งและไม่ซ้ำใครสำหรับตัวแปรต่อไปนี้ในไฟล์ `.env`:
  - `DB_HOST`: Host ของฐานข้อมูล (เช่น `containers-us-west-83.railway.app`)
  - `DB_USER`: ชื่อผู้ใช้ฐานข้อมูล
  - `DB_PASSWORD`: รหัสผ่านฐานข้อมูล
  - `DB_NAME`: ชื่อฐานข้อมูล
  - `DB_PORT`: พอร์ตของฐานข้อมูล
  - `JWT_SECRET`: Secret key สำหรับสร้าง Access Token (ใช้คำสั่ง `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` ในการสร้าง)
  - `REFRESH_TOKEN_SECRET`: Secret key สำหรับสร้าง Refresh Token (ใช้วิธีเดียวกับ `JWT_SECRET`)
  - `SESSION_SECRET`: Secret key สำหรับ Express Session (ใช้วิธีเดียวกับ `JWT_SECRET`)
- [ ] **ตรวจสอบ `.gitignore`:** ตรวจสอบให้แน่ใจว่าไฟล์ `.env` ถูกเพิ่มไว้ใน `.gitignore` ของ `server` เพื่อป้องกันไม่ให้ข้อมูลสำคัญรั่วไหลขึ้นไปบน GitHub

### 2. การตั้งค่าฐานข้อมูล
- [ ] **เตรียม Production Database:** สร้างฐานข้อมูล MySQL บน Railway หรือผู้ให้บริการคลาวด์ที่คุณเลือก
- [ ] **Run Initial Schema:** นำโค้ดจาก `server/db/init.sql` ไปรันบนฐานข้อมูล Production เพื่อสร้างตารางที่จำเป็นทั้งหมด

### 3. การตรวจสอบโค้ด
- [ ] **ตรวจสอบการเชื่อมต่อ API:** ในฝั่ง Client (`client/`) ให้ตรวจสอบว่า URL ที่ใช้เรียก API ชี้ไปยัง URL ของ Production Server (ไม่ใช่ `http://localhost:5000`) โดยอาจใช้ Environment Variable เช่น `VITE_API_URL`
- [ ] **Commit และ Push โค้ดล่าสุด:** ตรวจสอบให้แน่ใจว่าโค้ดเวอร์ชันล่าสุดทั้งหมดได้ถูก commit และ push ขึ้นไปยัง branch `main` บน GitHub เรียบร้อยแล้ว

## 🚀 ขั้นตอนการ Deploy ด้วย Railway

เมื่อเตรียมการทุกอย่างเรียบร้อยแล้ว ให้ทำตามขั้นตอนต่อไปนี้เพื่อ Deploy

### 1. เชื่อมต่อ Railway กับ GitHub
- [ ] ล็อกอินเข้าสู่ [Railway.app](https://railway.app)
- [ ] ไปที่ Dashboard และกด "New Project"
- [ ] เลือก "Deploy from GitHub repo"
- [ ] เลือก Repository `Tenten1007/MenuCoffee` ของคุณ
- [ ] Railway จะตรวจจับโปรเจกต์ของคุณโดยอัตโนมัติ

### 2. การตั้งค่า Service บน Railway
Railway อาจจะสร้าง Service แยกกันสำหรับ `client` และ `server` หรืออาจจะรวมเป็นอันเดียว ขึ้นอยู่กับการตั้งค่า `railway.json` ของเรา

- **Server Service:**
  - [ ] **Environment Variables:** ไปที่หน้าตั้งค่าของ Service ที่เป็น Server (backend) -> เลือกแท็บ "Variables"
  - [ ] **เพิ่มข้อมูลสำคัญ:** นำค่าทั้งหมดจากไฟล์ `.env` ที่คุณสร้างไว้ (เช่น `DB_HOST`, `JWT_SECRET` เป็นต้น) มาใส่ใน Environment Variables ของ Railway ทีละตัว **ห้ามใส่ไฟล์ `.env` ขึ้นไปตรงๆ**
  - [ ] **ตั้งค่า Start Command:** ตรวจสอบว่า Start Command ถูกตั้งค่าเป็น `npm run start:prod` หรือ `node server/index.js`

- **Client Service:**
  - [ ] **Environment Variables (ถ้ามี):** หาก Client ต้องการตัวแปร เช่น `VITE_API_URL` ให้เพิ่มในนี้ โดยชี้ไปที่ URL ของ Server ที่ Railway สร้างให้
  - [ ] **ตั้งค่า Build Command:** ตรวจสอบว่า Build Command ถูกตั้งค่าเป็น `npm run build` หรือ `npm run build:prod`
  - [ ] **ตั้งค่า Start Command:** โดยทั่วไปสำหรับ React (Vite) จะไม่มี Start command เพราะเราจะ serve ไฟล์ static ที่ build แล้ว

### 3. การสร้าง Domain และเปิดใช้งาน
- [ ] **สร้าง Domain:** ไปที่หน้าตั้งค่าของ Service -> เลือกแท็บ "Settings"
- [ ] **Generate Domain:** ในส่วนของ "Networking" กด "Generate Domain" เพื่อให้ Railway สร้าง URL สาธารณะให้ (เช่น `menucoffee-production-1234.up.railway.app`)
- [ ] **ทำซ้ำกับอีก Service:** ดำเนินการสร้าง Domain ให้กับทั้ง Client และ Server
- [ ] **อัปเดต `VITE_API_URL`:** นำ URL ของ Server ที่ได้ ไปอัปเดตใน Environment Variable `VITE_API_URL` ของฝั่ง Client แล้วกด deploy ใหม่อีกครั้ง

## ✅ การตรวจสอบหลัง Deploy (Post-deployment Verification)

หลังจาก Deploy สำเร็จแล้ว ให้ทำการตรวจสอบฟังก์ชันต่างๆ เพื่อให้แน่ใจว่าทุกอย่างทำงานถูกต้อง
- [ ] เปิด URL ของ Client และทดลองใช้งานฟังก์ชันหลักๆ
- [ ] ลองสมัครสมาชิก, ล็อกอิน, เพิ่ม/แก้ไขเมนู
- [ ] ตรวจสอบว่ารูปภาพแสดงผลถูกต้อง
- [ ] เปิด Developer Tools (F12) ดูว่ามี error ใน Console หรือ Network tab หรือไม่
- [ ] ตรวจสอบ Log ของ Server บน Railway เพื่อหาข้อผิดพลาด (ถ้ามี)

---

ขอให้โชคดีกับการ Deploy! 