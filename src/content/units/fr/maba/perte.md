---
{"title": "La perte (loss)", "order": 5, "summary": "Transformer « le réseau se trompe » en un seul nombre : écart, problème du signe, erreur au carré et erreur quadratique moyenne (MSE).", "weeks": [4], "prereq": ["architecture"], "related": ["descente-gradient"], "slides": [{"deck": "maba/w4-1", "label": "W4-1 · Entraînement (1)", "pages": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}], "notions": [{"category": "Apprentissage", "name": "Ce que « apprendre » veut dire ici", "explanation": "Une boucle : **prédire** → **comparer** à la bonne réponse → **ajuster** un peu les nombres → recommencer. Apprendre = ajuster les poids pour que les erreurs diminuent, rien de plus.", "mnemonic": "Prédire, comparer, ajuster.", "visual": [{"eq": ["Prédire", "→", "Comparer", "→", "Ajuster", "→", "Répéter"]}]}, {"category": "Apprentissage", "name": "Données d'entraînement", "explanation": "Des exemples dont la **réponse est connue** : entrées $x$ + **étiquette** $y$ (label). $y$ = bonne réponse, $\\hat{y}$ = réponse du réseau. Tout repose sur l'écart entre les deux."}, {"category": "Perte", "name": "Problème du signe", "explanation": "Si on fait la moyenne des écarts bruts, $+0.3$ et $-0.3$ **s'annulent** → deux mauvaises réponses donnent « aucune erreur ». Il faut enlever le signe.", "visual": [{"eq": ["+0.3", "+", "−0.3", "=", "0 ?!"]}]}, {"category": "Perte", "name": "Pourquoi mettre l'erreur au carré", "explanation": "1) Enlève le signe. 2) Les **grosses erreurs comptent beaucoup plus** (erreur ×9 → carré ×81). 3) Donne une courbe **lisse** (une pente en chaque point).", "visual": [{"rows": [{"if": "erreur × 3", "then": "carré × 9"}]}]}, {"category": "Perte", "name": "Erreur quadratique moyenne (MSE)", "explanation": "$L = \\frac{1}{N}\\sum (y - \\hat{y})^2$ : on additionne les erreurs au carré de tous les exemples puis on divise par $N$. **Un seul nombre** résume la performance sur tout le jeu de données."}, {"category": "Perte", "name": "Choisir la perte selon la tâche", "explanation": "Prédire une **quantité** (température, taille…) → erreur au carré. Choisir une **catégorie** (tumeur ou non…) → une autre perte (vue plus tard). Même idée : un nombre qui grandit quand le réseau se trompe.", "visual": [{"rows": [{"if": "Quantité", "then": "erreur au carré (MSE)"}, {"if": "Catégorie", "then": "une autre perte"}]}]}, {"category": "Perte", "name": "La perte dépend des poids", "explanation": "Les entrées et les étiquettes sont **fixes** (données). Seuls les **poids et biais** peuvent changer → la perte est une fonction des poids."}], "drills": []}
---
## En bref

La [[perte]] est **un nombre qui grandit quand le réseau se trompe**. Apprendre, c'est rendre ce nombre le plus petit possible en changeant les [[poids]].

## La boucle d'apprentissage

<figure class="fig"><svg viewBox="0 0 360 220" role="img"><defs><marker id="m31" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="f-mu"/></marker><marker id="a31" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="f-a"/></marker><marker id="b31" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="f-a2"/></marker></defs><rect x="115.0" y="17.0" width="130" height="50" rx="10" class="soft-a s-a"/><text x="180.0" y="39.0" text-anchor="middle" class="b">Prédire</text><text x="180.0" y="56.0" text-anchor="middle" class="mu">réseau → ŷ</text><rect x="225.0" y="157.0" width="130" height="50" rx="10" class="soft-a2 s-a2"/><text x="290.0" y="179.0" text-anchor="middle" class="b">Comparer</text><text x="290.0" y="196.0" text-anchor="middle" class="mu">perte L(y, ŷ)</text><rect x="5.0" y="157.0" width="130" height="50" rx="10" class="soft-ok s-ok"/><text x="70.0" y="179.0" text-anchor="middle" class="b">Ajuster</text><text x="70.0" y="196.0" text-anchor="middle" class="mu">w ← w − η·pente</text><line x1="232.0" y1="68.0" x2="276.0" y2="152.0" class="ln" marker-end="url(#m31)"/><line x1="222.0" y1="182.0" x2="138.0" y2="182.0" class="ln" marker-end="url(#m31)"/><line x1="84.0" y1="155.0" x2="128.0" y2="70.0" class="ln" marker-end="url(#m31)"/><text x="180.0" y="128.0" text-anchor="middle" class="mu">répéter</text></svg><figcaption>Apprendre = une boucle, rien de plus.</figcaption></figure>

On apprend à partir de [[donnees-entrainement|données d'entraînement]] : des entrées avec leur bonne réponse, l'[[etiquette]] $y$. Le réseau donne $\hat y$ ; tout repose sur l'écart $y - \hat y$.

## Du simple écart au carré

- Moyenne des écarts bruts : $+0.3$ et $-0.3$ **s'annulent** → « aucune erreur » alors que tout est faux.
- On met au **carré** : plus de signe, les grosses erreurs pèsent beaucoup plus (×3 → ×9), et la courbe est **lisse** (une [[pente]] en chaque point).

## Erreur quadratique moyenne

$$
L = \frac{1}{N}\sum_{i=1}^{N} (y_i - \hat{y}_i)^2
$$

| $y$ | $\hat{y}$ | écart | carré |
|---|---|---|---|
| 1 | 0.68 | 0.32 | 0.1024 |
| 0 | 0.30 | −0.30 | 0.0900 |
| 1 | 0.90 | 0.10 | 0.0100 |
| 0 | 0.20 | −0.20 | 0.0400 |

Total 0.2424 → [[mse|MSE]] $= 0.0606$ : un seul nombre pour tout le jeu de données.

## Choisir la perte

- Prédire une **quantité** (température, taille) → erreur au carré.
- Choisir une **catégorie** (tumeur ou non) → une autre perte, vue plus tard.

## Ce qu'on peut changer

Les entrées et les étiquettes sont **fixes**. Seuls les poids et les biais bougent : la perte est donc une **fonction des poids**. Pour la faire baisser → [[descente-gradient]].

## Pièges

- Ne jamais moyenner des écarts non élevés au carré.
- $y$ = bonne réponse (donnée), $\hat y$ = prédiction (calculée).
- La MSE convient aux quantités, pas forcément aux catégories.

## À retenir

- Perte = un nombre, grand quand on se trompe.
- MSE = moyenne des erreurs au carré.
- La perte dépend des poids → c'est eux qu'on ajuste.
