# راهنمای رفع مشکل Login

## مشکل: خطای 401 - Invalid username or password

اگر با username `hse1` و password `1234` نمی‌توانید وارد شوید:

### راه حل 1: ایجاد کاربران ادمین

اگر کاربران در دیتابیس وجود ندارند، باید آن‌ها را ایجاد کنید:

```bash
cd backend
npm run init-admins
```

این دستور 4 کاربر ادمین ایجاد می‌کند:
- hse0 (password: 1234)
- hse1 (password: 1234)
- hse2 (password: 1234)
- hse3 (password: 1234)

### راه حل 2: ایجاد مجدد کاربر hse1

اگر کاربر hse1 وجود دارد ولی password اشتباه است:

```bash
cd backend
npm run force-create-hse1
```

این دستور کاربر hse1 را حذف و دوباره ایجاد می‌کند.

### راه حل 3: بررسی کاربران موجود

برای دیدن لیست کاربران موجود در دیتابیس:

```bash
cd backend
npm run check-users
```

### راه حل 4: ایجاد کاربر از طریق API

اگر سرور در حال اجرا است، می‌توانید از طریق API کاربر ایجاد کنید:

```bash
# با curl
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hse1",
    "password": "1234",
    "role": "Admin"
  }'
```

یا از Postman/Insomnia استفاده کنید:
- Method: POST
- URL: http://localhost:5000/api/users
- Headers: Content-Type: application/json
- Body:
```json
{
  "username": "hse1",
  "password": "1234",
  "role": "Admin"
}
```

### بررسی لاگ‌های سرور

وقتی لاگین می‌کنید، در console سرور باید این اطلاعات را ببینید:

```
[LOGIN] Attempt for username: "hse1"
[LOGIN] User found: Yes/No
[LOGIN] Stored password: "1234" (length: 4)
[LOGIN] Provided password: "1234" (length: 4)
[LOGIN] Passwords match: true/false
[LOGIN] User role: Admin
```

اگر `User found: No` باشد، یعنی کاربر در دیتابیس وجود ندارد.

اگر `Passwords match: false` باشد، یعنی password اشتباه است.

### نکات مهم

1. **Username case-insensitive است**: `hse1`، `HSE1`، `Hse1` همه یکسان هستند
2. **Password باید دقیقاً مطابقت داشته باشد**: فاصله‌های اضافی یا کاراکترهای خاص مشکل ایجاد می‌کند
3. **مطمئن شوید MongoDB متصل است**: اگر خطای اتصال دارید، ابتدا مشکل MongoDB را حل کنید

### عیب‌یابی

1. **بررسی اتصال MongoDB**:
   - مطمئن شوید سرور بدون خطا راه‌اندازی شده
   - پیام `✅ MongoDB Connected Successfully!` را ببینید

2. **بررسی کاربران**:
   ```bash
   npm run check-users
   ```

3. **بررسی لاگ‌های سرور**:
   - وقتی لاگین می‌کنید، لاگ‌های `[LOGIN]` را در console سرور ببینید
   - این لاگ‌ها به شما می‌گویند مشکل از کجاست

4. **تست مستقیم API**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "hse1",
       "password": "1234"
     }'
   ```

### اگر مشکل ادامه داشت

1. MongoDB Compass را باز کنید
2. به دیتابیس متصل شوید
3. collection `users` را بررسی کنید
4. مطمئن شوید کاربر `hse1` با password `1234` وجود دارد

