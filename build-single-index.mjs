import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(root, "index.html");

function decodeEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"'
  };

  return value.replace(/&(#(?:x[\da-f]+|\d+)|amp|apos|gt|lt|nbsp|quot);/gi, (match, entity) => {
    if (entity[0] !== "#") {
      return named[entity.toLowerCase()] ?? match;
    }

    const number = entity[1].toLowerCase() === "x"
      ? Number.parseInt(entity.slice(2), 16)
      : Number.parseInt(entity.slice(1), 10);
    return Number.isFinite(number) ? String.fromCodePoint(number) : match;
  });
}

function getTitle(html, filePath) {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1];
  return title
    ? decodeEntities(title.replace(/<[^>]*>/g, "").trim())
    : path.basename(filePath, ".html");
}

function getCategory(filePath) {
  if (filePath === "index.html") {
    return "Trang chủ";
  }

  const segments = filePath.split("/");
  if (segments.length === 1) {
    return "Trang gốc";
  }

  return ["pages", "sections"].includes(segments[0]) ? segments[1] : segments[0];
}

async function findHtmlFiles(directory, relativeDirectory = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const relativePath = relativeDirectory
      ? path.posix.join(relativeDirectory, entry.name)
      : entry.name;
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await findHtmlFiles(absolutePath, relativePath));
    } else if (
      entry.isFile() &&
      /\.html?$/i.test(entry.name) &&
      relativePath !== "index.html" &&
      relativePath !== "index.source.html"
    ) {
      files.push(relativePath);
    }
  }

  return files;
}

async function createPage(filePath, sourcePath = filePath) {
  const html = await readFile(path.join(root, sourcePath), "utf8");

  return {
    path: filePath,
    title: getTitle(html, filePath),
    category: getCategory(filePath),
    content: html
  };
}

const pagePaths = await findHtmlFiles(root);
const pages = await Promise.all([
  createPage("index.html", "index.source.html"),
  ...pagePaths.map((filePath) => createPage(filePath))
]);
pages.sort((left, right) => {
  if (left.path === "index.html") return -1;
  if (right.path === "index.html") return 1;
  return left.path.localeCompare(right.path, "vi");
});

