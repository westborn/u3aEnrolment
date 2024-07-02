<script>
  import { currentUserEmail, currentUserName, courseDetails, coursesEnroled } from '$lib/stores.js'
  import { enhance } from '$app/forms'

  import CourseCard from '../lib/CourseCard.svelte'

  $: userEnrolments = $coursesEnroled.map((courseName) => {
    const enrolment = $courseDetails.find((el) => el.title === courseName)
    return {
      title: courseName,
      status: enrolment.courseStatus,
    }
  })

  export let form
  let selected = []
</script>

<form action="?/enrol" method="POST" use:enhance>
  <div class="relative mt-6 w-full">
    <input
      id="email"
      name="email"
      bind:value={$currentUserEmail}
      type="text"
      class="peer h-10 w-full rounded-md border-gray-300 placeholder-transparent focus:border-primary-50 focus:outline-none"
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
    />
    <label
      for="name"
      class="absolute left-2 -top-5 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-gray-600"
      >Your Name</label
    >
  </div>

  <div class="py-4">
    {#each $courseDetails as course}
      <CourseCard {course} bind:group={selected} />
    {/each}
  </div>
  <input
    hidden
    id="coursesEnroled"
    name="coursesEnroled"
    type="text"
    value={JSON.stringify(userEnrolments)}
    class="peer h-10 w-full rounded-md border-gray-300 placeholder-transparent focus:border-primary-50 focus:outline-none"
  />
  {#if form?.error}<p class="m-2 text-red-500">{form.message}</p>{/if}

  <button
    type="submit"
    class="mt-6 text-sm rounded-md bg-secondary-300 px-8 py-4 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-secondary-400 hover:shadow-lg focus:bg-secondary-400 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-secondary-200 active:shadow-lg"
  >
    Enrol Me!
  </button>
  <!-- {#if !fetchingData}
    <div class="mt-6 flex justify-between">
      <button type="button" on:click={() => handleEnrol()} class={btnClasses}>
        {displayCostButton}
      </button>
    </div>
  {/if}
  {#if fetchingData}
    <div
      style="border-top-color:transparent"
      class="m-6 h-16 w-16 animate-spin rounded-full border-8 border-solid border-accent"
    />
  {/if} -->
</form>
