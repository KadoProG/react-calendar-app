import { DialogBody } from '@/components/common/feedback/DialogBody';
import { DialogContainer } from '@/components/common/feedback/DialogContainer';
import { DialogContent } from '@/components/common/feedback/DialogContent';
import { DialogHeader } from '@/components/common/feedback/DialogHeader';
import { SettingCalendarListValid } from '@/components/domains/setting/SettingCalendarListValid';
import { SettingOtherFormItems } from '@/components/domains/setting/SettingOtherFormItems';
import React from 'react';

interface SettingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingDialog: React.FC<SettingDialogProps> = (props) => (
  <DialogContainer isOpen={props.isOpen} onClose={props.onClose}>
    <DialogContent style={{ maxWidth: 600 }} onClose={props.onClose}>
      <DialogHeader title="設定" onClose={props.onClose} />
      <DialogBody>
        <SettingCalendarListValid />
        <SettingOtherFormItems />
      </DialogBody>
    </DialogContent>
  </DialogContainer>
);