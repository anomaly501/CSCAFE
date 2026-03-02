// Tailwind Configuration
if (window.tailwind) {
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    navy: '#0a1628',
                    navyLight: '#12213a',
                    navyMid: '#1a2d4a',
                    slate: '#8892b0',
                    lightSlate: '#a8b2d1',
                    lightest: '#ccd6f6',
                    accent: '#f59e0b',
                    accentHover: '#d97706',
                    electric: '#3b82f6',
                    surface: '#f8fafc',
                    surfaceAlt: '#f1f5f9'
                },
                fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif']
                }
            }
        }
    };
}

// Dark Mode Logic
function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
}
initDarkMode();

// ===== UTILS =====
function escapeHTML(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(s)));
    return d.innerHTML;
}

function sanitizeUrl(u) {
    if (!u) return '';
    try {
        const p = new URL(u, location.href);
        if (['http:', 'https:', 'mailto:'].includes(p.protocol)) return u.trim();
        return '';
    } catch {
        return u.startsWith('#') ? u : '';
    }
}

const catColors = {
    Internship: 'bg-emerald-100 text-emerald-800',
    Jobs: 'bg-blue-100 text-blue-800',
    Scholarship: 'bg-amber-100 text-amber-800',
    Hackathon: 'bg-rose-100 text-rose-800',
    Fellowship: 'bg-violet-100 text-violet-800',
    Workshop: 'bg-cyan-100 text-cyan-800',
    General: 'bg-gray-100 text-gray-800',
    Exams: 'bg-blue-100 text-blue-800',
    Notice: 'bg-gray-100 text-gray-800',
    Results: 'bg-amber-100 text-amber-800',
    Contest: 'bg-rose-100 text-rose-800'
};
const catEmojis = {
    Internship: '💼',
    Jobs: '🏢',
    Scholarship: '🎓',
    Hackathon: '💻',
    Fellowship: '🔬',
    Workshop: '🛠️',
    General: '📋',
    Exams: '📝',
    Notice: '📌',
    Results: '📊',
    Contest: '🏆'
};
const catGradients = {
    Internship: 'bg-gradient-to-br from-emerald-600 to-teal-700',
    Jobs: 'bg-gradient-to-br from-blue-600 to-indigo-700',
    Scholarship: 'bg-gradient-to-br from-amber-500 to-orange-600',
    Hackathon: 'bg-gradient-to-br from-rose-600 to-pink-700',
    Fellowship: 'bg-gradient-to-br from-violet-600 to-purple-700',
    Workshop: 'bg-gradient-to-br from-cyan-600 to-blue-700',
    General: 'bg-gradient-to-br from-gray-700 to-gray-800',
    Exams: 'bg-gradient-to-br from-blue-600 to-indigo-700',
    Notice: 'bg-gradient-to-br from-gray-600 to-gray-700',
    Results: 'bg-gradient-to-br from-amber-600 to-orange-700',
    Contest: 'bg-gradient-to-br from-rose-600 to-red-700'
};

// ===== API BASE URL =====
const API = '/api';

// ===== LOAD DATA FROM API =====
const params = new URLSearchParams(window.location.search);
const postId = parseInt(params.get('id'));

