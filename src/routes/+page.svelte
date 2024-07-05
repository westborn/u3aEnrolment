<script>
  import { courseDetails } from '$lib/stores.js'
  import EnrolForm from '$lib/EnrolForm.svelte'

  // from the Load function - we get all the courses that are available for enrolment
  export let data
  if (data?.result === 'ok') {
    $courseDetails = data.data.data
  }

  export let form
</script>

<div class="mt-10">
  <!-- there is no return from here - we either redirect to '/enrolment-success' or make a pyment via '/payment' -->
  <EnrolForm {form} />
</div>

<!-- <pre>{JSON.stringify($coursesEnroled, null, 2)}</pre> -->
<!-- <pre>{JSON.stringify(totalCOst, null, 2)}</pre> -->
<!-- <pre>{JSON.stringify($courseDetails, null, 2)}</pre> -->
