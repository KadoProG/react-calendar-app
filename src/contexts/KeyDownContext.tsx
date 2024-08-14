import React from 'react';

interface AddKeyDownEventArgs {
  id: number;
  key: KeyboardEvent['key'];
  callback: () => void;
}

export type KeyDownContextType = {
  addKeyDownEvent: (args: AddKeyDownEventArgs) => void;
  removeKeyDownEvent: (id: number) => void;
};

export const KeyDownContext = React.createContext<KeyDownContextType>({
  addKeyDownEvent: () => {},
  removeKeyDownEvent: () => {},
});

export const KeyDownContextProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const keydownEvents = React.useRef<AddKeyDownEventArgs[]>([]);

  const addKeyDownEvent = React.useCallback(({ id, key, callback }: AddKeyDownEventArgs) => {
    keydownEvents.current.push({ id, key, callback });
  }, []);

  const removeKeyDownEvent = React.useCallback((id: number) => {
    keydownEvents.current = keydownEvents.current.filter((event) => event.id !== id);
  }, []);

  const handleKeydown = React.useCallback((e: KeyboardEvent) => {
    const key = e.key;
    const keydownEventsReverse = keydownEvents.current.sort((a, b) => b.id - a.id);
    const callback = keydownEventsReverse.find((event) => event.key === key)?.callback;
    if (callback) {
      callback();
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeydown);

    setInterval(() => {
      console.log(keydownEvents.current);
    }, 1000);

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
