/**
 * Slack Integration
 * Share clips to Slack channels
 */

const axios = require('axios');

class SlackIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.apiUrl = 'https://slack.com/api';
  }

  /**
   * Share clip to Slack channel
   */
  async shareClip(clip, channelId, options = {}) {
    try {
      const message = {
        channel: channelId,
        text: options.message || 'Clip from ClipSync',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${clip.type}*\n\`\`\`${clip.content.substring(0, 2000)}\`\`\``,
            },
          },
        ],
      };

      if (options.threadTs) {
        message.thread_ts = options.threadTs;
      }

      const response = await axios.post(
        `${this.apiUrl}/chat.postMessage`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error('Slack share error:', error);
      throw error;
    }
  }

  /**
   * List channels
   */
  async listChannels() {
    try {
      const response = await axios.get(`${this.apiUrl}/conversations.list`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        params: {
          types: 'public_channel,private_channel',
        },
      });

      if (!response.data.ok) {
        throw new Error(response.data.error);
      }

      return response.data.channels;
    } catch (error) {
      console.error('Slack list channels error:', error);
      throw error;
    }
  }
}

module.exports = SlackIntegration;

