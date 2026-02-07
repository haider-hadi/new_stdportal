
# Student Portal – Firebase Realtime DB


## Features
- **Home**: Student Register 
- **Admin Dashboard**: Add Students, Add Results (test with subjects), Fees (amount + status), Announcements CRUD, Books by class (Playgroup → Class 5).
- **Student Dashboard**: Profile (name, father, CNIC, class), Fee status, Results table per test.
- **Public Pages**: Announcements, Book details, About, Contact.

## Login & Registration Flow
- Admin pre‑adds a student (`students/{cnic}` with basic info).
- Student goes to **Register**, enters **CNIC + password** → app sets `passwordHash` and `registered=true`.
- Student **Login** checks CNIC + hashed password.
- Admin Login checks username/password 
