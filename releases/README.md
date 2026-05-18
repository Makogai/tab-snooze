# Releases

```bash
git tag v1.0.0 && git push origin v1.0.0
gh release create v1.0.0 --title "Tab Snooze v1.0.0" --notes-file releases/v1.0.0.md
```

GitHub Actions attaches `tab-snooze-v*.zip` when the release is published.