const template = String.raw`<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#102a43">
  <title>Thư viện UnityVina Care</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #172b4d;
      background: #f3f6fa;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      --navy: #102a43;
      --blue: #1769aa;
      --muted: #627d98;
      --border: #d9e2ec;
    }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; }
    button, input, select { font: inherit; }
    .topbar {
      min-height: 76px;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      color: #fff;
      background: linear-gradient(115deg, #102a43, #1769aa);
      box-shadow: 0 4px 16px #102a4329;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-mark {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border: 1px solid #ffffff55;
      border-radius: 13px;
      background: #ffffff19;
      font-size: 22px;
    }
    .brand h1 { margin: 0; font-size: 18px; letter-spacing: .01em; }
    .brand p { margin: 3px 0 0; color: #d9eafd; font-size: 12px; }
    .total {
      padding: 8px 12px;
      border: 1px solid #ffffff55;
      border-radius: 999px;
      color: #fff;
      font-size: 13px;
      white-space: nowrap;
    }
    .layout { min-height: calc(100vh - 76px); display: grid; grid-template-columns: 310px minmax(0, 1fr); }
    .sidebar {
      min-height: 0;
      padding: 20px 14px;
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border);
      background: #fff;
    }
    .filters { display: grid; gap: 10px; padding: 0 4px 14px; }
    .filters label { color: var(--muted); font-size: 12px; font-weight: 700; }
    .search, .category {
      width: 100%;
      min-height: 42px;
      padding: 9px 11px;
      border: 1px solid var(--border);
      border-radius: 9px;
      outline: none;
      background: #fff;
      color: var(--navy);
    }
    .search:focus, .category:focus { border-color: var(--blue); box-shadow: 0 0 0 3px #1769aa1c; }
    .list-heading {
      padding: 7px 8px;
      display: flex;
      justify-content: space-between;
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
    }
    .page-list { min-height: 0; overflow: auto; display: grid; align-content: start; gap: 4px; }
    .page-item {
      width: 100%;
      padding: 10px;
      display: grid;
      gap: 3px;
      border: 1px solid transparent;
      border-radius: 9px;
      background: transparent;
      color: var(--navy);
      text-align: left;
      cursor: pointer;
    }
    .page-item:hover { background: #f3f8fc; }
    .page-item[aria-current="page"] { border-color: #b8d7f0; background: #eaf4fc; }
    .page-item strong { overflow: hidden; font-size: 13px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
    .page-item small { overflow: hidden; color: var(--muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
    .empty-list { padding: 18px 10px; color: var(--muted); font-size: 13px; text-align: center; }
    main { min-width: 0; min-height: 0; padding: 24px; }
    .welcome {
      max-width: 1100px;
      margin: 0 auto;
      padding: clamp(24px, 5vw, 56px);
      border: 1px solid var(--border);
      border-radius: 18px;
      background: #fff;
      box-shadow: 0 12px 40px #102a430c;
    }
    .eyebrow { color: var(--blue); font-size: 12px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
    .welcome h2 { margin: 10px 0; color: var(--navy); font-size: clamp(25px, 4vw, 38px); line-height: 1.18; }
    .welcome > p { max-width: 680px; color: var(--muted); line-height: 1.7; }
    .welcome-grid { margin-top: 28px; display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
    .category-card {
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: #fbfdff;
      color: var(--navy);
      text-align: left;
      cursor: pointer;
    }
    .category-card:hover { border-color: #90bce0; background: #f2f8fd; }
    .category-card strong, .category-card span { display: block; }
    .category-card strong { font-size: 14px; }
    .category-card span { margin-top: 5px; color: var(--muted); font-size: 12px; }
    .viewer { display: none; height: calc(100vh - 124px); min-height: 520px; flex-direction: column; }
    .viewer.active { display: flex; }
    .viewer-head {
      min-height: 60px;
      padding: 7px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      border: 1px solid var(--border);
      border-bottom: 0;
      border-radius: 12px 12px 0 0;
      background: #fff;
    }
    .viewer-title { min-width: 0; }
    .viewer-title h2 { overflow: hidden; margin: 0; color: var(--navy); font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
    .viewer-title p { overflow: hidden; margin: 3px 0 0; color: var(--muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
    .back-button {
      flex: 0 0 auto;
      padding: 8px 11px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #fff;
      color: var(--navy);
      cursor: pointer;
    }
    .back-button:hover { border-color: #90bce0; background: #f2f8fd; }
    .content-frame { width: 100%; min-height: 0; flex: 1; border: 1px solid var(--border); border-radius: 0 0 12px 12px; background: #fff; }
    @media (max-width: 760px) {
      .topbar { min-height: 68px; padding: 12px 15px; }
      .brand p { max-width: 54vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .layout { min-height: calc(100vh - 68px); grid-template-columns: 1fr; }
      .sidebar { max-height: 43vh; border-right: 0; border-bottom: 1px solid var(--border); }
      .page-list { max-height: 22vh; }
      main { padding: 14px; }
      .viewer { height: 75vh; min-height: 420px; }
      .welcome { padding: 25px 20px; }
    }
    @media (prefers-reduced-motion: no-preference) {
      .page-item, .category-card, .back-button { transition: background .15s ease, border-color .15s ease; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <div class="brand-mark" aria-hidden="true">✚</div>
      <div>
        <h1>UnityVina Care</h1>
        <p>Thư viện nội dung và trang HTML</p>
      </div>
    </div>
    <div class="total" id="total-count" aria-live="polite"></div>
  </header>
  <div class="layout">
    <aside class="sidebar" aria-label="Danh sách trang">
      <div class="filters">
        <label for="search">Tìm nhanh</label>
        <input class="search" id="search" type="search" placeholder="Tên trang hoặc đường dẫn..." autocomplete="off">
        <label for="category">Danh mục</label>
        <select class="category" id="category">
          <option value="">Tất cả danh mục</option>
        </select>
      </div>
      <div class="list-heading"><span>Danh sách trang</span><span id="visible-count"></span></div>
      <nav class="page-list" id="page-list" aria-label="Các trang được nhúng"></nav>
    </aside>
    <main>
      <section class="welcome" id="welcome">
        <div class="eyebrow">Một tệp · Toàn bộ nội dung</div>
        <h2>Mở và tìm kiếm tất cả trang tại đây</h2>
        <p>Nội dung HTML đã được đóng gói trực tiếp vào tệp này. Chọn một trang ở danh sách bên trái hoặc lọc theo danh mục; không cần mở từng tệp riêng.</p>
        <div class="welcome-grid" id="welcome-grid"></div>
      </section>
      <section class="viewer" id="viewer" aria-label="Nội dung trang">
        <div class="viewer-head">
          <div class="viewer-title">
            <h2 id="current-title"></h2>
            <p id="current-path"></p>
          </div>
          <button class="back-button" id="back-button" type="button">← Danh sách</button>
        </div>
        <iframe class="content-frame" id="content-frame" title="Nội dung trang được chọn"></iframe>
      </section>
    </main>
  </div>
  <script>
    const PAGES = __PAGE_DATA__;
    const PAGE_MAP = new Map(PAGES.map((page) => [page.path, page]));
    const VIRTUAL_ORIGIN = "https://single-index.invalid/";
    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("category");
    const pageList = document.getElementById("page-list");
    const visibleCount = document.getElementById("visible-count");
    const welcome = document.getElementById("welcome");
    const welcomeGrid = document.getElementById("welcome-grid");
    const viewer = document.getElementById("viewer");
    const frame = document.getElementById("content-frame");
    let activePath = "";

    function getRoute() {
      const params = new URLSearchParams(location.hash.slice(1));
      return {
        path: params.get("page") || "",
        anchor: params.get("anchor") || ""
      };
    }

    function setRoute(path, anchor) {
      if (!path) {
        if (location.hash) {
          location.hash = "";
        } else {
          showWelcome();
        }
        return;
      }

      const params = new URLSearchParams();
      params.set("page", path);
      if (anchor) params.set("anchor", anchor);
      location.hash = params.toString();
    }

    function addOption(select, value, label) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    }

    function createPageButton(page) {
      const button = document.createElement("button");
      button.className = "page-item";
      button.type = "button";
      button.dataset.path = page.path;
      button.innerHTML = "<strong></strong><small></small>";
      button.querySelector("strong").textContent = page.title || page.path;
      button.querySelector("small").textContent = page.path;
      button.addEventListener("click", () => setRoute(page.path));
      return button;
    }

    function renderList() {
      const query = searchInput.value.trim().toLocaleLowerCase("vi");
      const category = categorySelect.value;
      const results = PAGES.filter((page) => {
        const matchesCategory = !category || page.category === category;
        const matchesQuery = !query ||
          page.title.toLocaleLowerCase("vi").includes(query) ||
          page.path.toLocaleLowerCase("vi").includes(query);
        return matchesCategory && matchesQuery;
      });

      pageList.replaceChildren(...results.map(createPageButton));
      visibleCount.textContent = results.length + " / " + PAGES.length;
      if (!results.length) {
        const empty = document.createElement("div");
        empty.className = "empty-list";
        empty.textContent = "Không tìm thấy trang phù hợp.";
        pageList.append(empty);
      }

      for (const button of pageList.querySelectorAll(".page-item")) {
        if (button.dataset.path === activePath) button.setAttribute("aria-current", "page");
      }
    }

    function openPage(page, anchor) {
      activePath = page.path;
      welcome.hidden = true;
      viewer.classList.add("active");
      document.getElementById("current-title").textContent = page.title || page.path;
      document.getElementById("current-path").textContent = page.path;
      frame.title = page.title || page.path;
      frame.srcdoc = page.content;
      renderList();

      if (anchor) {
        frame.addEventListener("load", function scrollToAnchor() {
          frame.removeEventListener("load", scrollToAnchor);
          try {
            frame.contentWindow.location.hash = anchor;
          } catch (error) {
            console.error("Không thể mở vị trí trong trang:", error);
          }
        });
      }
    }

    function showWelcome() {
      activePath = "";
      viewer.classList.remove("active");
      welcome.hidden = false;
      frame.removeAttribute("srcdoc");
      renderList();
    }

    function syncRoute() {
      const route = getRoute();
      const page = PAGE_MAP.get(route.path);
      if (page) {
        openPage(page, route.anchor);
      } else {
        showWelcome();
      }
    }

    const categories = [...new Set(PAGES.map((page) => page.category))]
      .sort((left, right) => left.localeCompare(right, "vi"));
    for (const category of categories) {
      const count = PAGES.filter((page) => page.category === category).length;
      addOption(categorySelect, category, category + " (" + count + ")");
      const card = document.createElement("button");
      card.className = "category-card";
      card.type = "button";
      card.innerHTML = "<strong></strong><span></span>";
      card.querySelector("strong").textContent = category;
      card.querySelector("span").textContent = count + " trang";
      card.addEventListener("click", () => {
        categorySelect.value = category;
        renderList();
        searchInput.focus();
      });
      welcomeGrid.append(card);
    }

    document.getElementById("total-count").textContent = PAGES.length + " trang đã nhúng";
    searchInput.addEventListener("input", renderList);
    categorySelect.addEventListener("change", renderList);
    document.getElementById("back-button").addEventListener("click", () => setRoute(""));
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);

    frame.addEventListener("load", () => {
      try {
        const documentInFrame = frame.contentDocument;
        if (!documentInFrame) return;

        documentInFrame.addEventListener("click", (event) => {
          const anchor = event.target.closest("a[href]");
          if (!anchor) return;
          const href = anchor.getAttribute("href");
          if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return;

          let target;
          try {
            const basePath = activePath.split("/").map(encodeURIComponent).join("/");
            target = new URL(href, VIRTUAL_ORIGIN + basePath);
          } catch {
            return;
          }
          if (target.origin !== "https://single-index.invalid") return;

          let targetPath;
          try {
            targetPath = decodeURIComponent(target.pathname.replace(/^\//, ""));
          } catch {
            return;
          }
          const candidates = targetPath.endsWith("/")
            ? [targetPath + "index.html"]
            : [targetPath, targetPath + "/index.html"];
          const targetPage = candidates.map((candidate) => PAGE_MAP.get(candidate)).find(Boolean);
          if (!targetPage) return;

          event.preventDefault();
          setRoute(targetPage.path, target.hash.slice(1));
        }, true);
      } catch (error) {
        console.error("Không thể xử lý liên kết trong trang:", error);
      }
    });

    renderList();
    syncRoute();
  </script>
</body>
</html>
`;

const pageData = JSON.stringify(pages)
  .replace(/</g, "\\u003c")
  .replace(/\u2028/g, "\\u2028")
  .replace(/\u2029/g, "\\u2029");
const output = template.replace("__PAGE_DATA__", pageData);
await writeFile(outputPath, output, "utf8");
console.log(`Created ${path.relative(root, outputPath)} with ${pages.length} pages (${Buffer.byteLength(output)} bytes).`);
