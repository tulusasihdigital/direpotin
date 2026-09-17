// MARCOM DiRepotIn — Google Apps Script API
// 1) Open your Google Spreadsheet > Extensions > Apps Script
// 2) Paste this file.
// 3) Change SPREADSHEET_ID below.
// 4) Deploy > New deployment > Web app > Execute as Me > Anyone with the link.
// 5) Copy the /exec URL into API_URL in index.html.

const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID_HERE";

function doGet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const result = {
    timeline: readSheet(ss, "Timeline"),
    database: readSheet(ss, "Database"),
    social: readSheet(ss, "Social"),
    editing: readSheet(ss, "Editing"),
    design: readSheet(ss, "Design")
  };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function readSheet(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getDisplayValues();
  const headers = values.shift().map(x => String(x).trim());
  return values.filter(row => row.some(x => x !== "")).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h || ("Column"+(i+1))] = row[i]);
    return obj;
  });
}
