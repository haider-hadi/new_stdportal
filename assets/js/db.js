
// Paths helper
const paths = {
  admins: (u) => `config/admins/${u}`,
  students: (cnic) => `students/${cnic}`,
  studentsAll: () => `students`,
  results: (cnic, testId) => `results/${cnic}/${testId}`,
  resultsByStudent: (cnic) => `results/${cnic}`,
  announcements: (id) => `announcements/${id}`,
  books: (klass, id) => `books/${klass}/${id}`,
  booksByClass: (klass) => `books/${klass}`,
  fees: (cnic) => `fees/${cnic}`
  
};
paths.teachers     = (cnic) => `teachers/${cnic}`;
paths.teachersAll  = ()      => `teachers`;
// Read once
function readOnce(path){ return db.ref(path).once('value').then(s=>s.val()); }
function write(path, data){ return db.ref(path).set(data); }
function update(path, data){ return db.ref(path).update(data); }
function push(path, data){ return db.ref(path).push(data); }
function remove(path){ return db.ref(path).remove(); }
function onValue(path, cb){ return db.ref(path).on('value', s=>cb(s.val())); }

// Seed default admin if missing (username: admin, password: admin123)
async function seedDefaultAdmin(){
  const ref = db.ref(paths.admins('admin'));
  const snap = await ref.once('value');
  if(!snap.exists()){
    const passwordHash = await sha256('haider123');
    await ref.set({ username:'haider', passwordHash, createdAt: Date.now() });
    console.log('Default admin created: haider / haider123 (please change).');
  }
}

// Admin login
async function loginAdmin(username, password){
  const admin = await readOnce(paths.admins(username));
  if(!admin) throw new Error('Admin not found');
  const hash = await sha256(password);
  if(hash !== admin.passwordHash) throw new Error('Invalid password');
  localStorage.setItem('sp:admin', username);
  return true;
}

// Student registration (Option B):
// Only allowed if a pre-provisioned student record exists and registered !== true
async function registerStudent(cnic, password){
  const path = paths.students(cnic);
  const record = await readOnce(path);
  if(!record){ throw new Error('CNIC not found. Please contact school.'); }
  if(record.registered){ throw new Error('This CNIC is already registered.'); }
  const passwordHash = await sha256(password);
  await update(path, { passwordHash, registered: true, updatedAt: Date.now() });
  return true;
}

// Student login
async function loginStudent(cnic, password){
  const record = await readOnce(paths.students(cnic));
  if(!record) throw new Error('CNIC not found.');
  if(!record.passwordHash) throw new Error('Please register first.');
  const hash = await sha256(password);
  if(hash !== record.passwordHash) throw new Error('Invalid password.');
  localStorage.setItem('sp:student', cnic);
  return true;
}

// Student CRUD (admin)
async function addStudent(data){
  const {cnic, name, fatherName, klass} = data;
  if(!cnic || !name || !fatherName || !klass) throw new Error('Missing fields');
  const path = paths.students(cnic);
  const existing = await readOnce(path);
  if(existing) throw new Error('Student CNIC already exists');
  await write(path, { name, fatherName, cnic, class: klass, registered:false, createdAt: Date.now() });
}
async function setFee(cnic, fee){ await write(paths.fees(cnic), fee); }
async function addAnnouncement(title, body){ const id = db.ref('announcements').push().key; await write(paths.announcements(id), {id,title,body,date:Date.now()}); }
async function deleteAnnouncement(id){ await remove(paths.announcements(id)); }
async function upsertBook(klass, subject, price){ const id = db.ref(paths.booksByClass(klass)).push().key; await write(paths.books(klass,id), {id, class: klass, subject, price: Number(price)}); }
async function addResult(cnic, testName, subjects){
  const testId = db.ref(paths.resultsByStudent(cnic)).push().key;
  let totalObtained=0,totalMax=0; subjects.forEach(s=>{ totalObtained+=Number(s.obtained||0); totalMax+=Number(s.max||0); });
  await write(paths.results(cnic, testId), { testId, testName, subjects, totalObtained, totalMax, createdAt: Date.now() });
}
// 1) Paths (add if missing)


// 2) Teacher CRUD
async function addTeacher(data){
  const {cnic, name, fatherName, expertise, classIncharge, pay} = data;
  if(!cnic || !name || !fatherName || !expertise) throw new Error('Missing fields');
  const path = paths.teachers(cnic);
  const existing = await readOnce(path);
  if(existing) throw new Error('Teacher CNIC already exists');
  await write(path, {
    cnic, name, fatherName,
    expertise, classIncharge: classIncharge || '',
    pay: Number(pay||0),
    createdAt: Date.now()
  });
}
async function listTeachers(){ const v = await readOnce(paths.teachersAll()); return v? Object.values(v):[]; }
async function updateTeacher(cnic, patch){ await update(paths.teachers(cnic), patch); }
async function deleteTeacher(cnic){ await remove(paths.teachers(cnic)); }

// 3) Student listing & record helpers (add if missing)
async function listAllStudents(){ const v = await readOnce(paths.studentsAll()); return v? Object.values(v):[]; }
async function getStudent(cnic){ return await readOnce(paths.students(cnic)); }
async function getResultsByStudent(cnic){ return await readOnce(paths.resultsByStudent(cnic)); }
async function getFeesByStudent(cnic){ return await readOnce(paths.fees(cnic)); }

// 4) Export functions on SPDB (merge with existing)
window.SPDB = Object.assign({}, window.SPDB,{ paths, readOnce, write, update, push, remove, onValue, seedDefaultAdmin, loginAdmin, registerStudent, loginStudent, addStudent, setFee, addAnnouncement, deleteAnnouncement, upsertBook, addResult, addTeacher, listTeachers, updateTeacher, deleteTeacher,listAllStudents, getStudent, getResultsByStudent, getFeesByStudent });

// Expose globally for inline scripts
window.SPDB = { paths, readOnce, write, update, push, remove, onValue, seedDefaultAdmin, loginAdmin, registerStudent, loginStudent, addStudent, setFee, addAnnouncement, deleteAnnouncement, upsertBook, addResult, addTeacher, listTeachers, updateTeacher, deleteTeacher,listAllStudents,getStudent,getResultsByStudent,getFeesByStudent };
  