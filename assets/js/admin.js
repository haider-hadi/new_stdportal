(async function(){
  await SPDB.seedDefaultAdmin();
  const adminUser = localStorage.getItem('sp:admin');
  if(!adminUser){ /* redirect? remain but disable */ }

  // ---------- Students (your existing code) ----------
  const studentForm = document.getElementById('studentForm');
  studentForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(studentForm).entries());
    try{
      await SPDB.addStudent({
        cnic: data.cnic.trim(), name: data.name.trim(), fatherName: data.fatherName.trim(), klass: data.class
      });
      studentForm.reset();
      alert('Student added');
    }catch(err){ alert(err.message); }
  });

  // ---------- Teachers (NEW) ----------
  const teacherForm = document.getElementById('teacherForm');
  const teacherList = document.getElementById('teacherList');
  const teacherSearch = document.getElementById('teacherSearch');
  let teacherCache = [];

  async function refreshTeachers(){
    // listTeachers() is added in db.js (see Section C)
    teacherCache = await SPDB.listTeachers();
    renderTeachers();
  }
  function renderTeachers(){
    const q = (teacherSearch?.value || '').toLowerCase().trim();
    let rows = teacherCache.slice();
    if(q) rows = rows.filter(t =>
      (t.cnic||'').toLowerCase().includes(q) || (t.name||'').toLowerCase().includes(q)
    );
    teacherList.innerHTML = rows.map(t => `
      <tr>
        <td>${t.cnic||''}</td>
        <td>${t.name||''}</td>
        <td>${t.fatherName||''}</td>
        <td>${t.expertise||''}</td>
        <td>${t.classIncharge||''}</td>
        <td>${t.pay!=null ? ('PKR '+t.pay) : ''}</td>
        <td>
          <button class="btn btn-outline" data-act="edit" data-id="${t.cnic}">Edit</button>
          <button class="btn btn-outline" data-act="del" data-id="${t.cnic}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  teacherForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(teacherForm).entries());
    try{
      await SPDB.addTeacher({
        cnic: d.cnic.trim(),
        name: d.name.trim(),
        fatherName: d.fatherName.trim(),
        expertise: d.expertise.trim(),
        classIncharge: d.classIncharge || '',
        pay: Number(d.pay||0)
      });
      teacherForm.reset();
      await refreshTeachers();
      alert('Teacher added');
    }catch(err){ alert(err.message); }
  });

  teacherSearch?.addEventListener('input', renderTeachers);
  teacherList?.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-act]'); if(!btn) return;
    const cnic = btn.dataset.id; const act = btn.dataset.act;
    const t = teacherCache.find(x=>x.cnic===cnic);
    if(act==='del'){
      if(confirm('Delete this teacher?')){ await SPDB.deleteTeacher(cnic); await refreshTeachers(); }
    }else if(act==='edit'){
      if(!t) return;
      const name = prompt('Name', t.name||'');
      const father = prompt('Father Name', t.fatherName||'');
      const expertise = prompt('Expertise', t.expertise||'');
      const classIncharge = prompt('Class In-charge', t.classIncharge||'');
      const pay = prompt('Pay (PKR)', t.pay!=null?t.pay:'0');
      await SPDB.updateTeacher(cnic, { name, fatherName: father, expertise, classIncharge, pay: Number(pay||0) });
      await refreshTeachers();
    }
  });

  await refreshTeachers();

  // ---------- Fees (your existing code) ----------
  const feeForm = document.getElementById('feeForm');
  feeForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(feeForm).entries());
    try{ await SPDB.setFee(d.cnic, { amount: Number(d.amount||0), status: d.status }); alert('Fee updated'); }catch(err){ alert(err.message); }
  });

  // ---------- Announcements (your existing code) ----------
  const annForm = document.getElementById('annForm');
  const annList = document.getElementById('annList');
  annForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(annForm).entries());
    try{ await SPDB.addAnnouncement(d.title, d.body); annForm.reset(); }catch(err){ alert(err.message); }
  });
  if(annList){
    SPDB.onValue('announcements', (val)=>{
      const arr = val? Object.values(val).sort((a,b)=>b.date-a.date):[];
      annList.innerHTML = arr.map(a=>`<li class=itm><div><b>${a.title}</b><div class=meta>${new Date(a.date).toLocaleString()}</div></div><button data-id="${a.id}">Delete</button></li>`).join('');
    });
    annList.addEventListener('click', async (e)=>{
      const btn = e.target.closest('button[data-id]'); if(!btn) return;
      await SPDB.deleteAnnouncement(btn.dataset.id);
    });
  }

  // ---------- Books (your existing code) ----------
  const bookForm = document.getElementById('bookForm');
  bookForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(bookForm).entries());
    try{ await SPDB.upsertBook(d.class, d.subject, d.price); bookForm.reset(); alert('Book added'); }catch(err){ alert(err.message); }
  });

  // ---------- Results (your existing code) ----------
  const resForm = document.getElementById('resultForm');
  const addRowBtn = document.getElementById('addSubjectRow');
  addRowBtn?.addEventListener('click', ()=>{
    const wrap = document.getElementById('subjectsWrap');
    const row = document.createElement('div');
    row.className = 'grid';
    row.style.gridTemplateColumns = '2fr 1fr 1fr';
    row.style.gap = '10px';
    row.innerHTML = `<input name="subject" class="input" placeholder="Subject" required>
                     <input name="obtained" type="number" class="input" placeholder="Obtained" required>
                     <input name="max" type="number" class="input" placeholder="Max" required>`;
    wrap.appendChild(row);
  });
  resForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(resForm).entries());
    const rows = Array.from(document.querySelectorAll('#subjectsWrap .grid')).map(r=>{
      const [subject, obtained, max] = r.querySelectorAll('input');
      return { subject: subject.value.trim(), obtained: Number(obtained.value||0), max: Number(max.value||0) };
    });
    try{ await SPDB.addResult(d.cnic, d.testName, rows); resForm.reset(); document.getElementById('subjectsWrap').innerHTML=''; alert('Result saved'); }catch(err){ alert(err.message); }
  });

})();