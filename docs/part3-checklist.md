# Part 3 — ตรวจตามสไลด์

แหล่งอ้างอิง: `Downloads/deploy2/สำเนาของ part3.pdf` (122 หน้า)
ตรวจล่าสุด: 5 ตุลาคม 2026

| หน้า | ขั้นตอน | ผลตรวจ |
| --- | --- | --- |
| 27–42 | Azure for Students และ Windows VM D2s v3 | ยังติด `NotAvailableForSubscription`; ตรวจซ้ำ East US และ Southeast Asia วันที่ 5 ต.ค. ส่วน Canada Central พบข้อจำกัดวันที่ 2 ต.ค. ยังไม่มี VM |
| 44–58 | ติดตั้ง Docker | เปิด Docker Desktop และรัน `hello-world` ผ่าน บน macOS ไม่ต้องติดตั้ง WSL ซึ่งเป็นขั้นตอนสำหรับ Windows |
| 59–85 | pull, image ls, run, port mapping, exec, stop, start, rm | ทดลอง MySQL 8.4 สอง container: `3309:3306` และ `3301:3306`; SQL, stop/start และ remove ผ่าน ใช้ชื่อเฉพาะของ lab และลบเฉพาะ container ทดสอบ |
| 90–104 | MongoDB Atlas | ผู้ใช้สร้าง Cluster0 ใหม่; connection และ ping ผ่าน ใช้ URI ใหม่ใน `.env` ที่ Git ignore |
| 105–107 | MongoDB Compass | ติดตั้ง Compass 1.52.0 สำหรับ Apple Silicon จาก release ทางการ ตรวจ SHA-256 และ code signature ผ่าน; แอปแสดง `Connected to Part3 Cluster0` และเปิด `test.users` ได้ บันทึก connection ตามที่ผู้ใช้ยืนยัน |
| 108–118 | mongoose, cors, Model, Controller, Routes, server และ config | มี `User.ts`, `UserController.ts`, `UserRoutes.ts`, `index.ts`; ใช้ environment variable แทนการใส่รหัสผ่านใน source; CRUD กับ Atlas จริงผ่าน |
| 119–122 | หน้า `test.html` และ `/api/users` | HTTP 200 ผ่านทั้งหน้าเว็บและ API; app ใน Docker เชื่อมต่อ Atlas และเปิดสอง URL ได้ |

การตรวจเพิ่มเติม: `npm test` ผ่าน, `npm audit --omit=dev --audit-level=high` ไม่พบช่องโหว่, Docker build ผ่าน และค่าพอร์ตไม่ถูกต้องถูกปฏิเสธก่อนเริ่มเชื่อมต่อ database

แอป Docker สำหรับทดลองในเครื่อง: <http://localhost:3103/test.html>

การทดสอบ CRUD สร้างข้อมูลทดสอบชั่วคราวแล้วลบเมื่อจบ ไม่ได้ลบข้อมูลเดิมของผู้ใช้

ส่วน Docker, Atlas, Compass และ User API ผ่านการตรวจแล้ว ส่วน Azure ยังไม่ครบเพราะสร้าง VM D2s v3 ไม่ได้ ผู้ใช้ให้เก็บร่างคำขอ Support ไว้โดยยังไม่ส่ง
