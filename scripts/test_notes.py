import json
import tempfile
import unittest
from pathlib import Path

from build_notes import build


class NotesTests(unittest.TestCase):
    def test_publish_sort_draft_and_remove(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            posts = root / "posts"
            posts.mkdir()
            def write(name, date="2026-10-02", draft="false"):
                (posts / name).write_text(f'---\ntitle: A <test>\ndate: {date}\nsummary: Learning notes\ndraft: {draft}\n---\n\n## Heading\n\n**Bold** and 中文\n\n```python\nprint(1)\n```\n', encoding="utf-8")
            write("first.md", "2026-10-01")
            write("second.md")
            write("private.md", draft="true")
            write("_template.md")
            build(root)
            entries = json.loads((root / "data/notes.json").read_text(encoding="utf-8"))
            self.assertEqual([entry["url"] for entry in entries], ["notes/second/", "notes/first/"])
            output = (root / "notes/second/index.html").read_text(encoding="utf-8")
            for expected in ["A &lt;test&gt;", "<h2>Heading</h2>", "<strong>Bold</strong>", "language-python", "中文", "../../assets/style.css"]:
                self.assertIn(expected, output)
            self.assertFalse((root / "notes/private").exists())
            write("second.md", draft="true")
            (posts / "first.md").unlink()
            build(root)
            self.assertEqual(json.loads((root / "data/notes.json").read_text()), [])
            self.assertFalse((root / "notes/second/index.html").exists())

    def test_bad_metadata_does_not_replace_previous_build(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "posts").mkdir()
            build(root)
            (root / "posts/bad.md").write_text("---\ntitle: Test\ndate: invalid\nsummary: Test\ndraft: false\n---\nText")
            with self.assertRaises(ValueError):
                build(root)
            self.assertEqual(json.loads((root / "data/notes.json").read_text()), [])


if __name__ == "__main__":
    unittest.main()
