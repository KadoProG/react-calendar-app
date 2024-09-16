import { CalendarMenuProvider } from '@/components/domains/editMenu/CalendarMenuContext';
import { NewCalendar } from '@/components/domains/newCalendar/NewCalendar';
import { CalendarContextProvider } from '@/contexts/CalendarContext';
import { CalendarFeatLocalStorageProvider } from '@/contexts/CalendarFeatLocalStorageContext';

export const NewCalendarPage: React.FC = () => (
  <CalendarFeatLocalStorageProvider>
    <CalendarContextProvider>
      <CalendarMenuProvider>
        <NewCalendar />
      </CalendarMenuProvider>
    </CalendarContextProvider>
  </CalendarFeatLocalStorageProvider>
);
