import React from 'react';
import { CalendarHeader } from '@/components/domains/newCalendar/CalendarHeader';
import { CalendarBodyTop } from '@/components/domains/newCalendar/CalendarBodyTop';
import { CalendarBodyMain } from '@/components/domains/newCalendar/CalendarBodyMain';

export const NewCalendar: React.FC = () => (
  <div>
    <CalendarHeader />
    <CalendarBodyTop />
    <CalendarBodyMain />
  </div>
);
