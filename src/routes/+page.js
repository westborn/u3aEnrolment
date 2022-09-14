export async function load({ fetch }) {
  // console.log('Sending')
  const response = await fetch(
    'https://script.google.com/macros/s/AKfycbxXbkVU4DS3Yg9SvGKYSvUTq0tCoW7J9g3BNzSW6UdQMDlrk4dzCg8jteqmV50IZ1o19Q/exec?requestType=getCourseDetail',
    { method: 'POST', body: JSON.stringify({ action: 'get_data' }) }
  )
  const courseDetailResponse = await response.json()
  // console.log(`Load response: ${JSON.stringify(courseDetailResponse.result, null, 2)}`)
  return courseDetailResponse
}