async function renderPost() {
    try {
        const res = await fetch(API + '/updates/' + postId);
        if (!res.ok) throw new Error('Not found');
        const post = await res.json();

        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('postArticle').classList.remove('hidden');
        document.title = escapeHTML(post.title) + ' | cscafe';

        // Breadcrumb
        document.getElementById('breadcrumbCat').textContent = post.cat;
        document.getElementById('breadcrumbTitle').textContent = post.title;

        // Hero banner
        const gradient = catGradients[post.cat] || catGradients.General;
        document.getElementById('heroBanner').className = 'rounded-2xl overflow-hidden mb-8 p-8 md:p-12 text-white relative ' + gradient;
        document.getElementById('postCatBadge').textContent = post.cat;

        // Tags
        const tagsEl = document.getElementById('postTags');
        if (post.tags) {
            tagsEl.innerHTML = post.tags.split(',').map(tag => `<span class="px-2 py-0.5 bg-white/10 backdrop-blur text-[10px] text-white/90 border border-white/20 rounded uppercase tracking-wider font-semibold">${escapeHTML(tag.trim())}</span>`).join('');
        } else {
            tagsEl.innerHTML = '';
        }

        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postAuthor').textContent = post.author || 'cscafe Team';

        const postDate = new Date(post.date);
        document.getElementById('postDate').textContent = postDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        const readTime = post.readTime || Math.max(1, Math.ceil((post.desc || '').split(' ').length / 50));
        document.getElementById('postReadTime').textContent = readTime + ' min read';

        // Description
        document.getElementById('postDesc').textContent = post.desc || 'No description available for this opportunity.';

        // Key Details
        const details = document.getElementById('keyDetails');
        const detailItems = [{
            icon: '📂',
            label: 'Category',
            value: post.cat
        },
        {
            icon: '📅',
            label: 'Deadline',
            value: postDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        },
        {
            icon: '👤',
            label: 'Posted By',
            value: post.author || 'cscafe Team'
        },
        {
            icon: '⏱️',
            label: 'Read Time',
            value: readTime + ' minute(s)'
        }
        ];
        details.innerHTML = detailItems.map(d => `
            <div class="flex items-center gap-3 bg-white dark:bg-white/5 rounded-lg p-3 border border-gray-100 dark:border-white/10 transition-colors">
                <span class="text-xl">${d.icon}</span>
                <div><p class="text-xs text-gray-400 font-medium">${escapeHTML(d.label)}</p><p class="text-sm font-bold text-gray-800 dark:text-gray-200">${escapeHTML(d.value)}</p></div>
            </div>`).join('');

        // Action Buttons
        const btns = document.getElementById('actionButtons');
        let btnHtml = '';
        const sLink = sanitizeUrl(post.link);
        const sReg = sanitizeUrl(post.regLink);
        const isOver = new Date(post.date) < new Date();

        if (isOver) {
            btnHtml += `<span class="inline-flex items-center gap-2 bg-red-500 text-white font-bold px-10 py-4.5 rounded-full text-sm cursor-not-allowed shadow-lg pulse-deadline"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>DEADLINE OVER</span>`;
        } else {
            if (sReg) btnHtml += `<a href="${sReg}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-accent text-navy font-bold px-10 py-4.5 rounded-full text-sm hover:bg-accentHover transition-all active:scale-95 shadow-lg shadow-accent/30"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>Apply / Register Now</a>`;
            if (sLink) btnHtml += `<a href="${sLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 border-2 border-navy text-navy font-bold px-10 py-4.5 rounded-full text-sm hover:bg-navy hover:text-white transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>Visit Source</a>`;
            if (!sReg && !sLink) btnHtml += `<span class="text-gray-400 text-sm italic">No external links available for this opportunity.</span>`;
        }
        btnHtml += `<a href="index.html" class="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-gray-200 transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>Back to All</a>`;
        btns.innerHTML = btnHtml;

        // Related Posts (same category, exclude current) — fetch from API
        const relatedRes = await fetch(API + '/updates?cat=' + encodeURIComponent(post.cat) + '&exclude=' + post.id);
        const allRelated = await relatedRes.json();
        const related = allRelated.slice(0, 3);
        const relatedEl = document.getElementById('relatedPosts');
        if (related.length === 0) {
            relatedEl.innerHTML = '<p class="text-gray-400 text-sm col-span-full">No related opportunities found.</p>';
        } else {
            relatedEl.innerHTML = related.map(r => {
                const style = catColors[r.cat] || catColors.General;
                const emoji = catEmojis[r.cat] || '📋';
                return `<a href="post.html?id=${r.id}" class="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden card-hover block group transition-colors">
                    <div class="h-28 ${catGradients[r.cat] || catGradients.General} flex items-center justify-center text-4xl">${emoji}</div>
                    <div class="p-4">
                        <span class="cat-badge ${style} inline-block mb-2">${escapeHTML(r.cat)}</span>
                        <h3 class="font-bold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-accent transition-colors" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${escapeHTML(r.title)}</h3>
                        <p class="text-xs text-gray-400 mt-2">${new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </a>`;
            }).join('');
        }
    } catch (err) {
        console.error('Failed to load post:', err);
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('notFoundState').classList.remove('hidden');
    }
}

// Mouse tracking for background
document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mouse-x', x + '%');
    document.documentElement.style.setProperty('--mouse-y', y + '%');
});

// Init
renderPost();

// Dark Mode Toggle Logic (CSP Compatible)
document.addEventListener('DOMContentLoaded', () => {
    const darkBtn = document.getElementById('darkModeToggle');
    if (darkBtn) darkBtn.addEventListener('click', toggleDarkMode);
});
