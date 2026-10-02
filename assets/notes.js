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
    const entries = document.createDocumentFragment();
    for (const note of notes) {
      if (!/^notes\/[a-z0-9-]+\/$/.test(note.url)) continue;
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
  })
  .catch(() => {
    journalEntries.textContent = "Notes are temporarily unavailable. Please try again later.";
  });
