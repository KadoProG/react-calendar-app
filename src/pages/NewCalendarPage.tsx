import { CalendarMenuProvider } from '@/components/domains/newCalendar/CalendarMenuContext';
import { NewCalendar } from '@/components/domains/newCalendar/NewCalendar';
import { CalendarContextProvider } from '@/contexts/CalendarContext';
import { CalendarFeatLocalStorageProvider } from '@/contexts/CalendarFeatLocalStorageContext';

export const NewCalendarPage: React.FC = () => (
  <CalendarFeatLocalStorageProvider>
    <CalendarMenuProvider>
      <CalendarContextProvider>
        <NewCalendar />
      </CalendarContextProvider>
    </CalendarMenuProvider>
  </CalendarFeatLocalStorageProvider>
);
