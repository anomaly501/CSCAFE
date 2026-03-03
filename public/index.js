// Tailwind Configuration
if (window.tailwind) {
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    navy: '#0b1a2e',
                    navyLight: '#112240',
                    accent: '#38bdf8'
                },
                fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    serif: ['Playfair Display', 'serif']
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

const API = '/api';
let data = { updates: [] };
let currentCategory = 'all';
let sortOrder = 'latest';

// ===== SECURITY UTILITIES =====
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

function sanitizeUrl(url) {
    if (!url) return '';
    try {
        const parsed = new URL(url.trim(), location.href);
        if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) return url.trim();
        return '';
    } catch { return ''; }
}

async function loadData() {
    try {
        // Fetching from your existing backend API
        const response = await fetch(API + '/updates');
        data.updates = await response.json();
        renderPosts();
    } catch (err) {
        console.error('Failed to load data:', err);
        document.getElementById('postsList').innerHTML = `
            <div class="glass p-8 text-center text-red-500">
                <p class="font-bold">⚠ Connection failed</p>
                <p class="text-sm opacity-70">Make sure the Node.js server is running.</p>
            </div>
        `;
    }
}

function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.filter-pill').forEach(el => {
        el.classList.remove('active');
        if (el.getAttribute('data-category') === cat) {
            el.classList.add('active');
        }
    });
    renderPosts();
}

function toggleSort() {
    sortOrder = sortOrder === 'latest' ? 'deadline' : 'latest';
    renderPosts();
}

// Category emojis configuration
const catEmojis = { Internship: '💼', Jobs: '🏢', Scholarship: '🎓', Hackathon: '💻', Fellowship: '🔬', Workshop: '🛠️', General: '📋', Exams: '📝', Notice: '📌', Results: '📊', Contest: '🏆', Blog: '👤' };

function getCategoryEmoji(cat) {
    return catEmojis[cat] || '📋';
}

function getTagColor(idx) {
    const colors = ['#fef2f2', '#f0fdf4', '#eff6ff', '#fefce8', '#faf5ff'];
    return colors[idx % colors.length];
}

function getTagTextColor(idx) {
    const colors = ['#991b1b', '#166534', '#1e40af', '#854d0e', '#6b21a8'];
    return colors[idx % colors.length];
}

function renderPosts() {
    const container = document.getElementById('postsList');
    const query = document.getElementById('searchInput').value.toLowerCase();

    let filtered = data.updates.filter(u => {
        const matchCat = currentCategory === 'all' || u.cat === currentCategory;
        const terms = (u.title + ' ' + u.desc + ' ' + (u.tags || '')).toLowerCase();
        const matchSearch = terms.includes(query);
        return matchCat && matchSearch;
    });

    // Sorting logic
    filtered.sort((a, b) => {
        if (sortOrder === 'deadline') {
            return new Date(a.date) - new Date(b.date);
        }
        return b.id - a.id; // Latest by ID
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="glass p-10 text-gray-400 font-medium text-center">No results found for your search.</div>';
        return;
    }

    container.innerHTML = filtered.map(u => {
        let dateStr = 'TBD';
        try {
            dateStr = new Date(u.date).toISOString().split('T')[0];
        } catch (e) { }

        const tagList = u.tags ? u.tags.split(',').map(t => t.trim()) : [];
        const emoji = getCategoryEmoji(u.cat);

        const postDate = new Date(u.date);
        const isOver = postDate < new Date();
        const btnText = isOver ? 'DEADLINE OVER' : `Apply By ${escapeHTML(dateStr)}`;
        const btnClass = isOver ? 'btn-deadline pulse-deadline cursor-not-allowed opacity-90' : 'btn-apply';

        return `
            <div class="glass card flex flex-col sm:flex-row items-start sm:items-center gap-8 dark:bg-white/5 dark:border-white/10">
                <div class="card-logo text-5xl"><span>${emoji}</span></div>
                <div class="flex-1 w-full">
                    <div class="mb-2">
                        <h3 class="text-2xl font-black text-gray-800 dark:text-white tracking-tight">${escapeHTML(u.title)}</h3>
                    </div>
                    <p class="text-base text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">${escapeHTML(u.desc)}</p>
                    
                    <div class="flex flex-wrap items-center gap-3">
                        <div class="flex flex-wrap gap-2">
                            ${tagList.map((tag, idx) => `
                                <span class="tag" style="background: ${getTagColor(idx)}; color: ${getTagTextColor(idx)};">${escapeHTML(tag)}</span>
                            `).join('')}
                        </div>
                        
                        <div class="sm:ml-auto mt-4 sm:mt-0">
                            ${isOver
                ? `<span class="${btnClass} inline-block">${btnText}</span>`
                : `<a href="post.html?id=${parseInt(u.id)}" class="${btnClass} inline-block">${btnText}</a>`
            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Mouse tracking for background
document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mouse-x', x + '%');
    document.documentElement.style.setProperty('--mouse-y', y + '%');
});

// Initial load
loadData();

// Attach global event listeners for internal navigation if any (none for now)
window.setCategory = setCategory;
window.toggleSort = toggleSort;
window.renderPosts = renderPosts;
window.toggleDarkMode = toggleDarkMode;

// Event Listeners (CSP Compatible)
document.addEventListener('DOMContentLoaded', () => {
    const darkBtn = document.getElementById('darkModeToggle');
    if (darkBtn) darkBtn.addEventListener('click', toggleDarkMode);

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', renderPosts);

    const sortBtn = document.getElementById('sortBtn');
    if (sortBtn) sortBtn.addEventListener('click', toggleSort);

    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            const cat = e.currentTarget.getAttribute('data-category');
            if (cat) setCategory(cat);
        });
    });
});
