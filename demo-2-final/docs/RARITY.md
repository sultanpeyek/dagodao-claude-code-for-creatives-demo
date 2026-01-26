# Rarity System

Configuration lives in `config/rarity.js`.

## Trait Selection

- Weight-based selection (higher weight = more common)
- Each trait has a tier assignment: common, uncommon, rare, legendary

## Scoring

| Tier | Points |
|------|--------|
| Common | 1 |
| Uncommon | 2 |
| Rare | 4 |
| Legendary | 10 |

## Overall Tier Thresholds

| Tier | Score Range |
|------|-------------|
| Common | < 6 |
| Uncommon | 6-11 |
| Rare | 12-19 |
| Epic | 20-29 |
| Legendary | 30+ |
