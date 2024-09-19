# React + TypeScript + Vite でカレンダーアプリ

<img width="852" alt="icatch" src="https://github.com/user-attachments/assets/ee487d10-a667-4dc1-80b7-d4a517f2ed9b">

Reactで作成したカレンダーアプリです。Googleカレンダーと同期し、カレンダーの追加・編集・削除が可能です。

Googleカレンダーと同等の、**ドラッグ**操作によるカレンダーの追加、移動を再現しました。

## 機能一覧

- カレンダー追加機能
- カレンダー編集機能
- カレンダー削除機能
- 設定機能

### 設定できる項目

- カレンダー同期の項目（アカウント連携で一覧表示）
- ドラッグ時の１時間あたりの分割数
- １時間あたりの高さ
- １画面の週の表示数
- カレンダーの開始タイミング

いずれもローカルストレージに保存され、同デバイス内で永続的に保存されます（カレンダーの追加・編集・削除はアカウント連携時のみ対応）。

<img width="610" alt="スクリーンショット 2024-09-20 8 14 45" src="https://github.com/user-attachments/assets/eefb8ddc-9c82-4a0c-8e80-1b8ffe5551c1">

設定によってはかなりの量の表示が可能です。

<img width="1800" alt="スクリーンショット 2024-09-09 21 59 58" src="https://github.com/user-attachments/assets/49b93d53-1e14-4616-87d1-19bfd0a7b243">

## ドラッグ操作によるカレンダーの追加・編集

https://github.com/user-attachments/assets/1609ab79-8064-41d1-802e-ab32e673fa1b

## 技術スタック

- フロントエンド：React ＋ Vite ＋ TypeScript
- API：Google Cloud（アカウント認証）, Google Calendar API
- デプロイ：レンタルサーバー（CI/CD）

## 起動方法

```shell
yarn # install package
yarn dev # ready to Debug http://localhost:5173/
```

### 作業ログ

- 18+56+90+103+65+142+77 = 551min(9h11min) ここで[XへPOST](https://x.com/KadoUniversity/status/1823470689833419143)

- All 3543min(59時間3分)



