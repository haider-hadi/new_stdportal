if(!localStorage.getItem('sp:admin')){
  alert('Please login as admin');
  location.href='../index.html';
}

const tbody = document.getElementById('teacherList');
const searchInput = document.getElementById('teacherSearch');
let allTeachers = [];
let currentPage = 1;
const perPage = 5;

async function loadTeachers(){
  const teachersObj = await SPDB.listTeachers() || {};
  allTeachers = Object.values(teachersObj); // ✅ object → array
  renderTable();
}

function renderTable(){
  const search = searchInput.value.toLowerCase();
  const filtered = allTeachers.filter(t =>
    t.name.toLowerCase().includes(search) || t.cnic.includes(search)
  );

  const totalPages = Math.ceil(filtered.length/perPage);
  currentPage = Math.min(currentPage, totalPages) || 1;
  const start = (currentPage-1)*perPage;
  const pageItems = filtered.slice(start,start+perPage);

  tbody.innerHTML = '';
  pageItems.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.cnic}</td>
      <td>${t.name}</td>
      <td>${t.fatherName}</td>
      <td>${t.expertise}</td>
      <td>${t.classIncharge || ''}</td>
      <td>${t.pay}</td>
      <td>
        <button class="btn btn-outline" onclick="openModal('${t.cnic}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteTeacher('${t.cnic}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination(totalPages);
}

function renderPagination(total){
  const div = document.getElementById('pagination');
  div.innerHTML = '';
  for(let i=1;i<=total;i++){
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className='btn btn-outline';
    if(i===currentPage) btn.style.fontWeight='bold';
    btn.onclick = ()=>{ currentPage=i; renderTable(); };
    div.appendChild(btn);
  }
}

searchInput.addEventListener('input', ()=>{ currentPage=1; renderTable(); });

// Modal
const modal = document.getElementById('editModal');
const form = document.getElementById('editTeacherForm');

function openModal(cnic){
  const t = allTeachers.find(t=>t.cnic===cnic);
  form.cnic.value = t.cnic;
  form.name.value = t.name;
  form.fatherName.value = t.fatherName;
  form.expertise.value = t.expertise;
  form.classIncharge.value = t.classIncharge || '';
  form.pay.value = t.pay;
  modal.classList.add('show');
}

function closeModal(){ modal.classList.remove('show'); }

form.addEventListener('submit', async e=>{
  e.preventDefault();
  const patch = {
    name: form.name.value,
    fatherName: form.fatherName.value,
    expertise: form.expertise.value,
    classIncharge: form.classIncharge.value,
    pay: Number(form.pay.value)
  };
  await SPDB.updateTeacher(form.cnic.value, patch);
  closeModal();
  loadTeachers();
});

async function deleteTeacher(cnic){
  if(confirm('Delete this teacher?')){
    await SPDB.deleteTeacher(cnic);
    loadTeachers();
  }
}

// Init
loadTeachers();
