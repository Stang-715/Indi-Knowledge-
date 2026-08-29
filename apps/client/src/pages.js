/**
 * The two doors: the Cards binder and the Books library.
 *
 * Full-screen pages, never overlay panels — the one structural rule the
 * reboot keeps absolutely. Both render fresh on every open from deck.js's
 * bookkeeping; both funnel to the same card detail with one button on it:
 * "Recite this", which hands the card to the stage and closes the page.
 */
import { allCards, allBooks, card, timesRecited, recitedCount, bookProgress,
         addUserBook, removeUserBook, levelName, cardInBooks } from './deck.js';

const $ = (id) => document.getElementById(id);

let hooks = null;  // { getLevel, setCurrentCard, getFilter, clearFilter }

/** The books the sheet on the table cares about, or null for all of them. */
const filter = () => hooks?.getFilter?.() ?? null;
const inFilter = (c) => { const f = filter(); return !f || cardInBooks(c, f.books); };

/** The one line that says a sheet is narrowing what you can see, and how to
 *  put it down again. */
function filterNote() {
  const f = filter();
  return f ? `<button class="chip chip--lens" data-clear-filter
    title="Lift the sheet and see everything again">${f.glyph} ${f.name} — showing its books only ✕</button>` : '';
}
let booksView = { tab: 'book', open: null };  // open: a book id, or null = shelf

export function initPages(h) {
  hooks = h;
  $('page-cards').addEventListener('click', onCardsClick);
  $('page-books').addEventListener('click', onBooksClick);
}

export function openCardsPage() { renderBinder(); $('page-cards').hidden = false; }
export function openBooksPage() { booksView = { tab: 'book', open: null }; renderBooks(); $('page-books').hidden = false; }

/* ── The binder ─────────────────────────────────────────────────────────── */

function renderBinder() {
  const lv = hooks.getLevel();
  const all = allCards();
  const cards = all.filter(inFilter);
  const done = recitedCount();
  const pct = Math.round((done / all.length) * 100);
  const books = new Map(allBooks().map((b) => [b.id, b]));

  $('binder-head').innerHTML = `
    <h1>The Collection</h1>
    <p class="lede">${done} of ${all.length} recited — ${pct}% of everything there is to teach.
      Locked cards open with your level; reciting is what levels you.</p>
    ${filterNote()}
    <div class="binder-books">${bookProgress()
      .filter((b) => cards.some((c) => c.book === b.id)).map((b) =>
      `<span class="chip">${b.icon} ${b.title} <b>${b.done}/${b.total}</b></span>`).join('')}</div>`;

  $('binder-grid').innerHTML = cards.map((c) => {
    const locked = c.level > lv;
    const n = timesRecited(c.id);
    if (locked) {
      return `<div class="bcard locked" title="Revealed at level ${c.level} — ${levelName(c.level)}">
        <span class="bq">?</span><span class="blv">Lv ${c.level}</span></div>`;
    }
    return `<button class="bcard ${n ? 'done' : 'fresh'}" data-card="${c.id}">
      <span class="bicon">${books.get(c.book)?.icon ?? '🃏'}</span>
      <span class="btitle">${c.title}</span>
      ${n ? `<span class="bcount">×${n}</span>` : `<span class="bnew">NEW</span>`}
    </button>`;
  }).join('');
}

function onCardsClick(e) {
  if (e.target.closest('[data-clear-filter]')) { hooks.clearFilter?.(); renderBinder(); return; }
  // The detail's own buttons are handled on the detail element itself.
  if (e.target.closest('.card-detail')) return;
  const b = e.target.closest('[data-card]');
  if (b) openDetail(b.dataset.card, 'page-cards');
}

/* ── The card detail (shared by both pages) ─────────────────────────────── */

/**
 * Open one card's full text. Exported because the stage needs it too: the
 * card slot's Read button opens exactly this, and reading a card once is
 * what unlocks reciting it. `hostId` is whichever surface it belongs to.
 */
