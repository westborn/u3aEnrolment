<script>
  import Accordion from './components/Accordion.svelte'
  import { coursesEnrolled } from '$lib/stores.js'

  export let course

  function onChange({ target }) {
    const { value, checked } = target
    if (checked) {
      $coursesEnrolled = [...$coursesEnrolled, value]
    } else {
      $coursesEnrolled = $coursesEnrolled.filter((item) => item !== value)
    }
  }
</script>

{#if course.courseStatus === 'Enrol?' || course.courseStatus === 'Waitlist?'}
  <div class="flex flex-row">
    <div class="flex flex-col mr-6 mt-2">
      <input
        class="h-7 w-7 rounded  bg-primary-100 border-primary-500 text-primary-500 focus:ring-primary-200"
        type="checkbox"
        checked={$coursesEnrolled.includes(course.title)}
        on:change={onChange}
        value={course.title}
      />
      <p class="text-sm w-12">{course.courseStatus}</p>
    </div>
    <div class="flex flex-col py-1">
      <Accordion>
        <div slot="head">
          <p class="text-lg font-semibold text-gray-700">{course.title}</p>
        </div>
        <div slot="details">
          <p class="p-2 bg-gray-100 text-base">{course.description}</p>
        </div>
      </Accordion>
      <p class="text-sm">{course.dates} {course.time}</p>
      {#if course.cost !== ''}
        <p class="text-sm">Cost: ${course.cost}</p>
      {/if}
      <p class="text-sm">{course.location}</p>
    </div>
  </div>
{/if}
