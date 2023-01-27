export async function load({ fetch }) {
  // console.log('Sending')
  const response = await fetch(
    'https://script.google.com/macros/s/AKfycbyv5w_lYQUTGG1Kh_TfXpwgiOedmKGvc74nIJYCJqdwZlbAP0BglOnruwOkykqqlmshbw/exec?requestType=getCourseDetail',
    { method: 'POST', body: JSON.stringify({ action: 'get_data' }) }
  )
  const courseDetailResponse = await response.json()
  // console.log(`Load response: ${JSON.stringify(courseDetailResponse.result, null, 2)}`)
  return courseDetailResponse
}
