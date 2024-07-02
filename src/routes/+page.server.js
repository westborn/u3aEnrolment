import { PUBLIC_WEBAPP_API_URL } from '$env/static/public'
import { fail, redirect } from '@sveltejs/kit'
import { validateEmail } from '$lib/utilities.js'

const sendToSheetsApp = async ({ data, requestType }) => {
  const fetchUrl = `${PUBLIC_WEBAPP_API_URL}?requestType=${requestType}`
  const response = await fetch(fetchUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data),
  })
  const res = await response.json()
  return res
}

export async function load() {
  const res = await sendToSheetsApp({ data: { action: 'get_data' }, requestType: 'getCourseDetail' })
  return res
}

export const actions = {
  enrol: async ({ request }) => {
    const formData = await request.formData()
    const name = formData.get('name')
    const email = formData.get('email')
    const coursesEnroled = JSON.parse(formData.get('coursesEnroled'))
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

    const res = await sendToSheetsApp({ data: { name, email, coursesEnroled }, requestType: 'addEnrolments' })
    if (res.result === 'error') {
      return fail(400, {
        error: true,
        message: res.data,
      })
    }
    redirect(307, `/enrolment-success`)
  },
}
