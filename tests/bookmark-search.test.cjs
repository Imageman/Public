const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const Search = require("../bookmark-search.js");

assert.deepEqual(Search.tokenize("антивирусы антивирус antivirus"), Array(3).fill("антивирус"));
assert.deepEqual(Search.tokenize("connections connected connecting"), Array(3).fill("connect"));
assert.deepEqual(Search.tokenize("ёлки елки"), ["елк", "елк"]);
assert.deepEqual(Search.tokenize("и для the with"), []);

const rows = [];
vm.runInNewContext(fs.readFileSync("fill.js", "utf8"), {
  LinkT: (url, date, tags, title, description) => rows.push({ id: rows.length + 1, url, date, tags, title, description })
});
// Keep the named regression case even if the user's bookmark collection changes.
if (!rows.some(row => row.title === "DTP Craft")) {
  rows.push({ id: rows.length + 1, title: "DTP Craft", tags: "DTP,статьи", description: "", url: "http://dtpcraft.info", date: "2007.09.29" });
}
const index = new Search(rows);
assert.equal(index.search("DTP Craft")[0].item.title, "DTP Craft");
assert.match(index.search("временные ряды")[0].item.description, /Алгоритмы сравнения временных рядов/);

// Exercise the actual UI search handler with a table double.
const html = fs.readFileSync("index2.html", "utf8");
const handler = html.slice(html.indexOf("      function applySearch("), html.indexOf("      function readHashQuery("));
const ui = vm.createContext({ searchIndex: index, rows, sourceLabel: "local", search: { value: "" }, status: {}, writeHashQuery() {} });
vm.runInContext(`
  let searchRanks = new Map(), sortBeforeSearch = null;
  const table = {
    sort: [{column: "date", dir: "desc"}],
    getSorters() { return this.sort.map(s => ({field: s.column, dir: s.dir})); },
    setSort(column, dir) { this.sort = Array.isArray(column) ? column : [{column, dir}]; },
    setFilter(filter) { this.filter = filter; },
    clearFilter() { this.filter = null; }
  };
  ${handler}
`, ui);
for (const query of ["DTP Craft", "временные ряды"]) {
  ui.search.value = query;
  vm.runInContext("applySearch()", ui);
  assert.equal(vm.runInContext("table.sort[0].column", ui), "searchRank");
  const first = index.search(query)[0].item;
  ui.first = first;
  assert.equal(vm.runInContext("searchRanks.get(first.id)", ui), 0);
  assert.equal(vm.runInContext("table.filter(first)", ui), true);
}
ui.search.value = "";
vm.runInContext("applySearch()", ui);
assert.equal(vm.runInContext("table.sort[0].column", ui), "date");
assert.equal(vm.runInContext("table.sort[0].dir", ui), "desc");
assert.equal(vm.runInContext("table.filter", ui), null);
const hybrid = rows.find(row => row.url.includes("hybrid-analysis"));
const similar = index.similar(hybrid);
assert.match(similar[0].item.url, /virustotal/);
for (const name of ["Hitman", "360 Total", "Crystal Security", "AVZ"]) {
  assert(similar.some(result => result.item.title.includes(name)), name);
}
assert(!similar.some(result => result.item.id === hybrid.id));
assert.equal(new Set(similar.map(result => result.item.id)).size, similar.length);
assert(similar.length <= 10);
// Literal bonuses may change order; all morphological hits remain available.
for (const result of index.search("антивирусы")) {
  assert(index.search("антивирус").some(other => other.item.id === result.item.id));
}
assert.equal(index.search("https://www.hybrid-analysis.com/")[0].item.id, hybrid.id);
assert.deepEqual(index.search("the и"), []);
assert.deepEqual(new Search([]).search("test"), []);

const synthetic = new Search([
  { id: 1, title: "Javascript", tags: "", description: "", url: "" },
  { id: 2, title: "Javascripx", tags: "", description: "", url: "" },
  { id: 3, title: "xxx", tags: "", description: "", url: "" }
]);
assert.equal(synthetic.search("Javascript")[0].item.id, 1);
assert(synthetic.search("Javascript").some(result => result.item.id === 2));
assert.deepEqual(synthetic.search("xx").map(r => r.item.id), [3]);

const literalSearch = new Search([
  { id: 1, title: "архиватор", tags: "", description: "", url: "" },
  { id: 2, title: "архивы", tags: "", description: "", url: "" },
  { id: 3, title: "архива", tags: "красный", description: "", url: "" }
]);
const archiveResults = literalSearch.search("архива");
assert.equal(archiveResults.length, 3);
assert(archiveResults.findIndex(r => r.item.id === 1) < archiveResults.findIndex(r => r.item.id === 2));
assert.equal(new Set(archiveResults.map(r => r.item.id)).size, archiveResults.length);
assert(archiveResults.find(r => r.item.id === 3).score > archiveResults.find(r => r.item.id === 1).score);
assert.deepEqual(literalSearch.search("архива красный").map(r => r.item.id), [3]);

const conjunction = new Search([
  { id: 1, title: "cat", tags: "", description: "", url: "" },
  { id: 2, title: "cats", tags: "red", description: "", url: "" },
  { id: 3, title: "red", tags: "", description: "", url: "" },
  { id: 4, title: "Javascripx", tags: "red", description: "", url: "" }
]);
assert.deepEqual(conjunction.search("red cat").map(r => r.item.id), [2]);
assert.equal(conjunction.search("cat").length, 2);
assert.deepEqual(conjunction.search("cat unknownword"), []);
assert.deepEqual(conjunction.search("Javascript red").map(r => r.item.id), [4]);
for (const [engine, short, long] of [
  [conjunction, "cat", "red cat"],
  [conjunction, "Javascript", "Javascript red"],
  [synthetic, "Javascript", "Javascript Javascripx"],
  [index, "DTP", "DTP Craft"],
  [index, "временные", "временные ряды"]
]) {
  const ids = new Set(engine.search(short).map(r => r.item.id));
  assert(engine.search(long).every(r => ids.has(r.item.id)), `${short} -> ${long}`);
}

// Exercise the classic-script path used by file:// and static hosting.
const browser = vm.createContext({});
vm.runInContext(fs.readFileSync("snowball.babel.min.js", "utf8"), browser);
vm.runInContext(fs.readFileSync("bookmark-search.js", "utf8"), browser);
assert.equal(new browser.BookmarkSearch(rows).similar(hybrid)[0].item.id, similar[0].item.id);
for (const match of fs.readFileSync("index2.html", "utf8").matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  new vm.Script(match[1]);
}
console.log(`PASS: stemming, ranking, n-grams, URL lookup, browser exports and inline syntax (${rows.length} bookmarks).`);