export function openDetail(id, pageId = 'stage') {
  const c = card(id);
  if (!c) return;
  hooks?.onRead?.(id);
  const books = new Map(allBooks().map((b) => [b.id, b]));
  const n = timesRecited(id);
  closeDetail();
  const el = document.createElement('div');
  el.className = 'card-detail';
  ($(pageId) ?? document.body).append(el);
  el.innerHTML = `<div class="cd-box">
    <div class="cd-book">${books.get(c.book)?.icon ?? ''} ${books.get(c.book)?.title ?? c.book}${c.sub ? ` · ${c.sub}` : ''}</div>
    <h2>${c.title}</h2>
    ${c.hi ? `<div class="cd-hi">${c.hi}</div>` : ''}
    <p class="cd-recite">“${c.recite}”</p>
    ${c.text && c.text !== c.recite ? `<p class="cd-text">${c.text}</p>` : ''}
    ${c.moral ? `<p class="cd-moral"><b>Moral:</b> ${c.moral}</p>` : ''}
    ${c.moralHi ? `<p class="cd-moral cd-hi">${c.moralHi}</p>` : ''}
    ${c.origin ? `<p class="cd-origin">${c.origin}</p>` : ''}
    <div class="cd-row">
      <span class="tiny">${n ? `recited ${n} time${n === 1 ? '' : 's'}` : 'never recited'}</span>
      <span>
        <button class="btn" data-close-detail>close</button>
        <button class="btn btn--primary" data-recite="${c.id}">Recite this</button>
      </span>
    </div>
  </div>`;
  // Bound on the element, not delegated from a page: the detail can now be
  // hosted on the stage too, where no page handler would ever see it.
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-detail]')) { closeDetail(); return; }
    const r = e.target.closest('[data-recite]');
    if (r) { hooks.setCurrentCard(r.dataset.recite); closeDetail(); return; }
    if (e.target === el) closeDetail();     // click the backdrop to dismiss
  });
  el.hidden = false;
}

function closeDetail() {
  // Remove rather than hide: a hidden detail would keep its stale
  // "Recite this" button in the DOM, and stale buttons are how the wrong
  // card gets recited.
  for (const el of document.querySelectorAll('.card-detail')) el.remove();
}

/* ── The library ────────────────────────────────────────────────────────── */

function renderBooks() {
  const lv = hooks.getLevel();
  const tabs = `<div class="lib-tabs">
    <button class="btn ${booksView.tab === 'book' ? 'btn--primary' : ''}" data-tab="book">By Book</button>
    <button class="btn ${booksView.tab === 'cat' ? 'btn--primary' : ''}" data-tab="cat">By Category</button>
  </div>`;

  if (booksView.open) { renderBookOpen(booksView.open, lv, tabs); return; }

  if (booksView.tab === 'cat') {
    const cards = allCards().filter(inFilter);
    const cats = [...new Set(cards.map((c) => c.category))];
    $('books-body').innerHTML = `${tabs}
      <p class="lede">The same library, cut by subject — what each kind of teaching is FOR.</p>
      ${filterNote()}
      ${cats.map((cat) => {
        const mine = cards.filter((c) => c.category === cat);
        const done = mine.filter((c) => timesRecited(c.id) > 0).length;
        const open = mine.filter((c) => c.level <= lv);
        return `<div class="shelf-row" data-cat="${cat}">
          <span class="sr-title">${cat}</span>
          <span class="sr-bar"><i style="width:${(done / mine.length) * 100}%"></i></span>
          <span class="sr-n">${done}/${mine.length}${open.length < mine.length ? ` · ${mine.length - open.length} locked` : ''}</span>
        </div>
        <div class="shelf-pages">${mine.map((c) => pageChip(c, lv)).join('')}</div>`;
      }).join('')}`;
    return;
  }

  // By Book: the shelf, plus the player's own.
  const shelf = bookProgress().filter((b) => !filter() || cardInBooks({ book: b.id, category: b.user ? 'Modern' : '' }, filter().books));
  $('books-body').innerHTML = `${tabs}
    <p class="lede">Read a book through and its people carry it. Progress is pages recited.</p>
    ${filterNote()}
    ${shelf.map((b) => `
      <div class="shelf-row" data-book="${b.id}">
        <span class="sr-icon">${b.icon}</span>
        <span class="sr-title">${b.title}</span>
        <span class="sr-bar"><i style="width:${b.total ? (b.done / b.total) * 100 : 0}%"></i></span>
        <span class="sr-n">${b.done}/${b.total}</span>
        ${b.user ? `<button class="btn tiny" data-del-book="${b.id}" title="Remove this book and its reading record.">✕</button>` : ''}
      </div>`).join('')}
    <div class="upload-box">
      <h2>📕 Bring your own book</h2>
      <p class="lede">Paste a text (or pick a .txt file) and it becomes a book of recitable pages —
        Atomic Habits, a family notebook, anything you have the right to read aloud. It stays in this browser only.</p>
      <input id="ub-title" class="ub-title" placeholder="Book title" maxlength="80">
      <textarea id="ub-text" class="ub-text" placeholder="Paste the text here…"></textarea>
      <div class="cd-row">
        <label class="btn">choose .txt <input id="ub-file" type="file" accept=".txt,text/plain" hidden></label>
        <button class="btn btn--primary" id="ub-add">Add to the library</button>
      </div>
    </div>`;

  $('ub-file').addEventListener('change', async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    $('ub-text').value = await f.text();
    if (!$('ub-title').value) $('ub-title').value = f.name.replace(/\.txt$/i, '');
  });
  $('ub-add').addEventListener('click', () => {
    const title = $('ub-title').value, text = $('ub-text').value;
    if (!text.trim()) return;
    const id = addUserBook(title, text);
    if (id) { booksView.open = id; renderBooks(); hooks.onDeckChanged?.(); }
  });
}

