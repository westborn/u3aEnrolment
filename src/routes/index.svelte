<script context="module">
  export async function load({ fetch }) {
    console.log('Sending')
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbzFuYcnrLhLT64bgbgHO3ffmJTqkSgfGDMn0sWcLIfHJdrwRNqXRQphuxfUm3P6Vv7Dpw/exec?requestType=getCourseDetail',
      { method: 'POST', body: JSON.stringify({ action: 'get_data' }) }
    )
    const courseResponse = await response.json()
    console.log(JSON.stringify(courseResponse.result, null, 2))
    return {
      props: { courseResponse },
    }
  }
</script>

<script>
  import { currentUserEmail, currentUserName, coursesEnrolled } from '$lib/stores.js'
  import CourseCard from '../lib/CourseCard.svelte'

  export let courseResponse

  function handleEnrol() {
    console.log('Enrolling')
    const enrolData = {
      action: 'enrol',
      UserName: $currentUserName,
      UserEmail: $currentUserEmail,
      coursesEnrolled: $coursesEnrolled,
    }
    console.log(JSON.stringify(enrolData, null, 2))
  }
  ;``
  let courseDetails = courseResponse?.result === 'ok' ? courseResponse.data.data : {}

  let fetchingData = false
  let errorMessage = ''

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

    <section class="container mx-auto max-w-prose px-3">
      <div class="py-4">
        {#each courseDetails as course}
          <CourseCard {course} />
        {/each}
      </div>
    </section>
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
  </div>
</section>

<pre>{JSON.stringify($coursesEnrolled, null, 2)}</pre>
