import { fail, redirect } from '@sveltejs/kit'
import { validateEmail } from '$lib/utilities.js'
import { sendToSheetsApp } from '$lib/sheetsAPI.js'

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
    const paymentReceipt = ''
    const costOfEnrolment = formData.get('costOfEnrolment')
    if (!validateEmail(email)) {
      return fail(400, {
        error: true,
        message: 'Please enter a valid email address',
      })
    }
    if (name === '') {
      return fail(400, {
        error: true,
        message: 'Please enter your name',
      })
    }
    if (coursesEnroled.length === 0) {
      return fail(400, {
        error: true,
        message: 'No courses selected for enrolment',
      })
    }

    if (costOfEnrolment === '0') {
      const res = await sendToSheetsApp({
        data: { name, email, coursesEnroled, paymentReceipt },
        requestType: 'addEnrolments',
      })
      if (res.result === 'error') {
        return fail(400, {
          error: true,
          message: res.data,
        })
      }
      redirect(307, `/enrolment-success`)
    }
    redirect(307, `/payment`)
  },
}
