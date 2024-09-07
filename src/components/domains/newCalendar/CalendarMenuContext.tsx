import dayjs from '@/libs/dayjs';
import React from 'react';

const menuWidth = 100;

interface OpenMenuArgs {
  anchorEl: HTMLElement;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
}

interface CalendarMenuContextValue {
  openMenu: (arg: OpenMenuArgs) => Promise<void>;
}

export const CalendarMenuContext = React.createContext<CalendarMenuContextValue>({
  openMenu: async () => {},
});

export const CalendarMenuProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const resolveFunction = React.useRef<() => void>(() => {});
  const openMenu = React.useCallback(
    async (args: OpenMenuArgs) =>
      new Promise<void>((resolve) => {
        resolveFunction.current = resolve;
        setAnchorEl(args.anchorEl);
      }),
    []
  );

  const onClose = React.useCallback(() => {
    if (resolveFunction.current) {
      resolveFunction.current();
    }
    setAnchorEl(null);
  }, []);

  const value = React.useMemo(() => ({ openMenu }), [openMenu]);

  const style: React.CSSProperties = React.useMemo(() => {
    if (!anchorEl) return {};
    const rect = anchorEl?.getBoundingClientRect();

    return {
      position: 'absolute',
      background: 'var(--background-paper)',
      // top: anchorEl.offsetTop + anchorEl.clientHeight,
      width: menuWidth,
      top: rect.top,
      left: rect.left - menuWidth,
    };
  }, [anchorEl]);

  return (
    <CalendarMenuContext.Provider value={value}>
      <div style={{ position: 'relative' }}>
        {props.children}
        {anchorEl && (
          <div style={style}>
            Menu
            <button onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </CalendarMenuContext.Provider>
  );
};
