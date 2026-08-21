/* =====================================================
   Blog oldal — hírek render + szűrő
   ===================================================== */

(async function () {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    let data;
    try {
        const res = await fetch('../data/blog.json');
        data = await res.json();
    } catch (e) {
        grid.innerHTML = '<div class="empty-state"><h3>Adatbetöltési hiba</h3><p>' + e.message + '</p></div>';
        return;
    }

    function render(items) {
        if (items.length === 0) {
            grid.innerHTML = '';
            document.getElementById('blog-empty').style.display = 'block';
            return;
        }
        document.getElementById('blog-empty').style.display = 'none';

        grid.innerHTML = items
            .map(
                (p) => `
            <article class="card" data-id="${p.id}">
                <div class="blog-meta">
                    <span class="blog-tag">${p.kategoria}</span>
                    <span class="blog-date">${tm3.fmt.dt(p.datum)}</span>
                </div>
                <h3>${p.cim}</h3>
                <p>${p.kivonat}</p>
            </article>`,
            )
            .join('');

        // Kattintásra bővítsük ki
        grid.querySelectorAll('.card').forEach((card) => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const post = data.posts.find((p) => p.id === id);
                if (!post) return;
                showPost(post);
            });
        });
    }

    function showPost(post) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; inset: 0; z-index: 1000;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
            display: grid; place-items: center;
            padding: 20px; overflow-y: auto;
        `;
        modal.innerHTML = `
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);max-width:780px;width:100%;padding:40px;position:relative;">
                <button id="close-modal" style="position:absolute;top:16px;right:16px;background:var(--surface-2);border:0;color:var(--text);width:36px;height:36px;border-radius:50%;font-size:18px;cursor:pointer;">×</button>
                <div class="blog-meta" style="margin-bottom:20px;">
                    <span class="blog-tag">${post.kategoria}</span>
                    <span class="blog-date">${tm3.fmt.dt(post.datum)}</span>
                </div>
                <h1 style="font-size:32px;font-weight:800;line-height:1.2;margin-bottom:24px;">${post.cim}</h1>
                <p style="font-size:16px;line-height:1.7;color:var(--text);">${post.tartalom.replace(/\n/g, '</p><p style="font-size:16px;line-height:1.7;color:var(--text);margin-top:16px;">')}</p>
            </div>`;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const close = () => {
            modal.remove();
            document.body.style.overflow = '';
        };
        modal.querySelector('#close-modal').addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', esc);
            }
        });
    }

    function filter() {
        const q = document.getElementById('filter-search').value.toLowerCase();
        const cat = document.getElementById('filter-cat').value;
        const filtered = data.posts.filter((p) => {
            if (cat && p.kategoria !== cat) return false;
            if (q && !`${p.cim} ${p.kivonat} ${p.tartalom}`.toLowerCase().includes(q)) return false;
            return true;
        });
        render(filtered);
    }

    document.querySelectorAll('.filter-bar input, .filter-bar select').forEach((el) => {
        el.addEventListener('input', filter);
        el.addEventListener('change', filter);
    });

    render(data.posts.sort((a, b) => new Date(b.datum) - new Date(a.datum)));
})();
