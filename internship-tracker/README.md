# Internship Quick Add

A one-page site for adding internships to `Internship_Tracker.xlsx` fast: type the
company name, press **Enter**, and it's written into the next empty row of the
Tracker sheet.

## How to use

1. Open `index.html` in a browser (Chrome or Edge recommended — no server needed).
2. Click **Open Internship_Tracker.xlsx** and pick your tracker file.
3. Type a company name and press **Enter**. Repeat.

- In **Chrome/Edge**, each add is saved straight back into the .xlsx file (the browser
  asks for permission the first time). Close the file in Excel first.
- In **Safari/Firefox**, the file can't be saved in place, so click
  **Download updated file** when you're done and replace your old copy.
- New rows default to status **Applied** and today's date applied (so they count
  toward "Total Applications"). Open **More details** to set role, location, status,
  dates, link or notes; status and date stay set between adds.
- You're warned before adding a company that's already in the tracker.

Your formulas, dropdowns, and color-coding in the spreadsheet are kept as-is.

## Terminal version

`add_internship.py` does the same thing from the command line and saves after
every company. It needs Python 3 and openpyxl (`python3 -m pip install openpyxl`).

```sh
cd ~/Downloads                       # the folder with your tracker and the script
python3 add_internship.py            # uses Internship_Tracker.xlsx in this folder
python3 add_internship.py path/to/Internship_Tracker.xlsx
python3 add_internship.py -d         # also asks for role, location, status, dates, link, notes
```

Type a company, press Enter, then type the role (or press Enter to skip it). An empty line (or `q`) quits. Close the file in
Excel before running it, or the save will fail.
