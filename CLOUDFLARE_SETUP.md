# Moving melibee.art to Cloudflare Pages

The site now uses clean addresses (melibee.art/contacto instead of
melibee.art/#/contacto). Old "#" links still work: they are converted
automatically when the page opens.

The domain stays registered at **Namecheap**. Only its DNS (nameservers) moves
to Cloudflare. Do the steps in this order so the current site keeps working
until the new one is ready.

## 1. Push the code (from the Mac)

```
cd ~/"Galeria De Flores/melissa-flowers"
yarn update "Clean URLs for Cloudflare Pages"
```

`yarn update` now only pushes to GitHub. It no longer publishes to GitHub
Pages, so melibee.art keeps showing the old site until step 4.

## 2. Create the Cloudflare Pages project

Ideally sign up / sign in at https://dash.cloudflare.com with
**flowersbymelibee@gmail.com** (the business owns it), then invite Icy under
Manage account > Members.

1. **Workers & Pages > Create > Pages > Connect to Git**
2. Connect GitHub and allow access to **PadillaProjects/MelissaFlowers**.
3. Settings:
   - Production branch: `main`
   - Framework preset: **Create React App**
   - Build command: `yarn build`
   - Build output directory: `build`
   (Node 22 is picked up from the `.node-version` file.)
4. **Save and Deploy.** The first build takes a few minutes.
5. Open the `https://<project>.pages.dev` address it gives you and check:
   home page, "Conéctate con nosotros", a test sign-up (alert email arrives),
   /privacidad, /terminos, the cookie notice.
6. To test the admin login on that address, add `<project>.pages.dev` in
   **Firebase > Authentication > Settings > Authorized domains**.

## 3. Move the DNS to Cloudflare

1. Cloudflare dashboard > **Add a domain** > `melibee.art` > **Free** plan.
2. Cloudflare copies the current DNS records. Keep all of them for now
   (including the GitHub Pages ones), especially any **MX** or **TXT** records
   (email, Google verification).
3. Cloudflare shows **two nameservers** (like `xxx.ns.cloudflare.com`).
4. **Namecheap** > Domain List > melibee.art > **Manage** > Nameservers >
   **Custom DNS** > enter the two Cloudflare nameservers > save (green check).
5. Wait for Cloudflare's "melibee.art is now active" email (minutes to 24 h).

## 4. Point melibee.art to the Pages project

1. **Workers & Pages** > the project > **Custom domains** > **Set up a custom domain**
   > `melibee.art`. If Cloudflare says there are conflicting records, let it
   replace them (these are the old GitHub Pages `A` records).
2. Repeat for `www.melibee.art`.
3. HTTPS is set up automatically (can take a few minutes).
4. Check https://melibee.art and https://www.melibee.art in a private window.
5. Make sure `melibee.art` is listed in **Firebase > Authentication > Authorized domains**.

## 5. Turn off GitHub Pages

GitHub > PadillaProjects/MelissaFlowers > **Settings > Pages** > unpublish /
set source to none. After that, `public/CNAME` and the `gh-pages` package can be
removed.

## Links to use from now on

- Sign-up page: https://melibee.art/contacto
- Bouquet card QR: https://melibee.art/contacto?src=bouquet_card
- Privacy: https://melibee.art/privacidad · Terms: https://melibee.art/terminos

Every push to `main` (`yarn update "..."`) publishes automatically in 1–3 minutes.
