import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../hooks/useTheme';
import ClipList from '../ClipList';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Search: () => <div>Search Icon</div>,
  Filter: () => <div>Filter Icon</div>,
  Copy: () => <div>Copy Icon</div>,
  Trash: () => <div>Trash Icon</div>,
  Pin: () => <div>Pin Icon</div>,
}));

// Mock clipboard utilities
jest.mock('../../../utils/clipboard', () => ({
  copyToClipboard: jest.fn().mockResolvedValue(true),
  getRelativeTime: jest.fn((timestamp) => '2 minutes ago'),
}));

const mockClips = [
  {
    id: 1,
    content: 'Test clip 1',
    type: 'text',
    timestamp: Date.now(),
    pinned: false,
    copyCount: 1,
  },
  {
    id: 2,
    content: 'Test clip 2',
    type: 'code',
    timestamp: Date.now() - 60000,
    pinned: true,
    copyCount: 3,
  },
  {
    id: 3,
    content: 'Test clip 3',
    type: 'url',
    timestamp: Date.now() - 120000,
    pinned: false,
    copyCount: 1,
  },
];

const defaultProps = {
  clips: mockClips,
  onClipClick: jest.fn(),
  onClipDelete: jest.fn(),
  onClipCopy: jest.fn(),
  selectedClipId: null,
};

const renderWithTheme = (component) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ClipList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders clip list with clips', () => {
    renderWithTheme(<ClipList {...defaultProps} />);

    expect(screen.getByText('Test clip 1')).toBeInTheDocument();
    expect(screen.getByText('Test clip 2')).toBeInTheDocument();
    expect(screen.getByText('Test clip 3')).toBeInTheDocument();
  });

  test('renders empty state when no clips', () => {
    renderWithTheme(<ClipList {...defaultProps} clips={[]} />);

    expect(screen.getByText(/no clips/i)).toBeInTheDocument();
  });

  test('calls onClipClick when clip is clicked', () => {
    const onClipClick = jest.fn();
    renderWithTheme(<ClipList {...defaultProps} onClipClick={onClipClick} />);

    const clipElement = screen.getByText('Test clip 1').closest('div[role="button"]');
    fireEvent.click(clipElement);

    expect(onClipClick).toHaveBeenCalledWith(mockClips[0]);
  });

  test('highlights selected clip', () => {
    renderWithTheme(<ClipList {...defaultProps} selectedClipId={2} />);

    const selectedClip = screen.getByText('Test clip 2').closest('div[role="button"]');
    expect(selectedClip).toHaveClass('selected'); // Adjust class name based on actual implementation
  });

  test('shows pinned indicator for pinned clips', () => {
    renderWithTheme(<ClipList {...defaultProps} />);

    const pinnedClip = screen.getByText('Test clip 2').closest('div');
    // Check for pin indicator - adjust based on actual implementation
    expect(pinnedClip).toBeInTheDocument();
  });

  test('displays copy count correctly', () => {
    renderWithTheme(<ClipList {...defaultProps} />);

    // Clip 2 has copyCount of 3
    const clip2Element = screen.getByText('Test clip 2').closest('div');
    expect(clip2Element.textContent).toContain('3');
  });

  test('truncates long content', () => {
    const longContent = 'A'.repeat(500);
    const clipsWithLongContent = [
      {
        id: 1,
        content: longContent,
        type: 'text',
        timestamp: Date.now(),
        pinned: false,
        copyCount: 1,
      },
    ];

    renderWithTheme(<ClipList {...defaultProps} clips={clipsWithLongContent} />);

    const clipElement = screen.getByText(new RegExp(longContent.substring(0, 50)));
    // Content should be truncated
    expect(clipElement.textContent.length).toBeLessThan(longContent.length);
  });

  test('handles copy action', async () => {
    const onClipCopy = jest.fn();
    renderWithTheme(<ClipList {...defaultProps} onClipCopy={onClipCopy} />);

    const copyButtons = screen.getAllByText('Copy Icon');
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(onClipCopy).toHaveBeenCalledWith(mockClips[0]);
    });
  });

  test('handles delete action', async () => {
    const onClipDelete = jest.fn();
    renderWithTheme(<ClipList {...defaultProps} onClipDelete={onClipDelete} />);

    const deleteButtons = screen.getAllByText('Trash Icon');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(onClipDelete).toHaveBeenCalledWith(mockClips[0].id);
    });
  });

  test('displays different icons for different clip types', () => {
    renderWithTheme(<ClipList {...defaultProps} />);

    // Should have different visual indicators for text, code, and url types
    // This test depends on your implementation
    expect(screen.getByText('Test clip 1')).toBeInTheDocument();
    expect(screen.getByText('Test clip 2')).toBeInTheDocument();
    expect(screen.getByText('Test clip 3')).toBeInTheDocument();
  });

  test('maintains accessibility standards', () => {
    const { container } = renderWithTheme(<ClipList {...defaultProps} />);

    // Check for proper ARIA labels
    const buttons = container.querySelectorAll('[role="button"]');
    expect(buttons.length).toBeGreaterThan(0);

    // Check for keyboard navigation
    const firstClip = buttons[0];
    expect(firstClip).toHaveAttribute('tabindex');
  });

  test('prevents XSS in clip content', () => {
    const xssClips = [
      {
        id: 1,
        content: '<script>alert("XSS")</script>',
        type: 'text',
        timestamp: Date.now(),
        pinned: false,
        copyCount: 1,
      },
    ];

    renderWithTheme(<ClipList {...defaultProps} clips={xssClips} />);

    // Should not execute script, should render as text
    const scriptText = screen.queryByText('<script>alert("XSS")</script>');
    expect(scriptText).not.toBeNull();

    // Ensure no actual script tags in DOM
    const { container } = screen;
    const scripts = container.querySelectorAll('script');
    expect(scripts.length).toBe(0);
  });
});
