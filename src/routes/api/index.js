const googleWebAppUrl =
  'https://script.google.com/macros/s/AKfycbwtPP87K5ssxAu9i_vnKC6WDQCEXk4QWPOBy_rVoR5N9G_dwv-F1gJMzhGezD3ym1Q0ow/exec'
//
// send a post request to the google sheet backend web app
// use the search param to determine which function to call on the backend
// fetch has to be a stringified json object and text/plain to avoid CORS issues

export async function POST({ request }) {
  const data = await request.json()

  var requestType
  try {
    const url = new URL(request.url)
    requestType = url.searchParams.get('requestType')
  } catch (err) {
    requestType = 'notFound'
  }

  const fetchUrl = `${googleWebAppUrl}?requestType=${requestType}`
  console.log(fetchUrl)
  console.log(JSON.stringify(data, null, 2))
  const response = await fetch(fetchUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data),
  })
  const res = await response.json()
  return { body: res }
}
