<script>
  import { goto } from '$app/navigation'

  import { currentUserEmail, currentUserName, coursesEnroled, courseDetails } from '$lib/stores.js'
  import { validateEmail } from '$lib/utilities.js'
  import EnrolForm from '$lib/EnrolForm.svelte'
  import CompletedEnrolment from '$lib/CompletedEnrolment.svelte'

  export let data
  if (data?.result === 'ok') {
    $courseDetails = data.data.data
  }

  export let form

  let fetchingData = false
  let errorMessage = ''

  $: userEnrolments = $coursesEnroled.map((courseName) => {
    const enrolment = $courseDetails.find((el) => el.title === courseName)
    return {
      title: courseName,
      summary: enrolment.summary,
      status: enrolment.courseStatus,
      dates: enrolment.dates,
      time: enrolment.time,
      courseCost: enrolment.courseCost,
    }
  })

  $: totalCOst = userEnrolments.reduce((acc, course) => {
    return course.status === 'Enrol?' ? acc + Number(course.courseCost) : acc
  }, 0)

  $: displayCostButton = totalCOst == 0 ? 'Enrol Me!' : `Enrol Me! (Total Cost: $${totalCOst.toString()})`

  async function handleEnrol() {
    // console.log('Enroling')
    fetchingData = true
    errorMessage = ''

    if (!validateEmail($currentUserEmail)) {
      fetchingData = false
      errorMessage = 'Please enter a valid email address'
      return
    }
    if ($coursesEnroled.length === 0) {
      fetchingData = false
      errorMessage = 'No courses selectedCourse for enrolment'
      return
    }

    // make an object with course and status
    // userEnrolments = $coursesEnroled.map((courseName) => {
    //   const enrolment = $courseDetails.find((el) => el.title === courseName)
    //   return {
    //     title: courseName,
    //     summary: enrolment.summary,
    //     status: enrolment.courseStatus,
    //     dates: enrolment.dates,
    //     time: enrolment.time,
    //     courseCost: enrolment.courseCost,
    //   }
    // })
    //TODO - add payment things here
    if (totalCOst > 0) {
      goto('/payment/')
      return
    }
    // send request to server
    console.log('/ addEnrolments')
    const res = await fetch('/api?requestType=addEnrolments', {
      method: 'POST',
      body: JSON.stringify({
        name: $currentUserName,
        email: $currentUserEmail,
        coursesEnroled: userEnrolments,
      }),
    })
    const response = await res.json()

    // console.log('response', response)
    if (response.result === 'error') {
      fetchingData = false
      errorMessage = response.data
      return
    }
  }
</script>

<div class="mt-10">
  <EnrolForm {form} />
</div>

<!-- <pre>{JSON.stringify($coursesEnroled, null, 2)}</pre> -->
<!-- <pre>{JSON.stringify(totalCOst, null, 2)}</pre> -->
<!-- <pre>{JSON.stringify($courseDetails, null, 2)}</pre> -->

<!-- <p>xx={JSON.stringify($coursesEnroled, null, 2)}</p>
<p>xx={JSON.stringify(userEnrolments, null, 2)}</p>
<p>xx={totalCOst}</p> -->
