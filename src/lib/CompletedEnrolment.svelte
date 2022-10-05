<script>
  import { currentUserEmail, currentUserName, coursesEnroled } from '$lib/stores.js'

  export let requestedCourses

  $: enroledCourses = requestedCourses.filter((course) => course.status === 'Enrol?')
  $: waitlistedCourses = requestedCourses.filter((course) => course.status === 'Waitlist?')
</script>

<p class="text-xl mt-6">{$currentUserName}</p>
<p class="text-base mt-1">{$currentUserEmail}</p>

{#if enroledCourses.length > 0}
  <div class="flex flex-col mt-6">
    <p class="px-4">You have been enroled for:</p>
    <ul class="ml-20 bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
      {#each enroledCourses as course}
        <li class="px-6 py-2 border-b border-gray-200 w-full">
          <p>{course.summary}</p>
          <p class="text-sm">{course.dates} {course.time}</p>
        </li>
      {/each}
    </ul>
  </div>
{/if}

{#if waitlistedCourses.length > 0}
  <div class="mt-10 flex flex-col">
    <p class="px-4">You have been waitlisted for:</p>
    <ul class="ml-20 bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
      {#each waitlistedCourses as course}
        <li class="px-6 py-2 border-b border-gray-200 w-full">
          <p>{course.summary}</p>
          <p class="text-sm">{course.dates} {course.time}</p>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<div class="mt-12">
  <a
    href="https://u3abermagui.com.au/current-program/"
    class="text-sm rounded-md bg-secondary-300 px-8 py-4 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-secondary-400 hover:shadow-lg "
    >Back to the Program</a
  >
  <p class="mt-12 font-bold text-accent">An email has been sent to you containing details of this enrolment.</p>
</div>
