# Part 4

อ้างอิง `Downloads/deploy2/สำเนาของ part4.pdf` (64 หน้า)

| หน้า | งาน | สถานะ |
| --- | --- | --- |
| 3–15 | Dockerfile, .dockerignore, build และ run | ผ่าน npm test, build Linux amd64 และ Compose; API CRUD local ผ่าน 6 ต.ค. 2026 |
| 16–24 | Docker Hub repository, tag, login, push | ผ่าน: Public repository floridae/typescript1; v1 และ latest มี digest ตรงกัน ตรวจ registry แล้ว 6 ต.ค. 2026 |
| 33–43 | Azure Container Apps และ ingress | ยังไม่ได้ deploy |
| 44–51 | GitHub Actions publish Docker image | เตรียมใน ci.yml แล้ว; ต้องตั้ง DOCKERHUB_USERNAME และ DOCKERHUB_TOKEN ก่อนรัน publish |
| 59–64 | Docker Compose (เพิ่มเติม) | ผ่าน app + MongoDB local ที่ localhost:3104; ผู้ใช้ทดสอบชั่วคราวถูกลบแล้ว |

## Docker Hub และ GitHub Actions

ใน repository `Floridae242/TypeScript1` ตั้งค่า:

- Actions variable `DOCKERHUB_USERNAME`: username ของ Docker Hub
- Actions secret `DOCKERHUB_TOKEN`: access token ที่ผู้ใช้สร้างและให้สิทธิ์ push image

Workflow เดียว: unit test → Docker build, audit, API test → publish

Push main รัน CI เท่านั้น ส่วน publish รันเมื่อกด Run workflow (กรอก reason) หรือเผยแพร่ GitHub Release หลังการตรวจทั้งหมดผ่าน
Image: `<username>/typescript1:latest`, tag ตาม commit (`sha-...`) และ release tag เมื่อมี release
รองรับ Linux amd64 สำหรับ Azure และ arm64 สำหรับ Apple Silicon
ไม่ใส่ MongoDB URI หรือรหัสผ่านใน image หรือ GitHub source

## Azure Portal

- Subscription: Azure for Students
- Resource group: `typescript1-part4-rg`
- App: `typescript1-part4`
- Environment: `typescript1-part4-env`
- Region: Southeast Asia ตามสไลด์ หาก subscription รองรับ
- Plan: Consumption, CPU 0.25 / memory 0.5 GiB, replicas 0–1
- Image source: Docker Hub; image `<username>/typescript1:<release-tag หรือ sha-tag>`
- Secret `mongodb-uri`: URI จาก `.env` (ต้องยืนยันก่อนส่ง credential ไป Azure)
- Environment variables: `PORT=3000`, `MONGODB_URI` อ้างอิง secret `mongodb-uri`
- Ingress: enabled, HTTP, external, target port 3000, HTTPS เท่านั้น
- ตรวจราคาและขออนุมัติก่อน Create

API ตัวอย่างยังไม่มี login/authorization จึงควรตั้ง IP restriction ให้เข้าจาก IP ผู้ใช้ก่อนเปิดใช้งานกับ Atlas ที่มีข้อมูลจริง
ตรวจ Atlas network access สำหรับ outbound IP ของ Azure ก่อนเริ่มแอป โดยไม่เปิดทุก IP อัตโนมัติ
เมื่อ deploy แล้วตรวจ `/`, `/test.html` และ `/api/users` (อ่านอย่างเดียวกับข้อมูลจริง)

## Compose เพิ่มเติม

```bash
docker compose -p typescript1-part4 up -d --build
```

เปิด http://localhost:3104/test.html
ใช้ฐานข้อมูล MongoDB local แยกจาก Atlas และไม่มีการเปิดพอร์ต database ออกนอก Docker

```bash
docker compose -p typescript1-part4 down
```

คำสั่ง down เก็บข้อมูลใน named volume ไว้ ไม่ใช้ `down -v` เว้นแต่ต้องการลบข้อมูล lab

แหล่งเอกสารปัจจุบัน:
- https://docs.docker.com/build/ci/github-actions/multi-platform/
- https://learn.microsoft.com/en-us/azure/container-apps/ingress-how-to
