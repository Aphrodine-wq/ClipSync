/**
 * ClipCard Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClipCard from '../ClipCard';

describe('ClipCard', () => {
  const mockClip = {
    id: '1',
    content: 'Test content',
    type: 'text',
    pinned: false,
    created_at: new Date().toISOString(),
  };

  test('renders clip content', () => {
    render(<ClipCard clip={mockClip} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('shows pin icon when pinned', () => {
    const pinnedClip = { ...mockClip, pinned: true };
    render(<ClipCard clip={pinnedClip} />);
    expect(screen.getByText('📌')).toBeInTheDocument();
  });

  test('calls onCopy when copy button clicked', () => {
    const onCopy = jest.fn();
    render(<ClipCard clip={mockClip} onCopy={onCopy} />);
    
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    expect(onCopy).toHaveBeenCalledWith(mockClip);
  });
});

