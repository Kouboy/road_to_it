# Road to IT — Atelier du technicien informatique

Site pédagogique et adaptatif pour acquérir les bases du métier de technicien informatique avant la formation OpenClassrooms.

## Contenu actuel

- missions de diagnostic guidé ;
- glossaire enrichi et relié aux explications ;
- fiches mémo imprimables ;
- séances de révision sans répétition immédiate ;
- programme quotidien de 30 missions ;
- renforcement calculé à partir des notions fragiles.

La progression est conservée dans le navigateur avec `localStorage`. Elle reste donc liée à l'appareil et au profil de navigateur utilisés.

## Lancer le site en local

```bash
npm install
npm run dev
```

## Compiler

```bash
npm run build
```

## Publication GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` compile et publie automatiquement le site après chaque mise à jour de la branche `main`.

Pour la première activation : **Settings → Pages → Build and deployment → Source : GitHub Actions**.

L'adresse attendue est : <https://kouboy.github.io/road_to_it/>.
