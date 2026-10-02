# Yichen's space

An English personal website inspired by early profile pages and forums. Plain HTML, CSS and JavaScript, with a Python Markdown builder for journal entries; no browser-side API keys.

## Preview locally

首次使用 Markdown 随笔功能，安装依赖：`python -m pip install -r requirements.txt`。每次修改文章后先运行 `python scripts/build_notes.py`，再打开下面的预览。

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000. Serve over HTTP; opening the HTML as a local file may prevent the activity JSON from loading.

## Files

- `index.html`: profile, education, GitHub projects and an empty journal section, calendars.
- `assets/style.css`: responsive retro layout.
- `assets/site.js`: two full-width activity heatmaps, stacked vertically and visible together.
- `assets/rice.png`, `assets/smu.png`: official university logos; attribution in `credits.html`.
- `data/activity.json`: real, dated public activity snapshots.
- `scripts/update_activity.py`: standard-library Python collector.
- `.github/workflows/pages.yml`: daily data refresh and GitHub Pages deployment.
- `posts/`: write journal entries as Markdown; see `posts/README.md` for instructions.
- `posts/_template.md`: copy this draft template to start a new note.
- `scripts/build_notes.py`: generates `notes/<filename>/index.html` and `data/notes.json`.

## 编辑 Notes from my desk

复制 `posts/_template.md` 为 `posts/my-first-note.md`，填写标题、日期和摘要，然后写 Markdown 正文。准备发布时设 `draft: false`；推送后 Actions 自动生成文章页和首页列表，按日期从新到旧排列。草稿和模板不会发布到网站。草稿源文件若提交到公开仓库，仍可在 GitHub 上查看。

本地修改后运行 `python scripts/build_notes.py` 并刷新网站。生成的 `notes/` 不需要手动编辑或提交。此功能的自动发布需要使用本项目的 GitHub Actions 工作流，而非只从分支直接发布静态文件。

## Education and unfinished content

Only the education section of the supplied CV was used. Rice MECE is explicitly **incoming Spring 2027**. The original PDF is not copied into this repository or published. The contact email is `yf55@rice.edu`. Biography, portrait, journal entries and downloadable résumé remain unfilled. Update the relevant sections of `index.html` when those details are ready. The `yichen.space` masthead is a site title, not a configured custom domain.

## Activity

```powershell
python scripts/update_activity.py
```

GitHub: `YichenCharlie`. LeetCode international: `charlieyichen`.

The collector reads GitHub's public contribution HTML and LeetCode's public GraphQL calendar. Neither is a guaranteed stable public API; upstream changes may require collector updates. No password, session cookie, or personal access token is needed. It fetches both calendar years when the rolling 365-day window crosses January. GitHub counts come from the actual calendar tooltips. LeetCode counts are submissions, **not solved-problem counts**. UTC dates are used for the snapshot window and LeetCode timestamps.

Each platform refreshes independently. Failure preserves that platform's last successful snapshot and returns a nonzero exit code; it never manufactures activity. The workflow warns but can still deploy with cached snapshots. The UI displays the snapshot timestamp and marks snapshots older than three days. Calendar cells expose dates and counts on hover and to assistive technology. Both platforms are visible together; each calendar can be scrolled horizontally when needed.

## 编辑旅行地图（不用改代码）

主页的 **Beyond the screen** 窗口和 **Travel** 导航都能进入旅行页面。
中国地图按省级区域标记，世界地图按国家或地区标记。初始记录是上海和中国。

1. 启动上面的本地预览服务，打开 http://127.0.0.1:8000/travel.html?edit=1 。
2. 点击地图上的区域切换标记；小地区可展开 **Select places from a list**，搜索中文或英文名称并勾选。
3. 点击 **Download travel.json** 下载记录，将文件替换到项目的 `data/travel.json`。
4. 刷新普通旅行页面 http://127.0.0.1:8000/travel.html 检查效果。提交并推送项目后，线上网站才会更新。

编辑模式只改变当前页面的预览，不会自动修改项目或线上数据。**Reset to saved places** 恢复打开页面时的记录；**Import travel.json** 可载入之前下载的文件继续编辑。中国地图和世界地图各自独立维护。

也可以直接修改 `data/travel.json`：`china` 列表保存省级行政区代码字符串（上海为 `"310000"`），`world` 列表保存地图数据的 ADM0_A3 标识（中国为 `"CHN"`）。编辑器负责生成正确代码，无需手动查找。

地图数据在 `data/maps/`，随网站一起提供，不依赖访客访问外部地图服务。来源与说明见 `credits.html`。世界小比例尺地图可能省略部分很小的岛屿和地区。

## Publishing to GitHub Pages

1. Review the site locally, then commit and push to `main` when ready.
2. In the repository's **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
3. Run **Refresh activity and deploy Pages** from the Actions tab, or let the next push trigger it.

The workflow deploys only HTML, assets, and activity JSON. It refreshes daily at 02:23 UTC (10:23 China time), as well as on pushes and manual runs. GitHub may delay scheduled workflows or disable schedules on inactive repositories; check Actions if a snapshot is old. Existing branch-based Pages can serve the checked-in site, but automatic daily updates require the Actions deployment above. No remote changes are made just by editing or previewing locally.

Project cards summarize the public READMEs of `llm-serving-benchmark` and `financial-text-inference` as reviewed on October 2, 2026. They are static editorial summaries, not an automatic repository feed. Update `index.html` as the projects develop. The Resume button is intentionally disabled until a public file is ready; replace it with an anchor pointing to that file when publishing it. Interests are Travel and Gaming; location is Shanghai.
