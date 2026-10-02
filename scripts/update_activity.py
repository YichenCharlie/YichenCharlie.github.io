"""Download public activity to a static JSON file. No cookies or tokens required."""
import json
import re
import sys
from datetime import date, datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "activity.json"
GITHUB_USER = "YichenCharlie"
LEETCODE_USER = "charlieyichen"


def request(url, payload=None):
    headers = {"User-Agent": "Mozilla/5.0 (compatible; PersonalWebsite/1.0)", "Accept-Language": "en-US,en;q=0.9"}
    body = None
    if payload is not None:
        headers.update({"Content-Type": "application/json", "Referer": "https://leetcode.com/"})
        body = json.dumps(payload).encode()
    with urlopen(Request(url, data=body, headers=headers), timeout=45) as response:
        return response.read().decode("utf-8")


class ContributionParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.cells = {}
        self.tooltips = {}
        self.tooltip = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "data-date" in attrs and "data-level" in attrs:
            self.cells[attrs["data-date"]] = {
                "date": attrs["data-date"], "level": int(attrs["data-level"]),
                "id": attrs.get("id"), "count": attrs.get("data-count"),
            }
        if tag == "tool-tip":
            self.tooltip = attrs.get("for")
            self.tooltips[self.tooltip] = ""

    def handle_data(self, data):
        if self.tooltip is not None:
            self.tooltips[self.tooltip] += data

    def handle_endtag(self, tag):
        if tag == "tool-tip":
            self.tooltip = None


def github(start, end):
    parser = ContributionParser()
    for year in range(start.year, end.year + 1):
        first = max(start, date(year, 1, 1))
        last = min(end, date(year, 12, 31))
        query = urlencode({"from": first.isoformat(), "to": last.isoformat()})
        parser.feed(request(f"https://github.com/users/{GITHUB_USER}/contributions?{query}"))
    days = []
    for day_date, cell in sorted(parser.cells.items()):
        if not start.isoformat() <= day_date <= end.isoformat():
            continue
        if cell["count"] is not None:
            count = int(cell["count"])
        else:
            tooltip = parser.tooltips.get(cell["id"], "")
            match = re.search(r"\b(No|[\d,]+) contributions?\b", tooltip, re.I)
            if not match:
                raise ValueError(f"GitHub count missing for {day_date}; refusing to invent data")
            count = 0 if match[1].lower() == "no" else int(match[1].replace(",", ""))
        days.append({"date": day_date, "count": count, "level": cell["level"]})
    if len(days) != (end - start).days + 1:
        raise ValueError(f"Incomplete GitHub calendar: {len(days)} days")
    return days


def leetcode(start, end):
    counts = {}
    query = """query Calendar($username: String!, $year: Int!) {
      matchedUser(username: $username) {
        userCalendar(year: $year) { submissionCalendar }
      }
    }"""
    for year in range(start.year, end.year + 1):
        result = json.loads(request("https://leetcode.com/graphql/", {
            "query": query, "variables": {"username": LEETCODE_USER, "year": year},
        }))
        if result.get("errors") or not result.get("data", {}).get("matchedUser"):
            raise ValueError("LeetCode calendar unavailable")
        raw = result["data"]["matchedUser"]["userCalendar"]["submissionCalendar"]
        calendar = json.loads(raw)
        if not isinstance(calendar, dict):
            raise ValueError("Unexpected LeetCode calendar format")
        for timestamp, count in calendar.items():
            day = datetime.fromtimestamp(int(timestamp), timezone.utc).date().isoformat()
            counts[day] = int(count)
    days = []
    for offset in range((end - start).days + 1):
        date = (start + timedelta(days=offset)).isoformat()
        count = counts.get(date, 0)
        if count < 0:
            raise ValueError("Negative submission count")
        level = 0 if count == 0 else 1 if count <= 2 else 2 if count <= 5 else 3 if count <= 9 else 4
        days.append({"date": date, "count": count, "level": level})
    return days


def main():
    now = datetime.now(timezone.utc)
    end = now.date()
    start = end - timedelta(days=364)
    existing = json.loads(OUTPUT.read_text(encoding="utf-8")) if OUTPUT.exists() else {}
    failures = []
    for platform, fetcher, username in [("github", github, GITHUB_USER), ("leetcode", leetcode, LEETCODE_USER)]:
        try:
            days = fetcher(start, end)
            existing[platform] = {"username": username, "updatedAt": now.isoformat(), "days": days}
            print(f"{platform}: {len(days)} days, {sum(day['count'] for day in days)} activities")
        except Exception as error:
            failures.append(platform)
            print(f"WARNING: {platform}: {error}. Keeping the last successful snapshot.", file=sys.stderr)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temporary = OUTPUT.with_suffix(".tmp")
    temporary.write_text(json.dumps(existing, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    temporary.replace(OUTPUT)
    if failures:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
