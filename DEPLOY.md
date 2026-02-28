# Deploy to www.raghavsrinath.com (Namecheap + Vercel)

Follow these steps to put your site live on your Namecheap domain.

---

## What's already done in the repo

- **vercel.json** – Redirects `raghavsrinath.com` → `www.raghavsrinath.com` once DNS is set up.
- Project is ready to deploy (build works).

---

## Part 1: Push to GitHub (you do this once)

1. Create a repo at [github.com/new](https://github.com/new) (e.g. name: `personal-site`).
2. In Terminal, from your project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/personal-site.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. If the repo already exists and you've pushed before, skip to Part 2.

---

## Part 2: Deploy on Vercel (you do this once)

1. Go to **[vercel.com](https://vercel.com)** and sign in with **GitHub**.
2. Click **Add New…** → **Project**.
3. **Import** your `personal-site` (or whatever you named it) repo.
4. Leave **Framework Preset**: Next.js and **Build Command**: `next build` as-is.
5. Click **Deploy**. Wait until the build finishes. You'll get a URL like `personal-site-xxx.vercel.app` — that's your live site.

---

## Part 3: Add domain in Vercel (you do this once)

1. In Vercel, open your project.
2. Go to **Settings** → **Domains**.
3. Under "Add", type: **www.raghavsrinath.com** and press Enter.
4. (Optional) Also add **raghavsrinath.com** (no www) so the root domain works.
5. Vercel will show DNS instructions. Keep that tab open; you'll use it in Part 4.

---

## Part 4: Namecheap DNS (you do this once)

You need to point your domain to Vercel. All of this is done in Namecheap.

### 4.1 Open DNS in Namecheap

1. Log in at **[namecheap.com](https://www.namecheap.com)**.
2. Click **Domain List** (top right).
3. Find **raghavsrinath.com** and click **Manage**.
4. Open the **Advanced DNS** tab.

### 4.2 Add record for www (required)

Add a CNAME so **www.raghavsrinath.com** goes to Vercel:

1. Under **Host Records**, click **Add New Record**.
2. Set:
   - **Type:** `CNAME Record`
   - **Host:** `www`
   - **Value:** `cname.vercel-dns.com`
   - **TTL:** `Automatic` (or `300 min`)

3. Save (checkmark or Save All Changes).

### 4.3 Add record for root domain (optional)

So **raghavsrinath.com** (no www) also works:

1. Click **Add New Record** again.
2. Set:
   - **Type:** `A Record`
   - **Host:** `@`
   - **Value:** `76.76.21.21`
   - **TTL:** `Automatic` (or `300 min`)

3. Save.

### 4.4 Remove conflicting records (if any)

- If you see an existing **A Record** or **CNAME** for `@` that points somewhere else (e.g. Namecheap parking), remove it or replace it with the A record above.
- Leave **URL Redirect** or **CNAME** for `www` only if you're sure it points to `cname.vercel-dns.com`; otherwise use the CNAME in 4.2.

---

## Part 5: Wait for DNS and SSL

1. Back in **Vercel → Settings → Domains**, check that **www.raghavsrinath.com** (and **raghavsrinath.com** if you added it) show as **Verified**. This can take from a few minutes up to 24–48 hours.
2. Vercel will issue an SSL certificate automatically. Once it's done, the padlock will show and the site will be served over HTTPS.

---

## Summary

| Step | Where | What you do |
|------|--------|-------------|
| 1 | GitHub | Create repo, push code |
| 2 | Vercel | Import repo, deploy |
| 3 | Vercel | Add domains: www.raghavsrinath.com (and raghavsrinath.com if you want) |
| 4 | Namecheap | Advanced DNS: CNAME `www` → `cname.vercel-dns.com`, and optionally A `@` → `76.76.21.21` |
| 5 | Vercel | Wait for "Verified" and SSL |

After that, **www.raghavsrinath.com** (and **raghavsrinath.com** if you set the A record) will show your site, and the redirect in **vercel.json** will send root to www.

---

## Future updates

Edit your site locally, then:

```bash
git add .
git commit -m "Describe your change"
git push
```

Vercel will rebuild and update the live site automatically.
