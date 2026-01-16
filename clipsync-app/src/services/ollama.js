// Ollama AI service for local AI features

const OLLAMA_BASE_URL = 'http://localhost:11434';

class OllamaService {
  constructor() {
    this.baseURL = OLLAMA_BASE_URL;
    this.connected = false;
    this.model = 'llama3.2:3b'; // Default model
  }

  // Check if Ollama is running
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        this.connected = true;
        return {
          connected: true,
          models: data.models || [],
        };
      }
      
      this.connected = false;
      return { connected: false, models: [] };
    } catch (error) {
      console.error('Ollama connection check failed:', error);
      this.connected = false;
      return { connected: false, models: [] };
    }
  }

  // Set the model to use
  setModel(modelName) {
    this.model = modelName;
  }

  // Generate text with Ollama
  async generate(prompt, options = {}) {
    if (!this.connected) {
      throw new Error('Ollama is not connected. Please start Ollama first.');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || this.model,
          prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            ...options.modelOptions,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Ollama generation failed');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw error;
    }
  }

  // Summarize text
  async summarize(text, maxLength = 100) {
    const prompt = `Summarize the following text in ${maxLength} characters or less. Be concise and capture the key points:\n\n${text}\n\nSummary:`;
    
    try {
      const summary = await this.generate(prompt, {
        temperature: 0.5,
        modelOptions: {
          num_predict: Math.ceil(maxLength / 4), // Rough token estimate
        },
      });
      
      return summary.trim();
    } catch (error) {
      console.error('Summarization error:', error);
      throw error;
    }
  }

  // Categorize clip content
  async categorize(text) {
    const prompt = `Analyze the following text and categorize it into ONE of these categories: code, documentation, configuration, data, note, url, command, or other.

Text: ${text.substring(0, 500)}

Category (respond with just the category name):`;

    try {
      const category = await this.generate(prompt, {
        temperature: 0.3,
        modelOptions: {
          num_predict: 10,
        },
      });
      
      return category.trim().toLowerCase();
    } catch (error) {
      console.error('Categorization error:', error);
      throw error;
    }
  }

  // Extract key information
  async extractKeyInfo(text) {
    const prompt = `Extract the most important information from this text as bullet points (max 3 points):

${text}

Key points:`;

    try {
      const keyInfo = await this.generate(prompt, {
        temperature: 0.5,
        modelOptions: {
          num_predict: 150,
        },
      });
      
      return keyInfo.trim();
    } catch (error) {
      console.error('Key info extraction error:', error);
      throw error;
    }
  }

  // Detect duplicates with semantic similarity
  async findSimilar(text, clipList) {
    // This is a simplified version - in production, you'd use embeddings
    const prompt = `Compare this text with the following clips and identify which ones are semantically similar (not just exact matches):

Target text: ${text.substring(0, 200)}

Clips to compare:
${clipList.map((clip, i) => `${i + 1}. ${clip.content.substring(0, 100)}`).join('\n')}

List the numbers of similar clips (comma-separated, or "none"):`;

    try {
      const result = await this.generate(prompt, {
        temperature: 0.3,
        modelOptions: {
          num_predict: 50,
        },
      });
      
      // Parse the result to get clip indices
      const matches = result.match(/\d+/g);
      if (matches) {
        return matches.map(n => parseInt(n) - 1).filter(i => i >= 0 && i < clipList.length);
      }
      
      return [];
    } catch (error) {
      console.error('Similarity detection error:', error);
      return [];
    }
  }

  // Generate tags for a clip
  async generateTags(text, maxTags = 5) {
    const prompt = `Generate ${maxTags} relevant tags for this content. Return only the tags, comma-separated:

${text.substring(0, 300)}

Tags:`;

    try {
      const tagsText = await this.generate(prompt, {
        temperature: 0.5,
        modelOptions: {
          num_predict: 50,
        },
      });
      
      const tags = tagsText
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
        .slice(0, maxTags);
      
      return tags;
    } catch (error) {
      console.error('Tag generation error:', error);
      throw error;
    }
  }

  // Suggest improvements for code
  async suggestCodeImprovements(code) {
    const prompt = `Review this code and suggest 2-3 quick improvements:

\`\`\`
${code}
\`\`\`

Suggestions:`;

    try {
      const suggestions = await this.generate(prompt, {
        temperature: 0.7,
        modelOptions: {
          num_predict: 200,
        },
      });
      
      return suggestions.trim();
    } catch (error) {
      console.error('Code improvement error:', error);
      throw error;
    }
  }

  // Explain code
  async explainCode(code) {
    const prompt = `Explain what this code does in simple terms:

\`\`\`
${code}
\`\`\`

Explanation:`;

    try {
      const explanation = await this.generate(prompt, {
        temperature: 0.5,
        modelOptions: {
          num_predict: 150,
        },
      });
      
      return explanation.trim();
    } catch (error) {
      console.error('Code explanation error:', error);
      throw error;
    }
  }

  // Smart search with semantic understanding
  async semanticSearch(query, clips) {
    const prompt = `Given this search query: "${query}"

Find the most relevant clips from this list (return clip numbers, comma-separated):

${clips.map((clip, i) => `${i + 1}. ${clip.content.substring(0, 100)}`).join('\n')}

Relevant clip numbers:`;

    try {
      const result = await this.generate(prompt, {
        temperature: 0.3,
        modelOptions: {
          num_predict: 50,
        },
      });
      
      const matches = result.match(/\d+/g);
      if (matches) {
        return matches.map(n => parseInt(n) - 1).filter(i => i >= 0 && i < clips.length);
      }
      
      return [];
    } catch (error) {
      console.error('Semantic search error:', error);
      return [];
    }
  }

  // Check if connected
  isConnected() {
    return this.connected;
  }

  // Get available models
  async getModels() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.models || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }

  // Pull a model
  async pullModel(modelName) {
    try {
      const response = await fetch(`${this.baseURL}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to pull model');
      }

      return true;
    } catch (error) {
      console.error('Model pull error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const ollamaService = new OllamaService();

export default ollamaService;
