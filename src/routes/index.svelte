<script context="module">
  export async function load({ fetch }) {
    console.log('Sending')
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbzFuYcnrLhLT64bgbgHO3ffmJTqkSgfGDMn0sWcLIfHJdrwRNqXRQphuxfUm3P6Vv7Dpw/exec?requestType=getCourseDetail',
      { method: 'POST', body: JSON.stringify({ action: 'get_data' }) }
    )
    const courseDetailResponse = await response.json()
    console.log(`Load response: ${JSON.stringify(courseDetailResponse.result, null, 2)}`)
    return {
      props: { courseDetailResponse },
    }
  }
</script>

<script>
  import { currentUserEmail, currentUserName, coursesEnrolled } from '$lib/stores.js'
  import CourseCard from '../lib/CourseCard.svelte'
  import CompletedEnrolment from '../lib/CompletedEnrolment.svelte'

  export let courseDetailResponse

  let userEnrolments = []

  let courseDetails = courseDetailResponse?.result === 'ok' ? courseDetailResponse.data.data : {}

  let fetchingData = false
  let errorMessage = ''
  let enrolmentNotification = false

  async function handleEnrol() {
    console.log('Enrolling')
    fetchingData = true
    errorMessage = ''
    // make an object with course and status
    userEnrolments = $coursesEnrolled.map((courseName) => {
      return {
        title: courseName,
        status: courseDetails.find((el) => el.title === courseName).courseStatus,
      }
    })
    // send request to server
    const res = await fetch('/api?requestType=addEnrolments', {
      method: 'POST',
      body: JSON.stringify({
        name: $currentUserName,
        email: $currentUserEmail,
        coursesEnrolled: userEnrolments,
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

<section class="container mx-auto max-w-prose px-3">
  <h4 class="text-xl font-bold text-accent">Course Enrolment</h4>

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

{#if !enrolmentNotification}
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
  <section class="container mt-6 mx-auto max-w-prose px-3">
    <CompletedEnrolment {userEnrolments} />
  </section>
{/if}

<!-- <pre>{JSON.stringify($coursesEnrolled, null, 2)}</pre> -->
