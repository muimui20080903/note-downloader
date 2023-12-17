import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts"
await load({ export: true })
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12"

const savePath = Deno.env.get("savePath") || "./"

const saveNote = async (noteUrl: string): Promise<void> => {
  const contentKey: string | undefined = noteUrl.split("/").pop()
  const APIurl = `https://note.com/api/v3/notes/${contentKey}`
  const cookie: string | undefined = Deno.env.get("cookie")
  const res = await fetch(APIurl,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "cookie": cookie!,
      },
    }).catch((err) => {
      console.error(err)
      Deno.exit(1)
    })
  const json = await res.json()
  const body: string = JSON.stringify(json, null, 2)

  // 取得したJSONを保存
  const fileNameStr = `${json.data.user.urlname}-${json.data.name}`
  const forbiddenChars = /[\/\\\:\*\?"<>\|]/g; // 禁止文字の正規表現
  // 使用できない文字をアンダースコアに置き換える
  const fileName = fileNameStr.replace(forbiddenChars, '_');
  console.log(`saving ${fileName}`)
  Deno.writeTextFile(`${savePath}/noteJSON/${fileName}.json`, body)

  // 本文の前に追加する要素
  const noteData = json.data
  const eyecatch = noteData.eyecatch ? `<img src="${noteData.eyecatch}" alt="アイキャッチ" style="max-width: 100%;">`// アイキャッチを中央揃えに
    : ""
  const profileImg = `<img src="${noteData.user.user_profile_image_path}" alt="" width="56" height="56">`
  const createDate: string = new Date(noteData.created_at).toLocaleString()
  const price: string = noteData.labels[0] ? `${noteData.labels[0].name} <a href="${noteData.note_url}">${noteData.price}円</a>` : ""
  const user = noteData.user
  // 記事購入時などのアピールテキストの作成
  let appealText = ""
  if (user.purchase_appeal_text_note) { appealText = `<p>記事購入:${user.purchase_appeal_text_note}</p>` }
  if (user.purchase_appeal_text_magazine) { appealText += `<p>マガジン購入:${user.purchase_appeal_text_magazine}</p>` }
  if (user.purchase_appeal_text_support) { appealText += `<p>サポート:${user.purchase_appeal_text_support}</p>` }
  if (user.follow_appeal_text) {
    if (user.follow_appeal_image) {
      appealText += `<p><img src="${user.follow_appeal_image}">フォロー:${user.follow_appeal_text}</p>`
    } else {
      appealText += `<p>フォロー:${user.follow_appeal_text}</p>`
    }
  }
  if (user.like_appeal_text) {
    if (user.like_appeal_image) {
      appealText += `<p><img src="${user.like_appeal_image}">スキ:${user.like_appeal_text}</p>`
    } else {
      appealText += `<p>いいね:${user.like_appeal_text}</p>`
    }
  }
  if (user.share_appeal.text) {
    if (user.share_appeal.image) {
      appealText += `<p><img src="${user.share_appeal.image}">シェア:${user.share_appeal.text}</p>`
    } else {
      appealText += `<p>シェア:${user.share_appeal.text}</p>`
    }
  }
  if (user.magazine_add_appeal.text) {
    if (user.magazine_add_appeal.image) {
      appealText += `<p><img src="${user.magazine_add_appeal.image}">マガジン加入:${user.magazine_add_appeal.text}</p>`
    } else {
      appealText += `<p>マガジン加入:${user.magazine_add_appeal.text}</p>`
    }
  }
  if (user.support_box_appeal_text) { appealText += `<p>サポート:${user.support_box_appeal_text}</p>` }

  const head = `${eyecatch}<br>
  <h1><a href="${noteData.note_url}" target="_blank">${noteData.name}</a></h1><br>
  <a href="https://note.com/${noteData.user.urlname}">${profileImg}<strong>${noteData.user.nickname}</strong></a><br>
  <button type="submit" class="newiine_btn newiine_type01 newiine_clicked" data-iinename="いいねボタン">
    <span class="material-icons-round">favorite</span>
    <span class="newiine_count"></span>${noteData.like_count}
  </button>${createDate}
  <div>${price}</div>`

  // 本文の後ろに追加する要素
  const tags: string[] = noteData.hashtag_notes.map((tag: { hashtag: { name: string } }) => tag.hashtag.name.replace("#", ""))
  const tagLinks: string[] = tags.map((tag: string) => `<a id="tag" href="https://note.com/hashtag/${tag}" target="_blank">#${tag}</a><a></a>`)
  const tagLinksString: string = tagLinks.join("") + "<br>"
  const tail = `<br>${tagLinksString}<br>
  ${appealText}
  <a href="${noteData.note_url}" target="_blank">noteで見る</a>
  <!--ユーザー情報の表示-->
  <div class="o-userInfo">
    <div class="o-userInfo__image">
      <a href="https://note.com/${noteData.user.urlname}" target="_blank">
        <img src="${noteData.user.user_profile_image_path}" alt="${noteData.user.nickname}" width="56" height="56">
      </a>
    </div>
    <div class="o-userInfo__body">
      <div class="o-userInfo__body__name">
        <a href="https://note.com/${noteData.user.urlname}" target="_blank"><strong>${noteData.user.nickname}</strong></a>
      </div>
      <div class="o-userInfo__body__description">
        ${noteData.user.profile}
      </div>
    </div>
  </div>
  <!--ユーザー情報の表示-->
   `

  // 本文の各<p>要素を35文字で改行（style属性を追加して強制改行と左揃え）
  const $ = cheerio.load(noteData.body)
  // Cheerioの処理ブロックを変更
  $('p').each((_: number, element: string) => {
    const content: string = $(element).html(); // テキストをそのまま取得
    // 35文字ごとに改行を挿入
    const wrappedContent: string = content.replace(/(.{1,35})(\s|$)/g, '$1<br>')
    $(element).html(wrappedContent).attr('style', 'white-space: pre-wrap; text-align: left;')
  });

  // head, tags, tailを本文の前後に挿入
  const html = `
  <html>
    <head>
    <!--いいねボタン-->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Round" rel="stylesheet">
    <link rel="stylesheet" href="newiine_app/newiine.css">
      <style>
        body { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Arial', sans-serif; }
        #contentWrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        #centeredContent { text-align: center; max-width: 512px; width: 100%; padding: 20px; line-height:50px;}
        #tag{  margin:40px; }
        /* リンクのデフォルトスタイルを変更 */
        a {
          text-decoration: none; /* 下線を削除 */
          color: inherit; /* 親要素のテキストカラーを継承 */
          }
      </style>
    </head>
    <body>
      <div id="contentWrapper">
        <div id="centeredContent">
        <div>
          ${head}
        </div>
          ${$.html()}
          ${tail}
        </div>
      </div>
    </body>
  </html>
`
  // 保存
  Deno.writeTextFile(`${savePath}/noteHTML/${fileName}.html`, html)
}

