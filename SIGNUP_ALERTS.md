# Sign-up email alerts

Every time someone submits the "Conéctate con nosotros" form, an alert email
goes to **flowersbymelibee@gmail.com** with the person's info and a one-tap
**"Enviar confirmación por WhatsApp"** button (the right confirmation message
is already typed, matching the boxes they checked).

How it works: the form saves the sign-up in Firebase first, then sends a copy to
a small Google Apps Script (`scripts/signup-alerts/Code.gs`) that runs in the
flowersbymelibee@gmail.com account and sends the email from that account.
If the alert ever fails, the sign-up is still saved in Firebase.

## One-time setup (about 10 minutes)

1. Sign in to **flowersbymelibee@gmail.com** and open https://script.google.com
2. **New project**, name it `Flowers by Melibee - alertas de registro`.
3. Delete the sample code, paste everything from `scripts/signup-alerts/Code.gs`, click **Save**.
4. Test it: choose **testAlert** in the function menu at the top, click **Run**.
   Google asks for permission the first time ("send email as you"): **Review permissions** →
   choose flowersbymelibee@gmail.com → **Advanced** → **Go to ... (unsafe)** → **Allow**.
   (It says "unsafe" only because it is your own script and not reviewed by Google.)
   A sample alert marked [PRUEBA] should arrive in the inbox.
5. **Deploy → New deployment** → gear icon → **Web app**
   - Description: `v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
   → **Deploy** → copy the **Web app URL** (ends in `/exec`).
6. In `src/pages/ClubPage.js`, paste that URL into `NOTIFY_URL = "..."`.
7. Test on `yarn start` → `localhost:3000/contacto`, then publish with `yarn update`.

## Changing the script later

Edit the code in script.google.com, then **Deploy → Manage deployments** → pencil icon →
Version: **New version** → **Deploy**. The URL stays the same, so the website doesn't change.

## Limits

- Gmail lets a regular account send about 100 emails a day; the script also caps alerts at 30 per hour.
- "Who has access: Anyone" is required so the website can reach it. The script only accepts the
  form's fields, checks them, and only ever emails flowersbymelibee@gmail.com.
