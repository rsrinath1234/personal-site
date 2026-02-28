# Your Personal Site

A warm, journal-style personal site with:
- Public homepage with bio
- Blog with password-gated private posts
- Projects page
- Consulting inquiry form

---

## First-time setup (do this once)

### 1. Install tools

Open Terminal (Cmd + Space, type "Terminal").

Install Homebrew:
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install Node.js:
```
brew install node
```

### 2. Install dependencies

Navigate to this folder in Terminal:
```
cd path/to/personal-site
```
(Tip: type `cd ` then drag the folder from Finder into Terminal)

Then run:
```
npm install
```

### 3. Run locally

```
npm run dev
```

Open your browser to http://localhost:3000 — your site is running!

---

## Customizing the site

### Change your name
- Open `components/Nav.tsx` — change "Your Name"
- Open `components/Footer.tsx` — change "Your Name"
- Open `pages/index.tsx` — update the hero text and bio

### Change the private blog password
- Open `pages/blog/[slug].tsx`
- Find: `const BLOG_PASSWORD = 'bangalore2025'`
- Change it to whatever you want

### Add a new blog post
1. Create a new file in the `posts/` folder, e.g. `posts/my-new-post.md`
2. Start the file with this header:
```
---
title: "Your Post Title"
date: "2026-03-01"
excerpt: "One sentence description."
private: false
---

Your content here...
```
3. Set `private: true` to make it password-protected
4. Save — it appears on the site automatically

### Add a project
- Open `pages/projects.tsx`
- Find the `projects` array at the top
- Copy one of the existing objects and fill in your details
- Status options: `active`, `complete`, `ongoing`

### Set up the consulting form
1. Go to formspree.io and create a free account
2. Create a new form
3. Copy your form ID (looks like `xpwzabcd`)
4. Open `pages/consulting.tsx`
5. Find: `https://formspree.io/f/YOUR_FORM_ID`
6. Replace `YOUR_FORM_ID` with yours
7. Form submissions will now email you directly

---

## Deploying to the internet

### 1. Push to GitHub
- Create a free account at github.com
- Create a new repository called `personal-site`
- Follow GitHub's instructions to push your code

### 2. Deploy on Vercel
- Go to vercel.com and sign up with your GitHub account
- Click "Add New Project"
- Select your `personal-site` repository
- Click Deploy — that's it!

### 3. Connect your domain
- In Vercel, go to your project Settings → Domains
- Add your domain name
- Vercel will give you DNS records to add at your domain registrar (Namecheap, etc.)
- Usually live within a few minutes

---

## Day-to-day use

To add a new post: create a `.md` file in `posts/`, push to GitHub, Vercel auto-deploys.

That's it!
