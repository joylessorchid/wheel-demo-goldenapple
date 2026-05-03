// ===== CONFIG =====
const SEGMENTS = [
    { label: 'Скидка 5%',        code: 'LUCKY5',    desc: 'На любой товар',     color: '#f0c6d4' },
    { label: 'Скидка 30%',       code: 'MEGA30',    desc: 'На весь заказ',       color: '#c8dbbe' },
    { label: 'Скидка 10%',       code: 'LUCKY10',   desc: 'На любой товар',     color: '#f5d5b0' },
    { label: 'Бесп. товар',      code: 'FREEITEM',  desc: 'Товар до 2 000 ₽',  color: '#f7e8a6' },
    { label: 'Бесп. доставка',   code: 'FREESHIP',  desc: 'На следующий заказ', color: '#d9cce8' },
    { label: 'Скидка 5%',        code: 'LUCKY5',    desc: 'На любой товар',     color: '#f0c6d4' },
    { label: 'Скидка 30%',       code: 'MEGA30',    desc: 'На весь заказ',       color: '#c8dbbe' },
    { label: 'Скидка 10%',       code: 'LUCKY10',   desc: 'На любой товар',     color: '#f5d5b0' },
    { label: 'Бесп. товар',      code: 'FREEITEM',  desc: 'Товар до 2 000 ₽',  color: '#f7e8a6' },
    { label: 'Бесп. доставка',   code: 'FREESHIP',  desc: 'На следующий заказ', color: '#d9cce8' },
];

const UNIQUE = [
    { ...SEGMENTS[0], weight: 35 },
    { ...SEGMENTS[2], weight: 25 },
    { ...SEGMENTS[4], weight: 20 },
    { ...SEGMENTS[1], weight: 15 },
    { ...SEGMENTS[3], weight: 5 },
];

const N = SEGMENTS.length;
const ARC = (Math.PI * 2) / N;

let attempts = 1, used = 0, prize = null, spinning = false, angle = 0;

// ===== TICK MARKS =====
(function createTicks() {
    const ring = document.getElementById('tick-ring');
    const count = 40;
    const ringSize = 468; // inset: -14px on 440px = 468px diameter
    const r = ringSize / 2;
    for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const dot = document.createElement('div');
        dot.className = 'tick-mark';
        const x = r + Math.cos(a) * r - 2;
        const y = r + Math.sin(a) * r - 2;
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        ring.appendChild(dot);
    }
})();

// ===== CANVAS =====
const cvs = document.getElementById('wheel');
const ctx = cvs.getContext('2d');
const CX = cvs.width / 2;
const CY = cvs.height / 2;
const R = CX - 4;

function draw() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    // Outer shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R + 2, 0, Math.PI * 2);
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(angle);

    for (let i = 0; i < N; i++) {
        const seg = SEGMENTS[i];
        const start = i * ARC;
        const end = start + ARC;
        const mid = start + ARC / 2;

        // Segment fill
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, start, end);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();

        // White separator
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(start) * R, Math.sin(start) * R);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner accent line (subtle depth)
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.92, start + 0.02, end - 0.02);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.rotate(mid);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textBaseline = 'middle';

        const deg = ((mid % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (deg > Math.PI / 2 && deg < Math.PI * 1.5) {
            ctx.textAlign = 'center';
            ctx.translate(R * 0.62, 0);
            ctx.rotate(Math.PI);
            ctx.fillText(seg.label, 0, 0);
        } else {
            ctx.textAlign = 'center';
            ctx.fillText(seg.label, R * 0.62, 0);
        }
        ctx.restore();
    }

    // Outer border ring on canvas
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center hub - white with border
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
}

draw();

// ===== SPIN =====
function pickPrize() {
    const total = UNIQUE.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    for (let i = 0; i < UNIQUE.length; i++) {
        r -= UNIQUE[i].weight;
        if (r <= 0) return i;
    }
    return 0;
}

