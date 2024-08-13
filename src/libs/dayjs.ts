import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/ja';

dayjs.extend(localizedFormat);

dayjs.locale('ja');

export default dayjs;
