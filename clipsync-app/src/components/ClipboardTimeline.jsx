/**
 * ClipboardTimeline Component
 * Visual timeline scrubber for clipboard history
 */

import React, { useState, useRef, useEffect } from 'react';
import './ClipboardTimeline.css';

export default function ClipboardTimeline({ clips, onSelectClip }) {
  const [selectedTime, setSelectedTime] = useState(null);
  const [hoveredTime, setHoveredTime] = useState(null);
  const timelineRef = useRef(null);
  const isDragging = useRef(false);

  // Get time range
  const timeRange = clips.length > 0 ? {
    start: new Date(clips[clips.length - 1].created_at),
    end: new Date(clips[0].created_at),
  } : null;

  const handleTimelineClick = (e) => {
    if (!timelineRef.current || !timeRange) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;

    const time = new Date(
      timeRange.start.getTime() +
      (timeRange.end.getTime() - timeRange.start.getTime()) * percentage
    );

    setSelectedTime(time);
    findClipsAtTime(time);
  };

  const handleMouseMove = (e) => {
    if (!timelineRef.current || !timeRange || isDragging.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));

    const time = new Date(
      timeRange.start.getTime() +
      (timeRange.end.getTime() - timeRange.start.getTime()) * percentage
    );

    setHoveredTime(time);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const findClipsAtTime = (time) => {
    // Find closest clip to selected time
    const closest = clips.reduce((prev, curr) => {
      const prevDiff = Math.abs(new Date(prev.created_at) - time);
      const currDiff = Math.abs(new Date(curr.created_at) - time);
      return currDiff < prevDiff ? curr : prev;
    });

    if (onSelectClip) {
      onSelectClip(closest);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [clips, timeRange]);

  if (!timeRange || clips.length === 0) {
    return <div className="timeline-empty">No clips to display</div>;
  }

  // Calculate clip positions
  const clipMarkers = clips.map((clip) => {
    const clipTime = new Date(clip.created_at);
    const percentage =
      ((clipTime - timeRange.start) / (timeRange.end - timeRange.start)) * 100;
    return { clip, percentage };
  });

  const selectedPercentage = selectedTime
    ? ((selectedTime - timeRange.start) / (timeRange.end - timeRange.start)) * 100
    : null;

  return (
    <div className="clipboard-timeline">
      <div className="timeline-header">
        <div className="timeline-time">
          {selectedTime
            ? selectedTime.toLocaleString()
            : hoveredTime
            ? hoveredTime.toLocaleString()
            : 'Hover to see time'}
        </div>
        <div className="timeline-range">
          {timeRange.start.toLocaleDateString()} - {timeRange.end.toLocaleDateString()}
        </div>
      </div>

      <div
        ref={timelineRef}
        className="timeline-track"
        onClick={handleTimelineClick}
        onMouseMove={handleMouseMove}
      >
        {/* Clip markers */}
        {clipMarkers.map(({ clip, percentage }, index) => (
          <div
            key={clip.id}
            className={`timeline-marker ${clip.pinned ? 'pinned' : ''}`}
            style={{ left: `${percentage}%` }}
            title={new Date(clip.created_at).toLocaleString()}
          />
        ))}

        {/* Selected time indicator */}
        {selectedPercentage !== null && (
          <div
            className="timeline-selected"
            style={{ left: `${selectedPercentage}%` }}
          />
        )}

        {/* Hover indicator */}
        {hoveredTime && selectedPercentage === null && (
          <div
            className="timeline-hover"
            style={{ left: `${((hoveredTime - timeRange.start) / (timeRange.end - timeRange.start)) * 100}%` }}
          />
        )}

        {/* Timeline scrubber */}
        <div className="timeline-scrubber" />
      </div>

      <div className="timeline-controls">
        <button
          onClick={() => {
            const now = new Date();
            setSelectedTime(now);
            findClipsAtTime(now);
          }}
          className="control-btn"
        >
          Now
        </button>
        <button
          onClick={() => {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            setSelectedTime(oneHourAgo);
            findClipsAtTime(oneHourAgo);
          }}
          className="control-btn"
        >
          -1h
        </button>
        <button
          onClick={() => {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            setSelectedTime(oneDayAgo);
            findClipsAtTime(oneDayAgo);
          }}
          className="control-btn"
        >
          -1d
        </button>
      </div>
    </div>
  );
}

