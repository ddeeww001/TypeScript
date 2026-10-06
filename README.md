# Deployment part 2–3: TypeScript, GitHub Actions และ MongoDB

โปรเจกต์นี้ทำตามตัวอย่างใน `สำเนาของ part2.pdf` และ `สำเนาของ part3.pdf` โดยมี Express server, TypeScript build, unit test, GitHub Actions และ User API ที่ใช้ MongoDB

## รันในเครื่อง

```bash
npm ci
```

กำหนดค่า environment ใน PowerShell ก่อนรัน server โดยไม่ต้องสร้างไฟล์ `.env`:

```powershell
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/typescript1"
$env:PORT = "3000"
npm run dev
```

จากนั้นเปิด `/test.html` บนพอร์ตที่ตั้งไว้ใน `PORT` เพื่อทดลองเพิ่มผู้ใช้

```bash
npm run build
npm start
npm test
```

`npm run build` สร้าง JavaScript ใน `dist/` ส่วน `npm test` build แล้วทดสอบ `Utils.add()` ด้วย exit status ที่ GitHub Actions ตรวจจับได้

## User API จาก part 3

| Method | URL | งาน |
| --- | --- | --- |
| POST | `/api/users` | สร้างผู้ใช้ด้วย `name`, `email`, `password` |
| GET | `/api/users` | ดูผู้ใช้ทั้งหมด |
| GET | `/api/users/:id` | ดูผู้ใช้ตาม ID |
| PUT | `/api/users/:id` | แก้ไขผู้ใช้ |
| DELETE | `/api/users/:id` | ลบผู้ใช้ |

ตัวอย่างส่งข้อมูล:

```bash
curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"A","email":"a@example.com","password":"example123"}'
```

รหัสผ่านถูก hash ก่อนบันทึก และ API ไม่ส่งรหัสผ่านกลับมา ตัวอย่างนี้ใช้ฝึกในเครื่อง ยังไม่มีระบบ login หรือสิทธิ์ผู้ใช้

## Docker จาก part 3

หลังเปิด Docker Desktop แล้ว ลองคำสั่งพื้นฐานจากสไลด์:

```bash
docker --version
docker image ls
docker container ls
docker run --rm hello-world
```

หากต้องการทดลอง MongoDB ในเครื่อง สามารถใช้ `MONGODB_URI=mongodb://127.0.0.1:27017/typescript1` ใน `.env` เมื่อมี MongoDB ที่รันอยู่ หรือใช้ MongoDB Atlas ตามสไลด์

## Git และ CI

เมื่อ push ไป `main`, workflow `Part 3 CI` จะรัน unit test ก่อน จากนั้น build Docker image, ตรวจ dependency และทดสอบ User API กับ MongoDB ชั่วคราวเป็นงานขนาน โดยไม่ต้องใส่ Atlas URI ลงใน GitHub

`npm run test:api` ใช้ `MONGODB_URI` ที่ตั้งไว้ ทดสอบ CRUD แล้วลบผู้ใช้ทดสอบเมื่อจบ

```bash
docker build -t typescript1:part3 .
```

ตัวอย่างการตรวจและจัดการเวอร์ชันจากหน้า 7–8, 16–17, 28–31:

```bash
git status
git log --oneline
git switch -c feature/example
git switch main
git merge feature/example
git revert <commit-id>
```

คำสั่ง rollback ในสไลด์เป็นตัวอย่างสำหรับศึกษา การใช้ `git reset --hard` จะลบการแก้ไขในเครื่อง จึงควรตรวจสถานะและ commit ที่ต้องการก่อนทุกครั้ง

สไลด์หน้า 15 ยกตัวอย่าง `.gitignore` สำหรับการทดลอง แต่ GitHub Actions ต้องใช้ source, package files และ workflow ด้วย โปรเจกต์นี้เก็บไฟล์เหล่านั้น และไม่เก็บ `dist/` หรือ `node_modules/`

สไลด์หน้า 20–27 แสดงการเพิ่ม collaborator และการแก้ปัญหา SSH ใน GitHub Desktop ขั้นตอนเหล่านี้ใช้เฉพาะเมื่อมี repository และผู้ร่วมงานจริง ไม่ต้องคัดลอก `.git` จาก repository อื่น

## Azure VM จาก part 3

ใน Azure Portal เลือก subscription **Azure for Students** แล้วสร้าง VM โดยใช้ resource group `typescript1-part3-rg`, ชื่อ `typescript1-part3-vm`, region **Canada Central**, image **Windows Server 2022 Datacenter x64 Gen2**, และขนาด **Standard D2s v3** ตามสไลด์ ตั้งชื่อผู้ดูแลระบบและรหัสผ่านใน Azure Portal เท่านั้น อย่าเก็บรหัสผ่านหรือ `MONGODB_URI` ใน Git

ก่อนกด Create ให้ตรวจราคาในหน้า Review + create, เปิด auto-shutdown ในแท็บ Management และจำกัด RDP (3389) ให้เข้าจาก IP ของผู้ใช้ ส่วน HTTP (80) เปิดเมื่อมีเว็บเซิร์ฟเวอร์จริง หากต้องการรัน Node API บน VM ให้ติดตั้ง Node.js, คัดลอกโค้ด, ตั้ง `MONGODB_URI` เป็น environment variable บน VM แล้วให้ reverse proxy ส่ง HTTP ไปยังพอร์ตแอป ไม่เปิดพอร์ต 3000 ตรงสู่อินเทอร์เน็ต

**สถานะ 5 ต.ค. 2026:** ตรวจ Azure Portal ซ้ำแล้ว `Standard_D2s_v3` ยังขึ้น `NotAvailableForSubscription` ใน East US และ Southeast Asia (Canada Central พบข้อจำกัดเดียวกันเมื่อ 2 ต.ค.) จึงยังไม่มี VM ตามสไลด์ ผู้ใช้กำหนดให้ใช้ D2s v3 เท่านั้น และให้เก็บ [ร่างคำขอ Azure Support](docs/azure-sku-request.md) ไว้โดยยังไม่ส่ง

## ผลตรวจ Part 3

ดู [รายการตรวจตามหน้าสไลด์](docs/part3-checklist.md) สำหรับผลจริงและขั้นตอนที่ยังค้าง

เมื่อ 5 ต.ค. 2026 เชื่อมต่อ Cluster0 ใหม่และทดสอบ User API แบบ CRUD บน MongoDB Atlas ผ่านแล้ว ใช้ credential ใน `.env` ซึ่งไม่ถูกเก็บใน Git ทดลอง MySQL สอง container บนพอร์ต 3309 และ 3301 พร้อม `exec`, `stop`, `start`, `rm` ผ่าน และรันแอป Docker กับ Atlas ได้ที่ <http://localhost:3103/test.html>

MongoDB Compass เชื่อมต่อ `Part3 Cluster0` และเปิด collection `test.users` ได้แล้ว

## Part 4

ดู [ขั้นตอนและสถานะ Part4](docs/part4-checklist.md) สำหรับ Docker Hub, Azure Container Apps และ workflow publish image

`Part 4 CI` รัน test และ build เมื่อ push main; publish ไป Docker Hub เมื่อกด Run workflow หรือเผยแพร่ release หลัง CI ผ่าน และตั้ง `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` แล้ว

Docker Compose (ส่วนเพิ่มเติมท้ายสไลด์):

```bash
docker compose -p typescript1-part4 up -d --build
```

เปิด <http://localhost:3104/test.html> ใช้ MongoDB local แยกจาก Atlas