function pageChip(c, lv) {
  const locked = c.level > lv;
  if (locked) return `<span class="pchip locked" title="Level ${c.level}">🔒</span>`;
  const n = timesRecited(c.id);
  return `<button class="pchip ${n ? 'done' : ''}" data-card="${c.id}" title="${c.title}">${n ? '✓' : '•'}</button>`;
}

function renderBookOpen(bookId, lv, tabs) {
  const b = allBooks().find((x) => x.id === bookId);
  const mine = allCards().filter((c) => c.book === bookId);
  const done = mine.filter((c) => timesRecited(c.id) > 0).length;
  $('books-body').innerHTML = `${tabs}
    <button class="btn tiny" data-shelf>← the shelf</button>
    <h2 class="bo-title">${b.icon} ${b.title}</h2>
    <p class="lede">${done}/${mine.length} pages recited.</p>
    <div class="bo-pages">${mine.map((c) => {
      const locked = c.level > lv;
      const n = timesRecited(c.id);
      if (locked) return `<div class="bo-page locked"><span>🔒</span><span class="bp-t">Revealed at level ${c.level} — ${levelName(c.level)}</span></div>`;
      return `<button class="bo-page ${n ? 'done' : ''}" data-card="${c.id}">
        <span>${n ? '✓' : '•'}</span><span class="bp-t">${c.title}</span>
        <span class="bp-n">${n ? `×${n}` : 'new'}</span></button>`;
    }).join('')}</div>`;
}

function onBooksClick(e) {
  if (e.target.closest('[data-clear-filter]')) { hooks.clearFilter?.(); renderBooks(); return; }
  if (e.target.closest('.card-detail')) return;
  const tab = e.target.closest('[data-tab]');
  if (tab) { booksView.tab = tab.dataset.tab; booksView.open = null; renderBooks(); return; }
  if (e.target.closest('[data-shelf]')) { booksView.open = null; renderBooks(); return; }
  const del = e.target.closest('[data-del-book]');
  if (del) { removeUserBook(del.dataset.delBook); renderBooks(); hooks.onDeckChanged?.(); return; }
  const row = e.target.closest('[data-book]');
  if (row) { booksView.open = row.dataset.book; renderBooks(); return; }
  const c = e.target.closest('[data-card]');
  if (c) openDetail(c.dataset.card, 'page-books');
}
