---
{"title": "The loss", "order": 5, "summary": "Turning \"the network is wrong\" into a single number: the gap, the sign problem, squared error and the Mean Squared Error (MSE).", "weeks": [4], "prereq": ["architecture"], "related": ["descente-gradient"], "slides": [{"deck": "maba/w4-1", "label": "W4-1 · Training (1)", "pages": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}], "notions": [{"category": "Learning", "name": "What \"learning\" means here", "explanation": "A loop: **predict** → **compare** with the correct answer → **adjust** the numbers a little → repeat. Learning = adjusting weights so mistakes get smaller, nothing more.", "mnemonic": "Predict, compare, adjust.", "visual": [{"eq": ["Predict", "→", "Compare", "→", "Adjust", "→", "Repeat"]}]}, {"category": "Learning", "name": "Training data", "explanation": "Examples where the **answer is known**: inputs $x$ + **label** $y$. $y$ = correct answer, $\\hat{y}$ = network's answer. Everything is about the gap between the two."}, {"category": "Loss", "name": "The sign problem", "explanation": "Averaging raw differences, $+0.3$ and $-0.3$ **cancel out** → two wrong answers give \"no error\". The sign must go.", "visual": [{"eq": ["+0.3", "+", "−0.3", "=", "0 ?!"]}]}, {"category": "Loss", "name": "Why square the error", "explanation": "1) Removes the sign. 2) **Large mistakes count much more** (error ×9 → square ×81). 3) Gives a **smooth** curve (a slope at every point).", "visual": [{"rows": [{"if": "error × 3", "then": "square × 9"}]}]}, {"category": "Loss", "name": "Mean Squared Error (MSE)", "explanation": "$L = \\frac{1}{N}\\sum (y - \\hat{y})^2$: add the squared errors of all examples, divide by $N$. **One number** stands for performance on the whole dataset."}, {"category": "Loss", "name": "Choosing the loss for the task", "explanation": "Predicting a **quantity** (temperature, size…) → squared error. Choosing a **category** (tumour or not…) → a different loss (later). Same idea: one number that grows when the network is wrong.", "visual": [{"rows": [{"if": "Quantity", "then": "squared error (MSE)"}, {"if": "Category", "then": "a different loss"}]}]}, {"category": "Loss", "name": "The loss depends on the weights", "explanation": "Inputs and labels are **fixed** (data). Only **weights and biases** can change → the loss is a function of the weights."}], "drills": []}
---
## In short

The [[perte|loss]] is **one number that grows when the network is wrong**. Learning means making that number as small as possible by changing the [[poids|weights]].

## The learning loop

<figure class="fig"><svg viewBox="0 0 360 220" role="img"><defs><marker id="m32" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="f-mu"/></marker><marker id="a32" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="f-a"/></marker><marker id="b32" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="f-a2"/></marker></defs><rect x="115.0" y="17.0" width="130" height="50" rx="10" class="soft-a s-a"/><text x="180.0" y="39.0" text-anchor="middle" class="b">Predict</text><text x="180.0" y="56.0" text-anchor="middle" class="mu">network → ŷ</text><rect x="225.0" y="157.0" width="130" height="50" rx="10" class="soft-a2 s-a2"/><text x="290.0" y="179.0" text-anchor="middle" class="b">Compare</text><text x="290.0" y="196.0" text-anchor="middle" class="mu">loss L(y, ŷ)</text><rect x="5.0" y="157.0" width="130" height="50" rx="10" class="soft-ok s-ok"/><text x="70.0" y="179.0" text-anchor="middle" class="b">Adjust</text><text x="70.0" y="196.0" text-anchor="middle" class="mu">w ← w − η·slope</text><line x1="232.0" y1="68.0" x2="276.0" y2="152.0" class="ln" marker-end="url(#m32)"/><line x1="222.0" y1="182.0" x2="138.0" y2="182.0" class="ln" marker-end="url(#m32)"/><line x1="84.0" y1="155.0" x2="128.0" y2="70.0" class="ln" marker-end="url(#m32)"/><text x="180.0" y="128.0" text-anchor="middle" class="mu">repeat</text></svg><figcaption>Learning = a loop, nothing more.</figcaption></figure>

We learn from [[donnees-entrainement|training data]]: inputs with their correct answer, the [[etiquette|label]] $y$. The network gives $\hat y$; everything is about the gap $y - \hat y$.

## From a plain gap to a square

- Averaging raw gaps: $+0.3$ and $-0.3$ **cancel out** → "no error" although everything is wrong.
- We **square** it: no sign, big mistakes weigh much more (×3 → ×9), and the curve is **smooth** (a [[pente|slope]] at every point).

## Mean Squared Error

$$
L = \frac{1}{N}\sum_{i=1}^{N} (y_i - \hat{y}_i)^2
$$

| $y$ | $\hat{y}$ | gap | squared |
|---|---|---|---|
| 1 | 0.68 | 0.32 | 0.1024 |
| 0 | 0.30 | −0.30 | 0.0900 |
| 1 | 0.90 | 0.10 | 0.0100 |
| 0 | 0.20 | −0.20 | 0.0400 |

Total 0.2424 → [[mse|MSE]] $= 0.0606$: one number for the whole dataset.

## Choosing the loss

- Predicting a **quantity** (temperature, size) → squared error.
- Choosing a **category** (tumour or not) → a different loss, later in the course.

## What we can change

Inputs and labels are **fixed**. Only weights and biases move: the loss is therefore a **function of the weights**. To lower it → [[descente-gradient]].

## Pitfalls

- Never average gaps that haven't been squared.
- $y$ = correct answer (given), $\hat y$ = prediction (computed).
- MSE suits quantities, not necessarily categories.

## Key takeaways

- Loss = one number, large when wrong.
- MSE = mean of squared errors.
- The loss depends on the weights → they're what we adjust.
