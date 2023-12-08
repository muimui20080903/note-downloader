import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts"
await load({ export: true })

const getCookie = async () => {
  const APIurl = "https://note.com/api/v1/sessions/sign_in"
  const login = Deno.env.get("login")
  const password = Deno.env.get("password")

  const res = await fetch(APIurl, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      login,
      password,
    }),
    credentials: 'include', // Cookieを含めるオプション
  })

  const cookie = res.headers.get('set-cookie')
  return cookie;
}

getCookie().then((cookie) => {
  Deno.writeTextFile("./.env", `cookie = "${cookie}"\n`, { append: true })
  .then(() => {
    console.log("cookieを取得しました。")
  })
})