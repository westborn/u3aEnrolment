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
  let enrolmentNotification = false

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
    enrolmentNotification = true
  }

  let btnClasses =
    'text-sm rounded-md bg-secondary-300 px-8 py-4 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-secondary-400 hover:shadow-lg focus:bg-secondary-400 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-secondary-200 active:shadow-lg'
</script>

{#if !enrolmentNotification}
  <p class="mt-2">Welcome!</p>
  <p>Please review the courses on offer for this term on the Current Program page.</p>
  <p class="mt-2">
    When you have decided which courses you want to enrol in, fill in your details in the form below, select the courses
    you are interested in and click the "Enrol Me!" button. Please only enrol ONCE for a course. If you enrol more than
    once then other members may not be able to join that class.
  </p>
  <p class="mt-2">IMPORTANT – you may need to scroll to the bottom of the form to complete the enrolment.</p>

  <EnrolForm {form} />
{:else}
  <p class="text-xl mt-6">{$currentUserName}</p>
  <p class="text-base mt-1">{$currentUserEmail}</p>

  <CompletedEnrolment requestedCourses={userEnrolments} />

  <div class="mt-12">
    <a
      href="https://u3abermagui.com.au/current-program/"
      class="text-sm rounded-md bg-secondary-300 px-8 py-4 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-secondary-400 hover:shadow-lg"
      >Back to the Program</a
    >
    <p class="mt-12 font-bold text-accent">An email has been sent to you containing details of this enrolment.</p>
  </div>
{/if}

<pre>{JSON.stringify($coursesEnroled, null, 2)}</pre>
<!-- <pre>{JSON.stringify(totalCOst, null, 2)}</pre> -->
<!-- <pre>{JSON.stringify($courseDetails, null, 2)}</pre> -->

<!-- <p>xx={JSON.stringify($coursesEnroled, null, 2)}</p>
<p>xx={JSON.stringify(userEnrolments, null, 2)}</p>
<p>xx={totalCOst}</p> -->
