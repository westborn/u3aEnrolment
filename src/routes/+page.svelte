<script>
  import { currentUserEmail, currentUserName, coursesEnroled } from '$lib/stores.js'
  import CourseCard from '../lib/CourseCard.svelte'
  import CompletedEnrolment from '../lib/CompletedEnrolment.svelte'

  export let data
  let courseDetails = data?.result === 'ok' ? data.data.data : {}

  let userEnrolments = []

  let fetchingData = false
  let errorMessage = ''
  let enrolmentNotification = false

  async function handleEnrol() {
    console.log('Enroling')
    fetchingData = true
    errorMessage = ''
    // make an object with course and status
    userEnrolments = $coursesEnroled.map((courseName) => {
      const enrolment = courseDetails.find((el) => el.title === courseName)
      return {
        title: courseName,
        status: enrolment.courseStatus,
        dates: enrolment.dates,
        time: enrolment.time,
      }
    })
    // send request to server
    const res = await fetch('/api?requestType=addEnrolments', {
      method: 'POST',
      body: JSON.stringify({
        name: $currentUserName,
        email: $currentUserEmail,
        coursesEnroled: userEnrolments,
      }),
    })
    const response = await res.json()

    console.log('response', response)
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
  <section class="container mx-auto max-w-prose px-3">
    <h3 class="text-xl font-bold text-accent">Course Enrolment</h3>

    <p class="mt-2">Welcome!</p>
    <p>Please review the courses on offer for this term on the Current Program page.</p>
    <p class="mt-2">
      When you have decided which courses you want to enrol in, fill in your details in the form below, select the
      courses you are interested in and click the "Enrol Me!" button. Please only enrol ONCE for a course. If you enrol
      more than once then other members may not be able to join that class.
    </p>
    <p class="mt-2">IMPORTANT – you may need to scroll to the bottom of the form to complete the enrolment.</p>

    <div class="relative mt-6 w-full">
      <input
        id="email"
        name="email"
        bind:value={$currentUserEmail}
        type="text"
        class="peer h-10 w-full rounded-md border-gray-300 placeholder-transparent focus:border-primary-50 focus:outline-none"
        placeholder="someone@gmail.com"
      />
      <label
        for="email"
        class="absolute left-2 -top-5 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-gray-600"
        >Email address</label
      >
    </div>

    <div class="relative mt-6 w-full">
      <input
        id="name"
        name="name"
        bind:value={$currentUserName}
        type="text"
        class="peer h-10 w-full rounded-md border-gray-300 placeholder-transparent focus:border-primary-50 focus:outline-none"
        placeholder="someone@gmail.com"
      />
      <label
        for="name"
        class="absolute left-2 -top-5 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-gray-600"
        >Name for this enrolment</label
      >
    </div>
  </section>

  <section class="container mx-auto max-w-prose px-3">
    <div class="py-4">
      {#each courseDetails as course}
        <CourseCard {course} />
      {/each}
    </div>
  </section>

  <section class="container mx-auto max-w-prose px-3">
    {#if errorMessage}
      <p class="m-2 text-red-500">{errorMessage}</p>
    {/if}
    <div class="mt-6 flex justify-between">
      <button type="button" on:click={() => handleEnrol()} class={btnClasses}>Enrol Me! </button>
    </div>

    {#if fetchingData}
      <div
        style="border-top-color:transparent"
        class="m-6 h-16 w-16 animate-spin rounded-full border-8 border-solid border-accent"
      />
    {/if}
  </section>
{/if}

{#if enrolmentNotification}
  <section class="container mx-auto max-w-prose px-3">
    <h3 class="text-xl font-bold text-accent">Course Enrolment</h3>
    <CompletedEnrolment requestedCourses={userEnrolments} />
  </section>
{/if}

<!-- <pre>{JSON.stringify($coursesEnroled, null, 2)}</pre> -->
