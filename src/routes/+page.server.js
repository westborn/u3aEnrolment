import { PUBLIC_WEBAPP_API_URL } from '$env/static/public'
import { fail, redirect } from '@sveltejs/kit'
import { validateEmail } from '$lib/utilities.js'

export async function load({ fetch }) {
  // console.log('Sending')
  const response = await fetch(`${PUBLIC_WEBAPP_API_URL}?requestType=getCourseDetail`, {
    method: 'POST',
    body: JSON.stringify({ action: 'get_data' }),
  })
  const courseDetailResponse = await response.json()
  // console.log(`Load response: ${JSON.stringify(courseDetailResponse.result, null, 2)}`)
  return courseDetailResponse
}

export const actions = {
  enrol: async ({ request }) => {
    const formData = await request.formData()
    const name = formData.get('name')
    const email = formData.get('email')
    const coursesEnroled = JSON.parse(formData.get('coursesEnroled'))
    console.log('coursesEnroled', coursesEnroled)
    if (!validateEmail(email)) {
      return fail(400, {
        error: true,
        message: 'Please enter a valid email address',
      })
    }
    if (coursesEnroled.length === 0) {
      return fail(400, {
        error: true,
        message: 'No courses selected for enrolment',
      })
    }

    const data = { name, email, coursesEnroled }
    const fetchUrl = `${PUBLIC_WEBAPP_API_URL}?requestType=addEnrolments`
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data),
    })
    const res = await response.json()
    if (res.result === 'error') {
      return fail(400, {
        error: true,
        message: res.data,
      })
    }
    console.log('Enrol response', res)
    redirect(307, `/enrolment-success?data=${JSON.stringify(res.data)}`)
  },
}
