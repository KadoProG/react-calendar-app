使用するコンポーネントの親要素に対して、`CalendarMenuProvider`を設置し、コンテキストを使用できるようにする。

ダイアログを出したいコンポーネントで、`CalendarMenuContext`を`useContext`経由で呼び出し、`openDialog`にてMenuダイアログの操作を実現。
