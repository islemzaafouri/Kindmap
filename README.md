# KindMap

> Tiny moments of grace. One beautiful, beating heart at a time.

KindMap is a web app where people share small acts of kindness as hearts pinned on an interactive map. Sign up, drop a heart where something kind happened, and explore the kindness shared around the world.

**Live demo:** [https://kindmap-ten.vercel.app/]

<!-- Add 1-2 screenshots: ![Home map](screenshots/home.png) -->

## Features

- Interactive map (Leaflet + OpenStreetMap) showing every shared act of kindness as a heart marker
- Authentication: sign up, sign in, sign out, with friendly error messages
- Share a post with a title, a story and a location, chosen by clicking the map or searching a place name
- Profile page with personal info and all the pins you shared, with their dates and a delete option
- Protected pages: sharing a post requires being logged in
- Responsive design with a mobile menu

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| Map | Leaflet.js, OpenStreetMap tiles, Nominatim (place search) |
| Backend | Supabase (Auth + PostgreSQL), no custom server |
| Hosting | Vercel |
| Icons / fonts | Font Awesome, Google Fonts (Alice) |

## Project structure

```
Kindmap/
├── index.html
├── style.css
├── js/
│   ├── supabaseClient.js   # Supabase connection
│   ├── utils.js            # escapeHtml, formatDate
│   ├── auth.js             # sign up / in / out, navbar, route protection
│   ├── map.js              # home map, loads pins from the database
│   ├── addpost.js          # share form, location picker
│   └── profile.js          # user info and own pins
├── pages/
│   ├── about.html
│   ├── addpost.html
│   ├── login.html
│   └── profile.html
└── supabase/
    └── schema.sql          # tables, trigger and Row Level Security policies
```

## Security

- **Row Level Security** is enabled on every table. Anyone can read pins, but a user can only insert, update or delete their own.
- The frontend only uses the public `anon` key. The `service_role` key is never used or committed.
- User-generated text is escaped before being rendered in map popups to prevent XSS.

## Run it locally

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. In the dashboard open **SQL Editor** and run `supabase/schema.sql`.
3. In **Project Settings → API**, copy the Project URL and the `anon` key into `js/supabaseClient.js`:
   ```js
   const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
   ```
4. For local testing, you can turn off **Confirm email** in the Supabase Auth settings.
5. Serve the folder with a local server (for example the VS Code **Live Server** extension, or `npx serve`). Opening the files directly with `file://` is not recommended.

## Deployment

The site is static, so it deploys on Vercel with no build step. After deploying, add your Vercel URL to **Authentication → URL Configuration** in Supabase (Site URL and Redirect URLs).

## Roadmap

- Custom SMTP for email confirmation
- Edit pins, marker clustering for large numbers of pins
- Port to Angular with a feature-based architecture

## Author

**Islem** · Computer science student, Faculté des Sciences de Bizerte

Made with love for people who believe small actions can change the world.
