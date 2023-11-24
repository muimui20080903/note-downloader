# note-downloader
[note.com](https://note.com/)の記事をローカルに保存する。
# 使用方法 usage
## 準備
```
noteHTML
noteJSON
noteUrlList.json
.env
```
を作る  
```
#.env
login = "<自分のユーザーID>"
password = "<パスワード>"
```
```
"noteUrlList.json":"保存したいnoteのリスト",
[
    {   
        "title":"",
        "url":""
    },
]
```
cookie情報の取得（一回目のみ）
```
$ deno task cookie
# cookieの情報が`.env`に書き込まれる
```
## 実行
```
$ deno task start
```

# 参考にしたサイト
- noteのcookie取得  
[note APIの利用とユーザ認証について](https://note.com/takahiro_yazu/n/nf3477fbdf596)

- cookie指定  
[Fetch APIでCookieを指定する](https://scrapbox.io/takker/Fetch_API%E3%81%A7Cookie%E3%82%92%E6%8C%87%E5%AE%9A%E3%81%99%E3%82%8B)

- note-API一覧  
[【2023年度】noteの非公式API一覧](https://note.com/ego_station/n/n85fcb635c0a9)
