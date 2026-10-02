"use strict";

document.getElementById("year").textContent = new Date().getFullYear();
function showRecentActivity() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.activity-panel .chart-scroll').forEach(chart => {
      chart.scrollLeft = chart.scrollWidth;
    });
  });
}
window.addEventListener("resize", showRecentActivity);
function renderCalendar(platform, data) {
  const chart = document.getElementById(`${platform}-chart`);
  const summary = document.getElementById(`${platform}-summary`);
  if (!data || !Array.isArray(data.days) || !data.days.length) {
    summary.textContent = "Activity is temporarily unavailable.";
    const message = document.createElement("p");
    message.className = "chart-message";
    message.textContent = "The calendar will return after the next update. You can still visit my profile above.";
    chart.replaceChildren(message);
    return;
  }
  const days = [...data.days].sort((a, b) => a.date.localeCompare(b.date));
  const unit = platform === "github" ? "contributions" : "submissions";
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const activeDays = days.filter(day => day.count > 0).length;
  summary.textContent = `${total.toLocaleString("en-US")} ${unit} · ${activeDays} active days`;
  const grid = document.createElement("div");
  grid.className = "heatmap";
  const offset = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const padded = [...Array(offset).fill(null), ...days];
  let lastMonth = -1;
  const weeks = Math.ceil(padded.length / 7);
  for (let week = 0; week < weeks; week++) {
    const weekDays = padded.slice(week * 7, week * 7 + 7);
    const first = weekDays.find(Boolean);
    const label = document.createElement("span");
    label.className = "month";
    if (first) {
      const date = new Date(`${first.date}T00:00:00Z`);
      const month = date.getUTCMonth();
      if (month !== lastMonth && week < weeks - 2) {
        if (week > 1 || new Date(`${days[0].date}T00:00:00Z`).getUTCDate() < 22) {
          label.textContent = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
        }
        lastMonth = month;
      }
    }
    grid.append(label);
    for (let row = 0; row < 7; row++) {
      const day = weekDays[row];
      const cell = document.createElement("span");
      cell.className = day ? "day" : "day pad";
      if (day) {
        cell.dataset.level = Math.max(0, Math.min(4, day.level));
        cell.title = `${day.date}: ${day.count} ${unit}`;
        cell.setAttribute("aria-label", cell.title);
        cell.setAttribute("role", "img");
      } else { cell.setAttribute("aria-hidden", "true"); }
      grid.append(cell);
    }
  }
  for (const [label, className] of [["Mon", "mon"], ["Wed", "wed"], ["Fri", "fri"]]) {
    const dayLabel = document.createElement("span");
    dayLabel.className = `weekday ${className}`;
    dayLabel.textContent = label;
    dayLabel.setAttribute("aria-hidden", "true");
    grid.append(dayLabel);
  }
  chart.replaceChildren(grid);
  showRecentActivity();
  const updated = new Date(data.updatedAt);
  const formatted = updated.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const stale = Date.now() - updated.getTime() > 3 * 86400000;
  document.getElementById(`${platform}-updated`).textContent = `${stale ? "Last available snapshot" : "Updated"} ${formatted} · UTC`;
}

fetch("data/activity.json", { cache: "no-cache" })
  .then(response => { if (!response.ok) throw new Error("Activity unavailable"); return response.json(); })
  .then(data => { renderCalendar("github", data.github); renderCalendar("leetcode", data.leetcode); })
  .catch(() => { renderCalendar("github", null); renderCalendar("leetcode", null); });
