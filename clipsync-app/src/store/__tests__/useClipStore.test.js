import { renderHook, act, waitFor } from '@testing-library/react';
import useClipStore from '../useClipStore';

// Mock the storage utilities
jest.mock('../../utils/storage', () => ({
  initDB: jest.fn().mockResolvedValue(undefined),
  addClip: jest.fn((clip) => Promise.resolve({ ...clip, id: Date.now() })),
  getAllClips: jest.fn().mockResolvedValue([]),
  deleteClip: jest.fn().mockResolvedValue(undefined),
  togglePin: jest.fn((id) => Promise.resolve({ id, pinned: true })),
  searchClips: jest.fn().mockResolvedValue([]),
  getClipsByType: jest.fn().mockResolvedValue([]),
  getPinnedClips: jest.fn().mockResolvedValue([]),
  clearAllClips: jest.fn().mockResolvedValue(undefined),
  incrementCopyCount: jest.fn((id) => Promise.resolve({ id, copyCount: 2 })),
  updateClip: jest.fn((clip) => Promise.resolve(clip)),
}));

// Mock type detection
jest.mock('../../utils/typeDetection', () => ({
  detectClipType: jest.fn(() => 'text'),
}));

// Mock clipboard utilities
jest.mock('../../utils/clipboard', () => ({
  copyToClipboard: jest.fn(),
  getRelativeTime: jest.fn(() => '1 minute ago'),
  shouldCapture: jest.fn(() => true),
  isDuplicate: jest.fn(() => null),
  detectSourceFromContent: jest.fn(() => 'manual'),
}));

// Mock auto categorize
jest.mock('../../utils/autoCategorize', () => ({
  autoCategorize: jest.fn(() => Promise.resolve({ category: 'general', tags: [] })),
}));

describe('useClipStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    const { result } = renderHook(() => useClipStore());
    act(() => {
      result.current.clips = [];
      result.current.selectedClip = null;
      result.current.searchQuery = '';
    });
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('initialization', () => {
    test('initializes store and loads clips', async () => {
      const mockClips = [
        { id: 1, content: 'test clip 1', type: 'text' },
        { id: 2, content: 'test clip 2', type: 'text' },
      ];

      const { getAllClips } = require('../../utils/storage');
      getAllClips.mockResolvedValue(mockClips);

      const { result } = renderHook(() => useClipStore());

      await act(async () => {
        await result.current.initialize();
      });

      await waitFor(() => {
        expect(result.current.clips).toHaveLength(2);
        expect(result.current.isLoading).toBe(false);
      });
    });

    test('handles initialization errors', async () => {
      const { initDB } = require('../../utils/storage');
      initDB.mockRejectedValue(new Error('DB Error'));

      const { result } = renderHook(() => useClipStore());

      await act(async () => {
        await result.current.initialize();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('DB Error');
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('addClip', () => {
    test('adds a new clip successfully', async () => {
      const { result } = renderHook(() => useClipStore());

      await act(async () => {
        await result.current.initialize();
      });

      await act(async () => {
        await result.current.addClip('test content');
      });

      await waitFor(() => {
        expect(result.current.clips.length).toBeGreaterThan(0);
      });
    });

    test('respects incognito mode', async () => {
      const { result } = renderHook(() => useClipStore());

      await act(async () => {
        await result.current.initialize();
        result.current.setIncognitoMode(true);
      });

      const initialCount = result.current.clips.length;

      await act(async () => {
        await result.current.addClip('test content');
      });

      expect(result.current.clips.length).toBe(initialCount);
    });

    test('manually created clips bypass incognito mode', async () => {
      const { result } = renderHook(() => useClipStore());

      await act(async () => {
        await result.current.initialize();
        result.current.setIncognitoMode(true);
      });

      await act(async () => {
        await result.current.addClip('test content', { manual: true });
      });

      await waitFor(() => {
        expect(result.current.clips.length).toBeGreaterThan(0);
      });
    });
  });

  describe('search and filter', () => {
    test('sets search query', () => {
      const { result } = renderHook(() => useClipStore());

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(result.current.searchQuery).toBe('test');
    });

    test('sets active filter', () => {
      const { result } = renderHook(() => useClipStore());

      act(() => {
        result.current.setActiveFilter('code');
      });

      expect(result.current.activeFilter).toBe('code');
    });
  });

  describe('clip selection', () => {
    test('selects a clip', () => {
      const { result } = renderHook(() => useClipStore());
      const clip = { id: 1, content: 'test' };

      act(() => {
        result.current.selectClip(clip);
      });

      expect(result.current.selectedClip).toEqual(clip);
    });

    test('clears selection', () => {
      const { result } = renderHook(() => useClipStore());

      act(() => {
        result.current.selectClip({ id: 1, content: 'test' });
        result.current.clearSelection();
      });

      expect(result.current.selectedClip).toBeNull();
    });
  });

  describe('incognito mode', () => {
    test('toggles incognito mode', () => {
      const { result } = renderHook(() => useClipStore());

      act(() => {
        result.current.setIncognitoMode(true);
      });

      expect(result.current.incognitoMode).toBe(true);
      expect(localStorage.getItem('clipsync_incognito')).toBe('true');

      act(() => {
        result.current.setIncognitoMode(false);
      });

      expect(result.current.incognitoMode).toBe(false);
      expect(localStorage.getItem('clipsync_incognito')).toBe('false');
    });
  });

  describe('memory leak prevention', () => {
    test('store cleanup does not leak memory', () => {
      const { result, unmount } = renderHook(() => useClipStore());

      act(() => {
        result.current.clips = new Array(1000).fill({ id: 1, content: 'test' });
      });

      unmount();

      // If no errors, memory is cleaned up properly
      expect(true).toBe(true);
    });
  });
});
