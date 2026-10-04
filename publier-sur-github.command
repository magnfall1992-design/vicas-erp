#!/bin/bash
# Double-cliquez sur ce fichier (macOS) pour publier l'ERP VICAS sur GitHub Pages.
cd "$(dirname "$0")" || exit 1
COMPTE="magnfall1992-design"; DEPOT="vicas-erp"
git init -q -b main 2>/dev/null || git init -q
git add -A && git commit -qm "ERP VICAS — version alpha" 2>/dev/null
if command -v gh >/dev/null 2>&1; then
  gh auth status >/dev/null 2>&1 || gh auth login
  if ! git remote | grep -q origin; then gh repo create "$COMPTE/$DEPOT" --public --source=. --remote=origin --push; else git push -u origin main; fi
  gh api -X POST "repos/$COMPTE/$DEPOT/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || true
  echo ""; echo "Publié. L'application sera en ligne d'ici 1 à 2 minutes :"; echo "https://$COMPTE.github.io/$DEPOT/"
else
  echo "L'outil GitHub (gh) n'est pas installé. Deux options :"
  echo "1) Installer : brew install gh   puis relancer ce fichier."
  echo "2) Créer le dépôt « $DEPOT » sur github.com, puis dans ce dossier :"
  echo "   git remote add origin https://github.com/$COMPTE/$DEPOT.git && git push -u origin main"
  echo "   puis Settings > Pages > Branch : main / root."
fi
read -n 1 -s -r -p "Appuyez sur une touche pour fermer."
