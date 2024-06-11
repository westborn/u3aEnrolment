import { SECRET_WEBAPP_API_URL } from '$env/static/private'
const googleWebAppUrl = SECRET_WEBAPP_API_URL

export async function load({ fetch }) {
  // console.log('Sending')
  const response = await fetch(`${googleWebAppUrl}?requestType=getCourseDetail`, {
    method: 'POST',
    body: JSON.stringify({ action: 'get_data' }),
  })
  const courseDetailResponse = await response.json()
  // console.log(`Load response: ${JSON.stringify(courseDetailResponse.result, null, 2)}`)
  return courseDetailResponse
}
