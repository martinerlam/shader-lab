# Fluid Cubes ShaderLab — pages-0.1.1

Pages-ready shader-first scaffold (no bundler).

## Deploy to GitHub Pages

1. Commit everything (repo root contains `index.html` and `diagnostic.html`)
2. In GitHub: Settings → Pages
3. Source: Deploy from a branch
4. Branch: `main` (or your default), Folder: `/ (root)`
5. Save

Your site will serve:
- `/` → `index.html`
- `/diagnostic.html` → diagnostic page

## Local run

```bash
python3 -m http.server 8000
```

Open:
- http://localhost:8000/
- http://localhost:8000/diagnostic.html

## Logo

Place `Renderheads Logos-02.png` in the repo root (same level as `index.html`).
If missing, it auto-hides.

## Notes

Three.js is loaded from unpkg (internet required).
