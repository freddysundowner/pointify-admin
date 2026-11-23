# ReggyPOS – Platform Admin

Web dashboard for the platform owner: shops, users, subscriptions and packages,
sales and revenue across all shops, bulk SMS/email, templates and app settings.

It is a React + Express app. The Express server serves the web client and
forwards requests to the ReggyPOS API with the signed-in staff member's token;
it stores no data itself.

## Requirements
- Node.js 18 or newer
- A running ReggyPOS API (see `reggypos_api`)
- A staff account on that API (created on the API's first start from
  `ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` in the API's `.env`)

## Install
```bash
cp .env.example .env      # set REGGYPOS_API_URL and PORT
npm install
npm run build
npm start                 # http://localhost:5050
```

For development with hot reload: `npm run dev`.

Sign in with the API's staff account.

See `../documentation/index.html` for full setup and deployment instructions.
