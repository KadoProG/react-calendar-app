import React from 'react';
import { CalendarHeader } from '@/components/domains/CalenadarHeader';
import { CalendarBody } from '@/components/domains/CalendarBody';

export const Calendar: React.FC = () => {
  const [fixedContentHeight, setFixedContentHeight] = React.useState<number>(0);

  return (
    <div style={{ overflow: 'scroll', height: '100%' }}>
      <CalendarHeader setFixedContentHeight={setFixedContentHeight} />
      <CalendarBody fixedContentHeight={fixedContentHeight} />
    </div>
  );
};
