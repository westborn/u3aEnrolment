export async function load({ fetch }) {
  // console.log('Sending')
  const response = await fetch(
    // 'https://script.google.com/macros/s/AKfycbz-XGsvHwrqXyjQ_IRGt-Z64N7vhnEA-vgq3QTUn_hG9mteLi05C46CCbeTfm_4zhf8ww/exec?requestType=getCourseDetail',
    'https://script.google.com/macros/s/AKfycbzYxyxCd4qXmtcy8uzn4dzUS9-qUEUlJ81fl22Ul2EO6mVWmQRkRfzD2Kg-rFIRlwEqiA/exec?requestType=getCourseDetail',
    { method: 'POST', body: JSON.stringify({ action: 'get_data' }) }
  )
  const courseDetailResponse = await response.json()
  // console.log(`Load response: ${JSON.stringify(courseDetailResponse.result, null, 2)}`)
  return courseDetailResponse
}
