# ViralRestore

**Restore old & blurry photos → Generate high-performing viral captions + ad copy instantly.**

- 100% client-side image enhancement (ESRGAN via UpscalerJS) — private & free
- Cloudflare Workers AI (Llama 3.2 11B Vision) for captions
- Beautiful before/after slider
- Viral captions + Ad captions + Hashtags
- Ready for English-speaking audiences

**Repo:** https://github.com/netvidit87/viralrestore

---

## Project Structure

```
viralrestore/
├── public/
│   └── index.html          # Frontend (static) - ADD THIS FILE
├── worker/
│   ├── src/
│   │   └── index.js        # Cloudflare Worker (already uploaded)
│   └── wrangler.toml     # already uploaded
└── README.md
```

---

## Important: Add the Frontend File

The main frontend file (`public/index.html`) is large. Please download the zip from our conversation and upload `public/index.html` to the repo (create the `public` folder and put the file inside).

Or copy the content from the zip I provided earlier.

---

## Deploy Worker (AI Backend)

```bash
cd worker
npx wrangler login
npx wrangler deploy
```

Copy the Worker URL that appears (example: `https://viralrestore-ai.xxxxx.workers.dev`).

---

## Deploy Frontend (Cloudflare Pages)

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. Select repo **viralrestore**
3. Settings:
   - Framework preset: None
   - Root directory: `public`
   - Build command: (empty)
   - Build output directory: `/`
4. Deploy

---

## Connect Frontend to Worker

After both are deployed, edit `public/index.html`, find:

```js
const WORKER_URL = "https://viralrestore-ai.YOUR_SUBDOMAIN.workers.dev";
```

Replace with your real Worker URL, then commit & push.

---

## Test

Open the Pages URL → Upload 1-3 blurry photos → Enjoy before/after + viral + ad captions.

Built for maximum quality with zero ongoing cost.
