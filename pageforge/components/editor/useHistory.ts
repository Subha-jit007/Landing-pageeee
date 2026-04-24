"use client";
import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

export function useHistory(initial: string) {
  const [value, setValue] = useState(initial);
  const past = useRef<string[]>([]);
  const future = useRef<string[]>([]);
  const [, force] = useState(0);
  const bump = () => force((n) => n + 1);

  const set = useCallback((next: string, options?: { snapshot?: boolean }) => {
    const snap = options?.snapshot !== false;
    setValue((current) => {
      if (next === current) return current;
      if (snap) {
        past.current.push(current);
        if (past.current.length > MAX_HISTORY) past.current.shift();
        future.current = [];
      }
      return next;
    });
    bump();
  }, []);

  const replaceWithoutSnapshot = useCallback((next: string) => {
    setValue((current) => (next === current ? current : next));
    bump();
  }, []);

  const undo = useCallback((): string | null => {
    if (past.current.length === 0) return null;
    let popped: string | null = null;
    setValue((current) => {
      const prev = past.current.pop();
      if (prev === undefined) return current;
      future.current.push(current);
      if (future.current.length > MAX_HISTORY) future.current.shift();
      popped = prev;
      return prev;
    });
    bump();
    return popped;
  }, []);

  const redo = useCallback((): string | null => {
    if (future.current.length === 0) return null;
    let popped: string | null = null;
    setValue((current) => {
      const next = future.current.pop();
      if (next === undefined) return current;
      past.current.push(current);
      if (past.current.length > MAX_HISTORY) past.current.shift();
      popped = next;
      return next;
    });
    bump();
    return popped;
  }, []);

  const reset = useCallback((next: string) => {
    past.current = [];
    future.current = [];
    setValue(next);
    bump();
  }, []);

  return {
    value,
    set,
    replaceWithoutSnapshot,
    undo,
    redo,
    reset,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}