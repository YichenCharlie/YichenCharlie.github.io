"""Regression checks for date boundaries, parsing and failed-refresh preservation."""
import importlib.util
import json
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("activity", Path(__file__).with_name("update_activity.py"))
activity = importlib.util.module_from_spec(spec)
spec.loader.exec_module(activity)


class ActivityTests(unittest.TestCase):
    def test_github_crosses_year_and_parses_nested_tooltips(self):
        documents = [
            '<td id="a" data-date="2025-12-31" data-level="2"></td><tool-tip for="a"><b>1,234 contributions</b> on December 31.</tool-tip>',
            '<td id="b" data-date="2026-01-01" data-level="0"></td><tool-tip for="b">No contributions on January 1.</tool-tip>',
        ]
        with patch.object(activity, "request", side_effect=documents) as request:
            days = activity.github(date(2025, 12, 31), date(2026, 1, 1))
        self.assertEqual([day["count"] for day in days], [1234, 0])
        self.assertEqual(request.call_count, 2)

    def test_github_rejects_unknown_counts(self):
        with patch.object(activity, "request", return_value='<td data-date="2026-01-01" data-level="2"></td>'):
            with self.assertRaises(ValueError):
                activity.github(date(2026, 1, 1), date(2026, 1, 1))

    def test_leetcode_utc_dates_and_zero_days(self):
        response = {"data": {"matchedUser": {"userCalendar": {"submissionCalendar": json.dumps({"1767225600": 3})}}}}
        with patch.object(activity, "request", return_value=json.dumps(response)):
            days = activity.leetcode(date(2026, 1, 1), date(2026, 1, 2))
        self.assertEqual(days, [{"date": "2026-01-01", "count": 3, "level": 2}, {"date": "2026-01-02", "count": 0, "level": 0}])

    def test_failure_preserves_previous_platform_snapshot(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "activity.json"
            old = {"github": {"updatedAt": "2025-01-01", "days": [{"date": "2025-01-01", "count": 7, "level": 3}]}}
            output.write_text(json.dumps(old), encoding="utf-8")
            with patch.object(activity, "OUTPUT", output), patch.object(activity, "github", side_effect=ValueError("Unavailable")), patch.object(activity, "leetcode", return_value=[{"date": "2026-01-01", "count": 1, "level": 1}]):
                self.assertEqual(activity.main(), 1)
            result = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(result["github"], old["github"])
            self.assertEqual(result["leetcode"]["days"][0]["count"], 1)


if __name__ == "__main__":
    unittest.main()
