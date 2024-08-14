import React from 'react';

export type KeyDownContextType = {
  addKeyDownEvent: (key: string, callback: () => void) => void;
  removeKeyDownEvent: () => void;
};

export const KeyDownContext = React.createContext<KeyDownContextType>({
  addKeyDownEvent: () => {},
  removeKeyDownEvent: () => {},
});

export const KeyDownContextProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const keydownEvents = React.useRef<{ callback: () => void; key: string }[]>([]);

  const addKeyDownEvent = React.useCallback((key: string, callback: () => void) => {
    keydownEvents.current.push({ callback, key });
  }, []);

  const removeKeyDownEvent = React.useCallback(() => {
    delete keydownEvents.current[keydownEvents.current.length - 1];
  }, []);

  const handleKeydown = React.useCallback((e: KeyboardEvent) => {
    const key = e.key;
    const keydownEventsReverse = keydownEvents.current.slice().reverse();
    const callback = keydownEventsReverse.find((event) => event.key === key)?.callback;
    if (callback) {
      callback();
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  return (
    <KeyDownContext.Provider value={{ addKeyDownEvent, removeKeyDownEvent }}>
      {props.children}
    </KeyDownContext.Provider>
  );
};
