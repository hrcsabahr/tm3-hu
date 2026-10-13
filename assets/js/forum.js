/* =====================================================
   tm3.hu — Fórum (GitHub Discussions alapon)
   Kilistázza a GitHub Discussions témákat, kategória- és
   keresőszűréssel. Az "Új téma" gombok a GitHub-on nyitnak
   előre kitöltött sablonnal (a kategória slug-ot a valós
   kategóriákból képezi le).
   ===================================================== */

(function () {
    'use strict';

    const CONFIG = {
        owner: 'hrcsabahr',
        repo: 'tm3-hu',
        // Opcionális: read-only fine-grained PAT (csak Discussions olvasás).
        // Üresen hagyva anonim hívás (60 kérés/óra/IP — kis fórumnak elég).
        // Ha a forgalom megnő, egy read-only token 5000/órára emeli a limitet.
        token: '',
        perPage: 100,
    };

    const listEl = document.getElementById('forum-list');
    if (!listEl) return;

    const emptyEl = document.getElementById('forum-empty');
    const loadingEl = document.getElementById('forum-loading');
    const searchEl = document.getElementById('forum-search');
    const catEl = document.getElementById('forum-cat');
    const stateEl = document.getElementById('forum-state');
    const btnHiba = document.getElementById('btn-new-hiba');
    const btnKerdes = document.getElementById('btn-new-kerdes');

    const DISCUSSIONS_URL = 'https://github.com/' + CONFIG.owner + '/' + CONFIG.repo + '/discussions';
    const API_URL = 'https://api.github.com/repos/' + CONFIG.owner + '/' + CONFIG.repo + '/discussions';

    let discussions = [];
    let categories = []; // [{slug, name, is_answerable}]

    const headers = CONFIG.token
        ? { 'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + CONFIG.token }
        : { 'Accept': 'application/vnd.github+json' };

    // A két fő kategória — akkor is megjelenjen a szűrőben és az "Új téma"
    // gombokban, ha még nincs bennük bejegyzés (a GitHub API csak a nem-üres
    // kategóriákat adja vissza). A slug-ok a GitHub tényleges slug-jai.
    const KNOWN_CATEGORIES = [
        { slug: 'hibák-megoldások', name: 'Hibák & megoldások', is_answerable: false },
        { slug: 'kérdések', name: 'Kérdések', is_answerable: true },
    ];

    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function stripMd(s) {
        return String(s == null ? '' : s)
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/^#{1,6}\s*/gm, '')
            .replace(/^>\s?/gm, '')
            .replace(/[*_~]{1,3}/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function fmtDate(iso) {
        if (!iso) return '';
        try {
            return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
        } catch (_) { return ''; }
    }

    function relTime(iso) {
        if (!iso) return '';
        const diff = Date.now() - new Date(iso).getTime();
        const min = Math.round(diff / 60000);
        if (min < 1) return 'most';
        if (min < 60) return min + ' perce';
        const h = Math.round(min / 60);
        if (h < 24) return h + ' órája';
        const d = Math.round(h / 24);
        if (d < 30) return d + ' napja';
        return fmtDate(iso);
    }

    function buildCategories() {
        const seen = {};
        // 1) A két ismert kategória mindig legyen bent (akkor is, ha üres).
        KNOWN_CATEGORIES.forEach(function (c) { seen[c.slug] = c; });
        // 2) Az API kategóriái felülírják/hozzáadják (aktuális slug + név).
        discussions.forEach(function (d) {
            if (!d.category) return;
            seen[d.category.slug] = {
                slug: d.category.slug,
                name: d.category.name || d.category.slug,
                is_answerable: !!d.category.is_answerable,
            };
        });
        categories = Object.values(seen);
        categories.sort(function (a, b) { return a.name.localeCompare(b.name, 'hu'); });

        catEl.innerHTML = '<option value="">Minden kategória</option>' +
            categories.map(function (c) {
                return '<option value="' + escapeHtml(c.slug) + '">' + escapeHtml(c.name) + '</option>';
            }).join('');
    }

    function normalize(s) {
        return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function findCategory(nameRe) {
        for (var i = 0; i < categories.length; i++) {
            if (nameRe.test(normalize(categories[i].name))) return categories[i];
        }
        return null;
    }

    function newDiscussionUrl(kind) {
        var cat = kind === 'hiba'
            ? findCategory(/hiba/i)
            : findCategory(/kérd|kerd|q&a|qa/i);
        var body = kind === 'hiba'
            ? '## Tünet\n\n(írd le: mi történt, milyen hibaüzenetet láttál)\n\n## Évjárat / konfiguráció\n\n(pl. 2019 LR AWD, 120 000 km)\n\n## Mit próbáltál már?\n\n...\n\n## Megoldás (ha már megvan)\n\n...'
            : '## Kérdés\n\n(írd le a hibát vagy jelenséget)\n\n## Évjárat / konfiguráció\n\n...\n\n## Mit próbáltál már?\n\n...';
        var q = new URLSearchParams();
        if (cat) q.set('category', cat.slug);
        q.set('title', kind === 'hiba' ? 'Hiba: ' : 'Kérdés: ');
        q.set('body', body);
        return DISCUSSIONS_URL + '/new?' + q.toString();
    }

    function wireNewButtons() {
        if (btnHiba) btnHiba.href = newDiscussionUrl('hiba');
        if (btnKerdes) btnKerdes.href = newDiscussionUrl('kerdes');
    }

    function cardHtml(d) {
        var cat = d.category || {};
        var user = d.user || {};
        var solved = !!d.answer_chosen_at;
        var avatar = user.avatar_url ? '<img class="avatar" src="' + escapeHtml(user.avatar_url) + '" alt="" loading="lazy" />' : '';
        var author = user.login ? escapeHtml(user.login) : 'ismeretlen';
        var reactions = (d.reactions && d.reactions['+1']) ? d.reactions['+1'] : 0;
        var excerpt = stripMd(d.body);
        if (excerpt.length > 180) excerpt = excerpt.slice(0, 180) + '…';

        var badges = '<span class="tag">' + escapeHtml(cat.name || 'Általános') + '</span>';
        if (solved) badges += ' <span class="tag green">✓ Megoldva</span>';

        var meta = '';
        meta += '<span>' + avatar + author + '</span>';
        meta += '<span>🕒 ' + relTime(d.updated_at || d.created_at) + '</span>';
        meta += '<span>💬 ' + (d.comments || 0) + '</span>';
        if (reactions > 0) meta += '<span>👍 ' + reactions + '</span>';

        return '' +
            '<article class="card forum-card">' +
                '<div class="card-head">' +
                    '<h3><a href="' + escapeHtml(d.html_url) + '" target="_blank" rel="noopener">' + escapeHtml(d.title) + '</a></h3>' +
                    '<div class="forum-badges">' + badges + '</div>' +
                '</div>' +
                '<p class="forum-excerpt">' + escapeHtml(excerpt) + '</p>' +
                '<div class="forum-meta">' + meta + '</div>' +
            '</article>';
    }

    function render() {
        var q = (searchEl.value || '').trim().toLowerCase();
        var cat = catEl.value || '';
        var state = stateEl.value || 'open';

        var items = discussions.filter(function (d) {
            if (state === 'open' && d.state !== 'open') return false;
            if (cat && (!d.category || d.category.slug !== cat)) return false;
            if (q) {
                var hay = ((d.title || '') + ' ' + stripMd(d.body)).toLowerCase();
                if (hay.indexOf(q) === -1) return false;
            }
            return true;
        });

        items.sort(function (a, b) {
            return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
        });

        if (!items.length) {
            listEl.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }
        emptyEl.style.display = 'none';
        listEl.innerHTML = items.map(cardHtml).join('');
    }

    function notEnabledHtml() {
        return '' +
            '<div class="tip-box orange">' +
                '<strong>🛠 A fórum még nincs bekapcsolva.</strong> A GitHub Discussions funkciót engedélyezni kell a ' +
                '<a href="https://github.com/' + CONFIG.owner + '/' + CONFIG.repo + '/settings" target="_blank" rel="noopener">repo beállításainál</a> ' +
                '(Settings → General → Features → Discussions).' +
            '</div>';
    }

    async function load() {
        try {
            const res = await fetch(API_URL + '?per_page=' + CONFIG.perPage, { headers: headers });
            if (res.status === 404) {
                loadingEl.style.display = 'none';
                listEl.innerHTML = notEnabledHtml();
                return;
            }
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            discussions = Array.isArray(data) ? data : [];
            buildCategories();
            wireNewButtons();
            render();
            loadingEl.style.display = 'none';
        } catch (e) {
            loadingEl.style.display = 'none';
            listEl.innerHTML =
                '<div class="empty-state"><h3>Nem sikerült betölteni a fórumot</h3>' +
                '<p>' + escapeHtml(e.message) + '. Próbáld újra később.</p>' +
                '<p style="margin-top:8px;">A témákat közvetlenül a <a href="' + DISCUSSIONS_URL + '" target="_blank" rel="noopener">GitHub Discussions</a> oldalon is eléred.</p></div>';
        }
    }

    searchEl.addEventListener('input', render);
    catEl.addEventListener('change', render);
    stateEl.addEventListener('change', render);

    load();
})();
