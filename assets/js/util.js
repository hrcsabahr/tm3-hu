/* =====================================================
   tm3.hu — Közös utility: toast, localStorage helpers
   ===================================================== */

window.tm3 = window.tm3 || {};

window.tm3.toast = function (msg, type = 'default', ms = 2400) {
    let t = document.getElementById('tm3Toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'tm3Toast';
        t.className = 'toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'toast ' + type + ' show';
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), ms);
};

window.tm3.store = {
    get(key, fallback = null) {
        try {
            const v = localStorage.getItem('tm3:' + key);
            return v === null ? fallback : JSON.parse(v);
        } catch (_) {
            return fallback;
        }
    },
    set(key, val) {
        try {
            localStorage.setItem('tm3:' + key, JSON.stringify(val));
        } catch (_) {}
    },
    del(key) {
        localStorage.removeItem('tm3:' + key);
    },
};

window.tm3.fmt = {
    huf(n) {
        return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(n);
    },
    eur(n) {
        return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
    },
    num(n) {
        return new Intl.NumberFormat('hu-HU').format(n);
    },
    km(n) {
        return new Intl.NumberFormat('hu-HU').format(n) + ' km';
    },
    pct(n, d = 1) {
        return n.toFixed(d) + '%';
    },
};

window.tm3.fmt.dt = function (iso) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
};
