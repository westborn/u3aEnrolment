import { PUBLIC_WEBAPP_API_URL } from '$env/static/public'

export async function sendToSheetsApp({ data, requestType }) {
  const fetchUrl = `${PUBLIC_WEBAPP_API_URL}?requestType=${requestType}`
  const response = await fetch(fetchUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data),
  })
  const res = await response.json()
  return res
}
