"use strict";

const journalEntries = document.getElementById("journal-entries");
fetch("data/notes.json", { cache: "no-cache" })
  .then(response => {
    if (!response.ok) throw new Error("Journal unavailable");
    return response.json();
  })
  .then(notes => {
    if (!Array.isArray(notes)) throw new Error("Invalid journal index");
    if (!notes.length) return;
    notes = notes.filter(note => /^notes\/[a-z0-9-]+\/$/.test(note.url));
    notes.sort((a, b) => b.date.localeCompare(a.date) || b.url.localeCompare(a.url));
    const pageSize = 5;
    const pageCount = Math.max(1, Math.ceil(notes.length / pageSize));
    const requestedPage = Number(new URL(location.href).searchParams.get("notes-page"));
    let currentPage = Number.isInteger(requestedPage) ? Math.max(1, Math.min(pageCount, requestedPage)) : 1;
    const navigation = document.createElement("nav");
    navigation.className = "journal-pagination";
    navigation.setAttribute("aria-label", "Journal pages");
    navigation.hidden = pageCount <= 1;
    const newer = document.createElement("button");
    newer.type = "button";
    newer.textContent = "Newer notes";
    const older = document.createElement("button");
    older.type = "button";
    older.textContent = "Older notes";
    const status = document.createElement("span");
    status.setAttribute("role", "status");
    navigation.append(newer, status, older);
    journalEntries.after(navigation);
    function renderPage() {
      const entries = document.createDocumentFragment();
      for (const note of notes.slice((currentPage - 1) * pageSize, currentPage * pageSize)) {
        const entry = document.createElement("article");
        entry.className = "journal-entry";
        const content = document.createElement("div");
        const heading = document.createElement("h3");
        const link = document.createElement("a");
        link.href = note.url;
        link.textContent = note.title;
        heading.append(link);
        const summary = document.createElement("p");
        summary.textContent = note.summary;
        content.append(heading, summary);
        const time = document.createElement("time");
        time.dateTime = note.date;
        time.textContent = note.date;
        entry.append(content, time);
        entries.append(entry);
      }
      journalEntries.replaceChildren(entries);
      newer.disabled = currentPage === 1;
      older.disabled = currentPage === pageCount;
      status.textContent = `Page ${currentPage} of ${pageCount} / ${notes.length} notes`;
    }
    function changePage(delta) {
      currentPage = Math.max(1, Math.min(pageCount, currentPage + delta));
      const url = new URL(location.href);
      if (currentPage === 1) url.searchParams.delete("notes-page");
      else url.searchParams.set("notes-page", currentPage);
      url.hash = "journal";
      history.replaceState(null, "", url);
      renderPage();
      // Keep keyboard focus on an enabled control at the first/last page.
      if (document.activeElement === newer && newer.disabled) older.focus({preventScroll: true});
      if (document.activeElement === older && older.disabled) newer.focus({preventScroll: true});
      document.getElementById("journal").scrollIntoView({block: "start"});
    }
    newer.addEventListener("click", () => changePage(-1));
    older.addEventListener("click", () => changePage(1));
    renderPage();
  })
  .catch(() => {
    journalEntries.textContent = "Notes are temporarily unavailable. Please try again later.";
  });
