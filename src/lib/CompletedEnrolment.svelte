<script>
  export let userEnrolments = []

  $: enroledCourses = userEnrolments
    .filter((course) => course.status === 'Enrol?')
    .map((el) => el.title)
    .sort()
  $: waitlistedCourses = userEnrolments
    .filter((course) => course.status === 'Waitlist?')
    .map((el) => el.title)
    .sort()
</script>

<div class="flex flex-col">
  <p class="px-4">You have been enrolled for:</p>
  <ul class="ml-20 bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
    {#each enroledCourses as course}
      <li class="px-6 py-2 border-b border-gray-200 w-full">
        {course}
      </li>
    {/each}
  </ul>
</div>

<div class="mt-10 flex flex-col">
  <p class="px-4">You have been waitlisted for:</p>
  <ul class="ml-20 bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
    {#each waitlistedCourses as course}
      <li class="px-6 py-2 border-b border-gray-200 w-full">
        {course}
      </li>
    {/each}
  </ul>
</div>
