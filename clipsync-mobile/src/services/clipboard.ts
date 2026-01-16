/**
 * Clipboard Service
 * Handles clipboard monitoring and management on mobile
 */

import Clipboard from '@react-native-clipboard/clipboard';
import { Platform } from 'react-native';
import { useClipStore } from '../store/useClipStore';

class ClipboardService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastClipboardContent: string = '';
  private isMonitoring: boolean = false;

  /**
   * Start monitoring clipboard changes
   */
  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    
    // Check clipboard every 500ms (iOS) or 300ms (Android)
    const interval = Platform.OS === 'ios' ? 500 : 300;
    
    this.monitoringInterval = setInterval(async () => {
      try {
        const content = await Clipboard.getString();
        
        if (content && content !== this.lastClipboardContent) {
          this.lastClipboardContent = content;
          
          // Add clip to store
          const { addClip } = useClipStore.getState();
          await addClip(content, {
            source: Platform.OS,
            manual: false,
          });
        }
      } catch (error) {
        console.error('Clipboard monitoring error:', error);
      }
    }, interval);
  }

  /**
   * Stop monitoring clipboard changes
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Copy text to clipboard
   */
  async copy(text: string): Promise<boolean> {
    try {
      await Clipboard.setString(text);
      this.lastClipboardContent = text;
      return true;
    } catch (error) {
      console.error('Copy error:', error);
      return false;
    }
  }

  /**
   * Get current clipboard content
   */
  async getContent(): Promise<string> {
    try {
      return await Clipboard.getString();
    } catch (error) {
      console.error('Get clipboard error:', error);
      return '';
    }
  }

  /**
   * Check if clipboard has content
   */
  async hasContent(): Promise<boolean> {
    const content = await this.getContent();
    return content.length > 0;
  }
}

export const clipboardService = new ClipboardService();

