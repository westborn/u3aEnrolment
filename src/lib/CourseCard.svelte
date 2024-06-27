<script>
  import Accordion from './components/Accordion.svelte'
  import { coursesEnroled } from '$lib/stores.js'

  export let course
  $: ({ courseStatus, title, summary, description, dates, time, location, courseCost } = course)

  function onChange({ target }) {
    const { value, checked } = target
    if (checked) {
      $coursesEnroled = [...$coursesEnroled, value]
    } else {
      $coursesEnroled = $coursesEnroled.filter((item) => item !== value)
    }
  }
</script>

{#if courseStatus === 'Enrol?' || courseStatus === 'Waitlist?'}
  <div class="flex flex-row">
    <div class="flex flex-col mr-6 mt-2">
      <input
        class="h-7 w-7 rounded bg-secondary-100 border-secondary-500 text-secondary-500 focus:ring-secondary-200"
        type="checkbox"
        checked={$coursesEnroled.includes(title)}
        on:change={onChange}
        value={title}
      />
      <p class="text-sm w-12">{courseStatus}</p>
    </div>
    <div class="flex flex-col py-1">
      <Accordion>
        <div slot="head">
          <p class="text-lg font-semibold text-gray-700">{summary}</p>
        </div>
        <div slot="details">
          <p class="p-2 bg-gray-100 text-base">{description}</p>
        </div>
      </Accordion>
      <p class="text-sm">{dates} {time}</p>
      <p class="text-sm">{location}</p>
      {#if courseCost}
        <p class="text-sm">
          <!-- Cost: ${courseCost * ((dates.match(/,/g) || []).length + 1)} -->
          Cost: ${courseCost}
          <span class="text-red-700">&nbsp (Payable on enrolment via Credit Card)</span>
        </p>
      {/if}
    </div>
  </div>
{/if}
