# راهنمای اتصال به MongoDB

## مشکل TLS/Socket Connection

اگر خطای `Client network socket disconnected before secure TLS connection was established` دریافت می‌کنید:

### راه حل 1: Whitelist کردن IP در MongoDB Atlas

1. به [MongoDB Atlas](https://cloud.mongodb.com) بروید
2. روی پروژه خود کلیک کنید
3. از منوی سمت چپ **Network Access** را انتخاب کنید
4. روی دکمه **Add IP Address** کلیک کنید
5. برای تست، می‌توانید `0.0.0.0/0` را اضافه کنید (اجازه دسترسی از همه IPها)
   - ⚠️ توجه: این فقط برای development است
   - برای production، IP خاص خود را اضافه کنید
6. روی **Confirm** کلیک کنید
7. **1-2 دقیقه** صبر کنید تا تغییرات اعمال شوند

### راه حل 2: بررسی Connection String

فایل `.env` در پوشه `backend` را بررسی کنید:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
PORT=5000
```

**نکات مهم:**
- `username` و `password` را با اطلاعات واقعی جایگزین کنید
- اگر password شامل کاراکترهای خاص است (`@`, `#`, `$`, و غیره)، باید URL-encoded شوند
- `database-name` را با نام دیتابیس خود جایگزین کنید
- Connection string باید از MongoDB Atlas Dashboard کپی شود

### راه حل 3: استفاده از MongoDB محلی (برای تست)

اگر MongoDB محلی نصب دارید:

```env
MONGO_URI=mongodb://localhost:27017/hse
PORT=5000
```

### راه حل 4: بررسی مشکلات شبکه

- اینترنت خود را بررسی کنید
- VPN را غیرفعال کنید (اگر استفاده می‌کنید)
- Firewall را بررسی کنید
- از دستور `ping` برای تست اتصال استفاده کنید

## تست اتصال

بعد از تنظیمات، سرور را دوباره راه‌اندازی کنید:

```bash
npm run dev
```

اگر اتصال موفق باشد، پیام زیر را خواهید دید:

```
✅ MongoDB Connected Successfully!
   Host: cluster0.xxxxx.mongodb.net
   Database: your-database-name
   Ready State: Connected
```

## عیب‌یابی

### خطای Authentication
- Username و password را بررسی کنید
- مطمئن شوید کاربر در MongoDB Atlas وجود دارد
- دسترسی‌های کاربر را بررسی کنید

### خطای DNS/Network
- Connection string را بررسی کنید
- Hostname را در connection string چک کنید
- اتصال اینترنت را تست کنید

### خطای Timeout
- IP را در Network Access whitelist کنید
- Timeout را در کد افزایش دهید (فعلاً 30 ثانیه است)
- اتصال شبکه را بررسی کنید

## پشتیبانی

اگر مشکل ادامه داشت:
1. لاگ‌های کامل را بررسی کنید
2. Connection string را دوباره از MongoDB Atlas کپی کنید
3. مطمئن شوید MongoDB Atlas cluster فعال است

