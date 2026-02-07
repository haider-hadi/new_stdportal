
# Student Portal – Firebase Realtime DB (Option B: CNIC Login)

This is a complete front‑end project wired for **Firebase Realtime Database** using **custom CNIC + password** authentication (no Firebase Auth).

## ✨ Features
- **Home**: Student Register (only if CNIC is pre‑added by Admin), Student Login, Admin Login.
- **Admin Dashboard**: Add Students, Add Results (test with subjects), Fees (amount + status), Announcements CRUD, Books by class (Playgroup → Class 5).
- **Student Dashboard**: Profile (name, father, CNIC, class), Fee status, Results table per test.
- **Public Pages**: Announcements, Book details, About, Contact.

## 🔧 Firebase Setup
1. Create a **Realtime Database** in your Firebase project (URL will look like: `https://fort-grammar-school-default-rtdb.firebaseio.com`).
2. Open `assets/js/firebase.js` to confirm your config (already added).
3. **Run via a local server** (required for WebCrypto hashing): use VS Code Live Server or `npx serve`.

## 🗂️ Database Structure
```
config/admins/{username} -> { username, passwordHash }
students/{cnic}          -> { name, fatherName, cnic, class, registered, passwordHash? }
results/{cnic}/{testId}  -> { testId, testName, subjects:[{subject,obtained,max}], totalObtained, totalMax, createdAt }
fees/{cnic}              -> { amount, status }
announcements/{id}       -> { id, title, body, date }
books/{class}/{id}       -> { id, class, subject, price }
```

## 🔐 Rules (example – adjust as needed)
> You said you'll add Rules on Firebase. Here is a **starting point**. Apply and adjust in Firebase console.
```json
{
  "rules": {
    ".read": true,
    "config": { ".read": false, ".write": false },
    "students": {
      ".read": true,
      "$cnic": {
        ".write": "auth == null" // TEMP for demo; lock down in production
      }
    },
    "results": { ".read": true, ".write": false },
    "fees": { ".read": true, ".write": false },
    "announcements": { ".read": true, ".write": false },
    "books": { ".read": true, ".write": false }
  }
}
```
> **Important**: For production, restrict writes to admin only (e.g., with custom tokens or callable Cloud Functions). Since this project uses client‑only custom auth (Option B), limit writes in rules to specific IP ranges or create an admin console with temporary write windows.

## 🚪 Login & Registration Flow
- Admin pre‑adds a student (`students/{cnic}` with basic info).
- Student goes to **Register**, enters **CNIC + password** → app sets `passwordHash` and `registered=true`.
- Student **Login** checks CNIC + hashed password.
- Admin Login checks username/password against `config/admins/{username}` (seeded default: `admin/admin123`). Change it immediately.

## ▶️ Run & Deploy
- Open with a local server, then visit `index.html`.
- Deploy to **Firebase Hosting**, **Netlify**, or **Vercel** (static hosting).

## ⚠️ Notes
- This is a client‑side app; protect your database with strict rules.
- Hashing uses WebCrypto (`SHA‑256`). Use HTTPS when hosted.

## 📝 Customize
- Colors in `assets/css/styles.css`.
- Business logic in `assets/js/db.js`.
- Admin UI in `assets/js/admin.js`.
- Student UI in `assets/js/student.js`.

Enjoy and evolve! 🙌
