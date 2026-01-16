/**
 * GitHub Integration
 * Create gists and share to issues/PRs
 */

const axios = require('axios');

class GitHubIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.apiUrl = 'https://api.github.com';
  }

  /**
   * Create gist from clip
   */
  async createGist(clip, options = {}) {
    try {
      const files = {};
      const filename = options.filename || `clip-${clip.id}.${getExtension(clip.type)}`;
      files[filename] = {
        content: clip.content,
      };

      const response = await axios.post(
        `${this.apiUrl}/gists`,
        {
          description: options.description || `ClipSync clip: ${clip.type}`,
          public: options.public || false,
          files,
        },
        {
          headers: {
            'Authorization': `token ${this.accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('GitHub gist creation error:', error);
      throw error;
    }
  }

  /**
   * Comment on issue/PR
   */
  async commentOnIssue(owner, repo, issueNumber, clip) {
    try {
      const body = `ClipSync clip:\n\n\`\`\`${clip.type}\n${clip.content.substring(0, 65536)}\n\`\`\``;

      const response = await axios.post(
        `${this.apiUrl}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
        { body },
        {
          headers: {
            'Authorization': `token ${this.accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('GitHub comment error:', error);
      throw error;
    }
  }
}

function getExtension(type) {
  const extensions = {
    code: 'js',
    json: 'json',
    text: 'txt',
    html: 'html',
    css: 'css',
    python: 'py',
    java: 'java',
  };
  return extensions[type] || 'txt';
}

module.exports = GitHubIntegration;

