# Pointify – Platform Admin

Web dashboard for the platform owner: shops, users, subscriptions and packages,
sales and revenue across all shops, bulk SMS/email, templates and app settings.
The Express server serves the web client and forwards requests to the Pointify
API with the signed-in staff member's token; it stores no data itself.

```bash
cp .env.example .env      # POINTIFY_API_URL, PORT, HOST
npm install
npm run build
npm start                 # production
npm run dev               # development with hot reload
```

Sign in with a staff account of the Pointify API.
