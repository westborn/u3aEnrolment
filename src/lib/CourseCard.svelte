<script>
  import Accordion from './components/Accordion.svelte'
  import { coursesEnroled } from '$lib/stores.js'

  export let course
  $: ({ courseStatus, title, summary, description, dates, time, location, courseCost } = course)

  $: coursePaymentRequired = courseCost > 0 && courseStatus === 'Enrol?' ? true : false
  $: coursePaymentText = coursePaymentRequired ? ' (Payable on enrolment via Credit Card)' : ''

  //hack to allow component to have checkbox state
  export let group
  export let fetchingData
  let checked = ''
  $: updateChekbox(group)
  $: updateGroup(checked)

  function updateChekbox(group) {
    checked = group.indexOf(title) >= 0
  }

  function updateGroup(checked) {
    const index = group.indexOf(title)
    if (checked) {
      if (index < 0) {
        group.push(title)
        group = group
      }
    } else {
      if (index >= 0) {
        group.splice(index, 1)
        group = group
      }
    }
    $coursesEnroled = group
  }
</script>

{#if courseStatus === 'Enrol?' || courseStatus === 'Waitlist?'}
  <div class="flex flex-row">
    <div class="flex flex-col mr-6 mt-2">
      <input
        disabled={fetchingData}
        class="h-7 w-7 rounded bg-secondary-100 border-secondary-500 text-secondary-500 focus:ring-secondary-200"
        type="checkbox"
        bind:checked
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
      {#if coursePaymentRequired}
        <p class="text-sm">
          Cost: ${courseCost}
          <span class="text-red-700">{coursePaymentText}</span>
        </p>
      {/if}
    </div>
  </div>
{/if}
