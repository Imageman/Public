/* Browser/Node search index. Snowball must be loaded first. */
(function (root) {
  "use strict";
  const factory = typeof module === "object" && module.exports
    ? require("./snowball.babel.min.js") : root.snowballFactory;
  const stemmers = { ru: factory.newStemmer("russian"), en: factory.newStemmer("english") };
  const stop = new Set(("и в во на с со к по из у о об от до за для не но или а это как что при без под над " +
    "он она они вы мы его ее их себя все так также который которая которые можно есть " +
    "the a an and or of to in on for with by from is are be this that it as at your you").split(/\s+/));
  const cache = new Map();
  function tokenize(text) {
    return (String(text || "").toLowerCase().replace(/ё/g, "е").match(/[a-zа-я0-9]+/g) || [])
      .filter(word => word.length >= 2 && !stop.has(word)).map(word => {
        if (!cache.has(word)) {
          let stem = /^[а-я]+$/.test(word) ? stemmers.ru.stem(word)
            : /^[a-z]+$/.test(word) ? stemmers.en.stem(word) : word;
          // Small, explicit bilingual synonym dictionary, applied on both sides.
          if (stem === "antivirus") stem = "антивирус";
          cache.set(word, stem);
        }
        return cache.get(word);
      }).filter(Boolean);
  }
  function grams(word) {
    const result = new Set();
    for (const n of [3, 4]) for (let i = 0; i <= word.length - n; i++) result.add(word.slice(i, i + n));
    return result;
  }
  class BookmarkSearch {
    constructor(rows) {
      this.rows = rows;
      this.fields = { title: 2.5, tags: 3, description: 1, url: 0.25 };
      this.postings = new Map();
      this.documents = new Map();
      this.averages = {};
      for (const field of Object.keys(this.fields)) this.averages[field] = 0;
      for (const row of rows) {
        const doc = {};
        for (const field of Object.keys(this.fields)) {
          const tokens = tokenize(row[field]);
          const counts = new Map();
          for (const token of tokens) counts.set(token, (counts.get(token) || 0) + 1);
          doc[field] = { length: tokens.length, counts };
          this.averages[field] += tokens.length;
          for (const [term, tf] of counts) {
            if (!this.postings.has(term)) this.postings.set(term, new Map());
            const posting = this.postings.get(term);
            if (!posting.has(row.id)) posting.set(row.id, {});
            posting.get(row.id)[field] = tf;
          }
        }
        this.documents.set(row.id, { row, fields: doc });
      }
      for (const field of Object.keys(this.fields)) this.averages[field] = this.averages[field] / (rows.length || 1) || 1;
      this.gramIndex = new Map();
      this.termGrams = new Map();
      for (const term of this.postings.keys()) {
        if (term.length < 5) continue;
        const parts = grams(term);
        this.termGrams.set(term, parts);
        for (const part of parts) {
          if (!this.gramIndex.has(part)) this.gramIndex.set(part, new Set());
          this.gramIndex.get(part).add(term);
        }
      }
      this.similarCache = new Map();
    }
    idf(term) {
      const df = this.postings.get(term)?.size || 0;
      return Math.log(1 + (this.rows.length - df + 0.5) / (df + 0.5));
    }
    expansions(term) {
      if (term.length < 5) return [];
      const parts = grams(term), overlaps = new Map();
      for (const part of parts) for (const other of this.gramIndex.get(part) || []) {
        if (other !== term) overlaps.set(other, (overlaps.get(other) || 0) + 1);
      }
      return [...overlaps].map(([other, count]) => [other, 2 * count / (parts.size + this.termGrams.get(other).size)])
        .filter(([other, similarity]) => similarity >= 0.6 && Math.abs(other.length - term.length) <= 3)
        .sort((a, b) => b[1] - a[1]).slice(0, 3);
    }
    rank(query, excludeId, includeUrl = false) {
      const scores = new Map();
      const add = (term, weight) => {
        for (const [id, frequencies] of this.postings.get(term) || []) {
          if (id === excludeId) continue;
          const doc = this.documents.get(id);
          let tf = 0;
          for (const [field, count] of Object.entries(frequencies)) {
            if (field === "url" && !includeUrl) continue;
            tf += this.fields[field] * count / (0.25 + 0.75 * doc.fields[field].length / this.averages[field]);
          }
          if (tf) scores.set(id, (scores.get(id) || 0) + weight * this.idf(term) * tf * 2.2 / (tf + 1.2));
        }
      };
      for (const [term, weight] of query) {
        add(term, weight);
        for (const [other, similarity] of this.expansions(term)) {
          if (!query.has(other)) add(other, weight * 0.12 * similarity);
        }
      }
      return [...scores].sort((a, b) => b[1] - a[1] || a[0] - b[0])
        .map(([id, score]) => ({ item: this.documents.get(id).row, score }));
    }
    search(text) {
      // Preserve literal URL lookup without matching every document on https/com.
      const literal = String(text).trim().toLowerCase();
      if (/https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,}(?:\/|$)/i.test(literal)) {
        return this.rows.filter(row => row.url.toLowerCase().includes(literal)).map(item => ({ item, score: 1 }));
      }
      const words = [...new Set((literal.replace(/ё/g, "е").match(/[a-zа-я0-9]+/g) || [])
        .filter(word => word.length >= 2 && !stop.has(word)))];
      // Union literal and morphological matches per word, intersect across words.
      // Each group is independent of the other query words (monotone AND).
      let candidates = null;
      for (const word of words) {
        const matches = new Map();
        for (const result of this.rank(new Map(tokenize(word).map(term => [term, 1])), undefined, true)) {
          // Bounded BM25 contribution keeps morphology below a literal match.
          matches.set(result.item.id, result.score / (1 + result.score));
        }
        for (const row of this.rows) {
          let literalScore = 0;
          for (const [field, weight] of Object.entries(this.fields)) {
            if (String(row[field] || "").toLowerCase().replace(/ё/g, "е").includes(word)) {
              literalScore += 10 * weight;
            }
          }
          if (literalScore) matches.set(row.id, (matches.get(row.id) || 0) + literalScore);
        }
        candidates = candidates === null ? matches : new Map([...candidates]
          .filter(([id]) => matches.has(id)).map(([id, score]) => [id, score + matches.get(id)]));
        if (!candidates.size) return [];
      }
      return [...(candidates || [])].sort((a, b) => b[1] - a[1] || a[0] - b[0])
        .map(([id, score]) => ({ item: this.documents.get(id).row, score }));
    }
    similar(row) {
      if (this.similarCache.has(row.id)) return this.similarCache.get(row.id);
      const query = new Map();
      for (const field of ["title", "tags", "description"]) {
        for (const term of new Set(tokenize(row[field]))) {
          // Unique words are useful only if a close spelling exists elsewhere.
          if ((this.postings.get(term)?.size || 0) > 1 || this.expansions(term).length) {
            query.set(term, (query.get(term) || 0) + this.fields[field]);
          }
        }
      }
      const informative = new Map([...query].sort((a, b) => b[1] * this.idf(b[0]) - a[1] * this.idf(a[0])).slice(0, 24));
      const matches = this.rank(informative, row.id).slice(0, 10);
      this.similarCache.set(row.id, matches);
      return matches;
    }
  }
  BookmarkSearch.tokenize = tokenize;
  if (typeof module === "object" && module.exports) module.exports = BookmarkSearch;
  else root.BookmarkSearch = BookmarkSearch;
})(typeof globalThis !== "undefined" ? globalThis : this);
