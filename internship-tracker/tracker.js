// Shared spreadsheet logic for Internship_Tracker.xlsx (used by the page and by tests).
(function (root) {
  const FIRST_DATA_ROW = 12;
  const LAST_DATA_ROW = 500;
  const COL = { company: 1, role: 2, location: 3, link: 4, status: 5, applied: 6, deadline: 7, days: 8, notes: 15 };
  const STATUSES = ['Wishlist', 'Networking', 'Applied', 'OA/Assessment', 'Interviewing',
    'Offer', 'Accepted', 'Rejected', 'Withdrawn'];

  function text(v) {
    if (v == null) return '';
    if (typeof v === 'object' && v.richText) return v.richText.map(t => t.text).join('');
    if (typeof v === 'object' && 'result' in v) return String(v.result ?? '');
    return String(v);
  }

  function getSheet(workbook) {
    return workbook.getWorksheet('Tracker') || workbook.worksheets[0];
  }

  function listEntries(workbook) {
    const ws = getSheet(workbook);
    const out = [];
    for (let r = FIRST_DATA_ROW; r <= LAST_DATA_ROW; r++) {
      const company = text(ws.getCell(r, COL.company).value).trim();
      if (!company) continue;
      out.push({
        row: r,
        company,
        role: text(ws.getCell(r, COL.role).value).trim(),
        status: text(ws.getCell(r, COL.status).value).trim(),
      });
    }
    return out;
  }

  function findDuplicate(workbook, company) {
    const key = company.trim().toLowerCase();
    return listEntries(workbook).find(e => e.company.toLowerCase() === key) || null;
  }

  // Dates are stored at UTC midnight so Excel shows the same calendar day everywhere.
  function toExcelDate(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }

  function addEntry(workbook, entry) {
    const ws = getSheet(workbook);
    let row = null;
    for (let r = FIRST_DATA_ROW; r <= LAST_DATA_ROW; r++) {
      if (!text(ws.getCell(r, COL.company).value).trim()) { row = r; break; }
    }
    if (row == null) throw new Error('The tracker is full (rows ' + FIRST_DATA_ROW + '-' + LAST_DATA_ROW + ').');

    const set = (col, value) => { if (value !== '' && value != null) ws.getCell(row, col).value = value; };
    set(COL.company, entry.company.trim());
    set(COL.role, (entry.role || '').trim());
    set(COL.location, (entry.location || '').trim());
    if (entry.link && entry.link.trim()) {
      const url = entry.link.trim();
      ws.getCell(row, COL.link).value = { text: url, hyperlink: url };
    }
    set(COL.status, entry.status || 'Applied');
    if (entry.applied) set(COL.applied, toExcelDate(entry.applied));
    if (entry.deadline) set(COL.deadline, toExcelDate(entry.deadline));
    set(COL.notes, (entry.notes || '').trim());

    const days = ws.getCell(row, COL.days);
    if (!days.value) days.value = { formula: `IF(F${row}="","",TODAY()-F${row})` };
    return row;
  }

  const api = { STATUSES, listEntries, findDuplicate, addEntry, getSheet };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Tracker = api;
})(this);