function spin() {
    if (spinning || used >= attempts) return;
    spinning = true;
    document.getElementById('spin-btn').classList.add('disabled');

    const winIdx = pickPrize();
    const segMapping = [0, 2, 4, 1, 3];
    const segIdx = segMapping[winIdx];
    const actualIdx = Math.random() > 0.5 ? segIdx : segIdx + 5;

    const segCenter = actualIdx * ARC + ARC / 2;
    const spins = 6 + Math.floor(Math.random() * 3);
    const target = -(Math.PI / 2) - segCenter + spins * Math.PI * 2;
    const totalRot = target - angle;

    const duration = 4500 + Math.random() * 1500;
    const t0 = performance.now();
    const startAngle = angle;

    function tick(now) {
        const p = Math.min((now - t0) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        angle = startAngle + totalRot * ease;
        draw();
        if (p < 1) {
            requestAnimationFrame(tick);
        } else {
            spinning = false;
            used++;
            prize = UNIQUE[winIdx];
            updateAttempts();
            setTimeout(() => showModal(prize), 300);
        }
    }
    requestAnimationFrame(tick);
}

function updateAttempts() {
    const left = Math.max(0, attempts - used);
    document.getElementById('attempts').textContent = left;
    const btn = document.getElementById('spin-btn');
    if (left > 0) btn.classList.remove('disabled');
    else btn.classList.add('disabled');
}

// ===== MODAL =====
function showModal(p) {
    document.getElementById('m-icon').textContent =
        p.code === 'FREEITEM' ? '🎁' : p.code === 'FREESHIP' ? '🚚' : '💎';
    document.getElementById('m-prize').textContent = p.label;
    document.getElementById('m-desc').textContent = p.desc;
    document.getElementById('m-code').textContent = p.code;
    document.getElementById('claim-form').style.display = 'flex';
    document.getElementById('referral').style.display = 'none';
    document.getElementById('overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('overlay').classList.remove('active');
}

function claim(e) {
    e.preventDefault();
    console.log('Claimed:', { prize, email: document.getElementById('email').value });
    document.getElementById('claim-form').style.display = 'none';
    document.getElementById('referral').style.display = 'block';
    const code = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById('ref-link').value = `https://ga.store/?ref=${code}`;
    const left = attempts - used;
    document.getElementById('btn-back').textContent = left > 0 ? `Крутить ещё (${left})` : 'Готово';
}

// ===== SHARE =====
function copyLink() {
    const inp = document.getElementById('ref-link');
    navigator.clipboard.writeText(inp.value).then(() => {
        const btn = inp.nextElementSibling;
        btn.textContent = 'Готово!';
        setTimeout(() => btn.textContent = 'Копировать', 1500);
    });
}

function share(type) {
    const link = encodeURIComponent(document.getElementById('ref-link').value);
    const text = encodeURIComponent('Я выиграл приз на Колесе Удачи!');
    const urls = {
        tg: `https://t.me/share/url?url=${link}&text=${text}`,
        vk: `https://vk.com/share.php?url=${link}`,
        wa: `https://wa.me/?text=${text}%20${link}`
    };
    window.open(urls[type], '_blank');
    bonus();
}

function bonus() {
    attempts++;
    updateAttempts();
    document.getElementById('btn-back').textContent = `Крутить ещё (${attempts - used})`;
}

// ===== TIMER =====
(function () {
    const el = document.getElementById('timer');
    let s = 86381;
    setInterval(() => {
        if (s <= 0) return;
        s--;
        el.textContent =
            String(Math.floor(s / 3600)).padStart(2, '0') + ':' +
            String(Math.floor((s % 3600) / 60)).padStart(2, '0') + ':' +
            String(s % 60).padStart(2, '0');
    }, 1000);
})();

// ===== COUNTERS =====
(function () {
    let pr = 847, pl = 2341;
    const pEl = document.getElementById('prizes-left');
    const plEl = document.getElementById('players-count');
    setInterval(() => {
        if (Math.random() > 0.6 && pr > 100) { pr -= Math.floor(Math.random() * 3) + 1; pEl.textContent = pr; }
        if (Math.random() > 0.5) { pl += Math.floor(Math.random() * 4) + 1; plEl.textContent = pl.toLocaleString('ru-RU'); }
    }, 3000);
})();
