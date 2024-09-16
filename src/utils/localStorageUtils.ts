import { LOCAL_STORAGE_KEY } from '@/const/const';

/**
 * 既存のデータをローカルストレージに保存する
 */
export const saveUserConfigInLocalStorage = (userConfig: LocalStorageType) => {
  const value: LocalStorageType = {
    id: userConfig.id,
    calendars: userConfig.calendars,
    calendarConfig: userConfig.calendarConfig,
  };

  // 既存のデータを取得
  const nowValue = localStorage.getItem(LOCAL_STORAGE_KEY);
  const parsedNowValue = nowValue ? JSON.parse(nowValue) : [];

  if (parsedNowValue && Array.isArray(parsedNowValue)) {
    // 既にデータがある場合は更新
    const newValue = parsedNowValue.filter(
      (config: LocalStorageType) => config.id !== userConfig.id
    );
    newValue.push(value);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newValue));
  } else {
    // データがない場合は新規作成
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([value]));
  }
};
