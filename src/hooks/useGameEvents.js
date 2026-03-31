/**
 * Agent 4: Integration Engineer
 * useGameEvents.js — Event consumer for animation triggers
 *
 * Provides a way for components to subscribe to specific event types
 * and get notified when they occur. Automatically clears consumed events.
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to consume game events and trigger callbacks.
 *
 * @param {import('../game/types.js').GameEvent[]} events - Events from useGameState
 * @param {Object.<string, Function>} handlers - Map of EVENT_TYPE → handler(eventData)
 * @param {Function} clearEvents - Clears consumed events
 */
export function useGameEvents(events, handlers, clearEvents) {
  const processedRef = useRef(new Set());

  useEffect(() => {
    if (!events || events.length === 0) return;

    let hasNew = false;

    for (const event of events) {
      // Use timestamp as a unique-ish ID to avoid double-processing
      const eventKey = `${event.type}_${event.timestamp}`;
      if (processedRef.current.has(eventKey)) continue;

      processedRef.current.add(eventKey);
      hasNew = true;

      const handler = handlers[event.type];
      if (handler) {
        handler(event.data, event);
      }
    }

    // Keep the processed set from growing forever
    if (processedRef.current.size > 200) {
      const entries = Array.from(processedRef.current);
      processedRef.current = new Set(entries.slice(-100));
    }

    // Clear events after processing
    if (hasNew && clearEvents) {
      clearEvents();
    }
  }, [events, handlers, clearEvents]);
}


/**
 * Hook to get the most recent event of a specific type.
 *
 * @param {import('../game/types.js').GameEvent[]} events
 * @param {string} eventType
 * @returns {import('../game/types.js').GameEvent|null}
 */
export function useLatestEvent(events, eventType) {
  const latest = useRef(null);

  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].type === eventType) {
      latest.current = events[i];
      break;
    }
  }

  return latest.current;
}
