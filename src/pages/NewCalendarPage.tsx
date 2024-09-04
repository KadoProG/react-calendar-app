import { NewCalendar } from '@/components/domains/newCalendar/NewCalendar';
import { CalendarContextProvider } from '@/contexts/CalendarContext';
import { CalenadarFeatLocalStorageProvider } from '@/contexts/CalendarFeatLocalStorageContext';

export const NewCalendarPage: React.FC = () => (
  <CalenadarFeatLocalStorageProvider>
    <CalendarContextProvider>
      <NewCalendar />
    </CalendarContextProvider>
  </CalenadarFeatLocalStorageProvider>
);
