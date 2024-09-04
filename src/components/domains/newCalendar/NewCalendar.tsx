import React from 'react';
import { CalendarHeader } from '@/components/domains/newCalendar/CalendarHeader';
import { CalendarBodyTop } from '@/components/domains/newCalendar/CalendarBodyTop';

export const NewCalendar: React.FC = () => (
  <div>
    <CalendarHeader />
    <CalendarBodyTop />
  </div>
);
