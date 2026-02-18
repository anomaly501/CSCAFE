# CMS Folder Structure

```
/cspoint/
├── index.html              # Homepage prototype
├── admin.html              # Admin dashboard
├── /assets/
│   ├── /css/
│   │   └── tailwind.css    # Tailwind input
│   ├── /js/
│   │   ├── main.js         # Search, menu, filters
│   │   └── countdown.js    # Timer logic
│   ├── /images/
│   └── /fonts/
├── /components/
│   ├── Header.html
│   ├── Footer.html
│   ├── UpdateCard.html
│   ├── NoticeBoard.html
│   └── ResourceCard.html
├── /data/
│   ├── updates.json
│   ├── deadlines.json
│   └── resources.json
├── /pages/
│   ├── /news/
│   ├── /resources/
│   └── /events/
├── /layouts/
│   └── MainLayout.html
└── config.js
```

## Key Principles
1. **Componentize**: Extract Header, Footer, Cards into reusable partials.
2. **Decouple Data**: Store content in `/data/*.json` so non-devs can update without touching HTML.
3. **Lazy Load**: Only load `countdown.js` on pages that use timers.
