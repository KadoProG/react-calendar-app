import { CalendarMenuProvider } from '@/components/domains/editMenu/CalendarMenuContext';
import { Calendar } from '@/components/domains/newCalendar/Calendar';
import { CalendarContextProvider } from '@/contexts/CalendarContext';
import { CalendarFeatLocalStorageProvider } from '@/contexts/CalendarFeatLocalStorageContext';

export const CalendarPage: React.FC = () => (
  <CalendarFeatLocalStorageProvider>
    <CalendarContextProvider>
      <CalendarMenuProvider>
        <Calendar />
      </CalendarMenuProvider>
    </CalendarContextProvider>
  </CalendarFeatLocalStorageProvider>
);
