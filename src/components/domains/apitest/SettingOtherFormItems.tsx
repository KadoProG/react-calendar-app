import { Select } from '@/components/common/input/Select';
import { FormContainer } from '@/components/common/layout/FormContainer';
import { TextField } from '@/components/common/TextField';
import { CalendarConfigContext } from '@/contexts/CalendarConfigContext';
import React from 'react';

export const SettingOtherFormItems: React.FC = () => {
  const { control } = React.useContext(CalendarConfigContext);

  return (
    <>
      <FormContainer label="1時間あたりの分割数">
        <TextField control={control} name="divisionsPerHour" type="number" />
      </FormContainer>
      <FormContainer label="1時間あたりの高さ">
        <TextField control={control} name="heightPerHour" type="number" />
      </FormContainer>
      <FormContainer label="1画面の表示数">
        <TextField control={control} name="weekDisplayCount" type="number" />
      </FormContainer>
      <FormContainer label="カレンダーの開始タイミング">
        <Select
          control={control}
          name="dateRangeStartTime"
          options={[
            { value: 'SunDay', label: '日曜日' },
            { value: 'MonDay', label: '月曜日' },
            { value: 'None', label: '指定なし' },
          ]}
        />
      </FormContainer>
    </>
  );
};