// いいねしたノートのリンクを取得
type LikesNoteLinks = { url: string | undefined, title: string | undefined }[]
const getLikesByUserID = async (userID: string): Promise<LikesNoteLinks> => {
  const url = `https://note.com/${userID}/likes`
  const res = await fetch(url,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    }).catch((err) => {
      console.error(err)
      Deno.exit(1)
    })
  const body = await res?.text()
  const $ = cheerio.load(body);
  // classが"o-textNote__link a-link"の全てのa要素からhref属性とaria-label属性を取得
  const links: LikesNoteLinks = [];
  $('a.o-textNote__link.a-link').each((_: number, element: string) => {
    const href = $(element).attr('href')
    const url = `https://note.com${href}`;
    const titleStr = $(element).attr('aria-label');
    const forbiddenChars = /[\/\\\:\*\?"<>\|]/g; // 禁止文字の正規表現
    // 使用できない文字をアンダースコアに置き換える
    const title = titleStr.replace(forbiddenChars, '_');
    links.push({ url, title });
  });
  return links;
}

const main = async () => {
  // ./noteHTMLにあるファイル名を取得
  const files = Deno.readDirSync(`${savePath}/noteHTML`)
  // イテレータを配列に変換してからmapを使用
  const fileNames: string[] = Array.from(files).map((file) => file.name.split("-").at(-1)?.slice(0, -5)!)

  // スキから取得する場合
  {
    // ログインIDを環境変数から取得
    const logid: string | undefined = Deno.env.get("login")
    // いいねしたノートのリンクを取得
    const likesNoteLinks: LikesNoteLinks = await getLikesByUserID(logid!)
    // ノートのリンクを元に中身を取得
    for (const link of likesNoteLinks) {
      // URLが取得できなかった場合はスキップ
      if (!link.url || !link.title) continue
      // すでに取得済みの場合はスキップ
      if (fileNames.includes(link.title)) continue
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await saveNote(link.url)
      } catch (err) {
        console.log(link)
        console.error(err)
      }
    }
  }
  // ファイルから取得する場合
  {
    const json = await Deno.readTextFile("./noteUrlList.json")
    const urls = JSON.parse(json)
    for (const link of urls) {
      const forbiddenChars = /[\/\\\:\*\?"<>\|]/g; // 禁止文字の正規表現
      // 使用できない文字をアンダースコアに置き換える
      link.title = link.title.replace(forbiddenChars, '_');
      // URLが取得できなかった場合はスキップ
      if (!link.url || !link.title) continue
      // すでに取得済みの場合はスキップ
      if (fileNames.includes(link.title)) continue
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await saveNote(link.url)
      } catch (err) {
        console.log(link)
        console.error(err)
      }
    }
  }
}

main()
