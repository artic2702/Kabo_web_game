/**
 * Agent 4: Integration Engineer
 * useAnimationQueue.js — Sequential animation management
 *
 * Queues animations so they play one after another rather than
 * all firing simultaneously. Components push animation callbacks
 * and the queue executes them in order.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Manages a queue of animations that execute sequentially.
 *
 * @returns {Object}
 * @property {boolean} isAnimating - Whether an animation is currently playing
 * @property {Function} enqueue - (animationFn, durationMs) => void
 * @property {Function} clear - () => void — Clear all pending animations
 * @property {number} queueLength - Number of pending animations
 */
export function useAnimationQueue() {
  const [isAnimating, setIsAnimating] = useState(false);
  const queueRef = useRef([]);
  const activeRef = useRef(false);

  const processNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      activeRef.current = false;
      setIsAnimating(false);
      return;
    }

    activeRef.current = true;
    setIsAnimating(true);

    const { fn, duration } = queueRef.current.shift();

    // Execute the animation function
    try {
      fn();
    } catch (e) {
      // Don't let a failed animation break the queue
    }

    // Wait for duration, then process next
    setTimeout(() => {
      processNext();
    }, duration);
  }, []);

  /**
   * Add an animation to the queue.
   *
   * @param {Function} fn - The animation function to execute
   * @param {number} durationMs - How long to wait before the next animation
   */
  const enqueue = useCallback((fn, durationMs = 300) => {
    queueRef.current.push({ fn, duration: durationMs });

    // Start processing if not already running
    if (!activeRef.current) {
      processNext();
    }
  }, [processNext]);

  /**
   * Clear all pending animations.
   */
  const clear = useCallback(() => {
    queueRef.current = [];
    activeRef.current = false;
    setIsAnimating(false);
  }, []);

  return {
    isAnimating,
    enqueue,
    clear,
    queueLength: queueRef.current.length,
  };
}
