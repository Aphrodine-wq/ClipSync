# ClipSync Integrations

Integrations with popular tools and services.

## Slack

Share clips directly to Slack channels.

```javascript
const SlackIntegration = require('./slack/src');
const slack = new SlackIntegration(accessToken);
await slack.shareClip(clip, channelId);
```

## GitHub

Create gists and comment on issues/PRs.

```javascript
const GitHubIntegration = require('./github/src');
const github = new GitHubIntegration(accessToken);
await github.createGist(clip);
```

## Notion

Save clips to Notion pages (coming soon).

## Discord

Share clips to Discord servers (coming soon).

