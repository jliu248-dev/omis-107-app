const $ = id => document.getElementById(id);
const canSaveInPlace = 'showOpenFilePicker' in window;

let workbook = null;
let fileHandle = null; // set when the browser can save straight back to the file
let fileName = 'Internship_Tracker.xlsx';

for (const s of Tracker.STATUSES) $('status').add(new Option(s, s, s === 'Applied', s === 'Applied'));
const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
$('applied').value = today();

$('open-file').addEventListener('click', async () => {
  if (!canSaveInPlace) return $('file-input').click();
  try {
    [fileHandle] = await window.showOpenFilePicker({
      types: [{ description: 'Excel', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }],
    });
    await loadFile(await fileHandle.getFile());
  } catch (err) {
    if (err.name !== 'AbortError') showMessage(err.message, true);
  }
});

$('file-input').addEventListener('change', e => {
  if (e.target.files[0]) loadFile(e.target.files[0]);
});

async function loadFile(file) {
  workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  fileName = file.name;
  $('file-status').textContent = fileHandle
    ? `Editing ${file.name} — every company you add is saved straight into the file.`
    : `Loaded ${file.name}. Your browser can't save in place, so click "Download updated file" when you're done.`;
  $('open-file').textContent = 'Open a different file';
  $('company').disabled = $('add-btn').disabled = false;
  $('company').focus();
  render();
}

$('add-form').addEventListener('submit', async e => {
  e.preventDefault();
  const company = $('company').value.trim();
  if (!workbook || !company) return;

  const dup = Tracker.findDuplicate(workbook, company);
  if (dup && !confirm(`${dup.company} is already in row ${dup.row}${dup.role ? ` (${dup.role})` : ''}. Add it again?`)) return;

  try {
    const row = Tracker.addEntry(workbook, {
      company,
      role: $('role').value,
      location: $('location').value,
      status: $('status').value,
      applied: $('applied').value,
      deadline: $('deadline').value,
      link: $('link').value,
      notes: $('notes').value,
    });
    await save();
    showMessage(`Added ${company} (row ${row})${fileHandle ? ' and saved.' : '.'}`);
    resetForm();
    render();
  } catch (err) {
    showMessage(err.message, true);
  }
});

async function save() {
  if (!fileHandle) { $('download').hidden = false; return; }
  const writable = await fileHandle.createWritable();
  await writable.write(await workbook.xlsx.writeBuffer());
  await writable.close();
}

$('download').addEventListener('click', async () => {
  const blob = new Blob([await workbook.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: fileName });
  a.click();
  URL.revokeObjectURL(a.href);
});

function resetForm() {
  for (const id of ['company', 'role', 'location', 'deadline', 'link', 'notes']) $(id).value = '';
  // Status and date applied stay as-is so a batch of entries goes in fast.
  $('company').focus();
}

function render() {
  const entries = Tracker.listEntries(workbook).reverse();
  $('count').textContent = `(${entries.length})`;
  $('entries').replaceChildren(...entries.map(e => {
    const li = document.createElement('li');
    li.innerHTML = '<strong></strong> <span class="muted"></span> <span class="tag"></span>';
    li.children[0].textContent = e.company;
    li.children[1].textContent = e.role;
    li.children[2].textContent = e.status;
    li.children[2].dataset.status = e.status;
    return li;
  }));
}

function showMessage(text, isError = false) {
  $('message').textContent = text;
  $('message').className = isError ? 'error' : 'ok';
}
