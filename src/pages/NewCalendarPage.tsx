import { CalendarMenuProvider } from '@/components/domains/newCalendar/CalendarMenuContext';
import { NewCalendar } from '@/components/domains/newCalendar/NewCalendar';
import { CalendarContextProvider } from '@/contexts/CalendarContext';
import { CalenadarFeatLocalStorageProvider } from '@/contexts/CalendarFeatLocalStorageContext';

export const NewCalendarPage: React.FC = () => (
  <CalendarMenuProvider>
    <CalenadarFeatLocalStorageProvider>
      <CalendarContextProvider>
        <NewCalendar />
      </CalendarContextProvider>
    </CalenadarFeatLocalStorageProvider>
  </CalendarMenuProvider>
);
