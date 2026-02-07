if(!localStorage.getItem('sp:admin')){
  alert('Please login as admin');
  location.href='../index.html';
}

const tbody = document.getElementById('studentList');
const searchInput = document.getElementById('studentSearch');
let allStudents = [];
let currentPage = 1;
const perPage = 5;

// Load students and convert object to array
async function loadStudents(){
  const studentsObj = await SPDB.listAllStudents() || {};
  allStudents = Object.values(studentsObj); // ✅ FIX: convert object to array
  renderTable();
}

function renderTable(){
  const search = searchInput.value.toLowerCase();
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(search) || s.cnic.includes(search)
  );

  const totalPages = Math.ceil(filtered.length/perPage);
  currentPage = Math.min(currentPage, totalPages) || 1;
  const start = (currentPage-1)*perPage;
  const pageItems = filtered.slice(start,start+perPage);

  tbody.innerHTML = '';
  pageItems.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.cnic}</td>
      <td>${s.name}</td>
      <td>${s.fatherName}</td>
      <td>${s.class}</td>
      <td>
        <button class="btn btn-outline" onclick="openModal('${s.cnic}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteStudent('${s.cnic}')">Delete</button>
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
const form = document.getElementById('editStudentForm');

function openModal(cnic){
  const s = allStudents.find(s=>s.cnic===cnic);
  form.cnic.value = s.cnic;
  form.name.value = s.name;
  form.fatherName.value = s.fatherName;
  form.class.value = s.class;
  modal.classList.add('show');
}

function closeModal(){ modal.classList.remove('show'); }

form.addEventListener('submit', async e=>{
  e.preventDefault();
  const patch = {
    name: form.name.value,
    fatherName: form.fatherName.value,
    class: form.class.value
  };
  await SPDB.update(`students/${form.cnic.value}`, patch);
  closeModal();
  loadStudents();
});

async function deleteStudent(cnic){
  if(confirm('Delete this student?')){
    await SPDB.remove(`students/${cnic}`);
    loadStudents();
  }
}

// Init
loadStudents();
