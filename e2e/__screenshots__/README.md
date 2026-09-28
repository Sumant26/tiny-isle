# Visual baselines

Screenshots that `e2e/visual.spec.ts` compares against. They must be generated in
CI's Docker image so fonts and rendering match exactly:

**GitHub → Actions → "Update visual baselines" → Run workflow** (pick your branch).

The workflow commits the refreshed `*-visual-linux.png` files back to that branch.
Run it once after setting up the repo, and again whenever you change the look of
the game on purpose. Review the new images in the commit before merging.
