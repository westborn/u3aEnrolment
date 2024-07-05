<script>
  import '../app.css'
  import { currentUserEmail, currentUserName, coursesEnroled, courseDetails } from '$lib/stores.js'
  currentUserName.set('')
  currentUserEmail.set('')
  coursesEnroled.set([])
  courseDetails.set([])

  import { onMount } from 'svelte'
  import { dev } from '$app/environment'
  import { PUBLIC_SQUARE_ENVIRONMENT } from '$env/static/public'

  import Nav from '$lib/Nav.svelte'

  onMount(async () => {
    const src =
      PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
        ? 'https://sandbox.web.squarecdn.com/v1/square.js'
        : 'https://web.squarecdn.com/v1/square.js'

    console.log(`env dev:${dev} meta.env.MODE:${import.meta.env.MODE}`)

    const scriptEl = document.createElement('script')
    scriptEl.async = false
    scriptEl.type = 'text/javascript'
    scriptEl.src = src
    document.head.appendChild(scriptEl)
  })
</script>

<svelte:head>
  <title>Course Enrolment</title>
</svelte:head>

<Nav />
<div class="mx-auto my-8 flex max-w-2xl flex-col justify-around">
  <section class="container mx-auto max-w-prose px-3">
    <h3 class="text-xl font-bold text-accent">Course Enrolment</h3>
    <div class="has-tooltip float-right -mt-8">
      <div class="tooltip rounded-lg shadow-lg p-6 bg-slate-200 text-grey-600 -mt-10 -ml-72 text-left max-w-lg">
        <p>Please review the courses on offer for this term on the Current Program page.</p>
        <p>
          When you have decided which courses you want to enrol in, fill in your details in the form below, select the
          courses you are interested in and click the "Enrol Me!" button. Please only enrol ONCE for a course. If you
          enrol more than once other members may not be able to join that class.
        </p>
        <p class="mt-4">IMPORTANT – you may need to scroll to the bottom of the form to complete the enrolment.</p>
      </div>
      <svg
        class="w-8 h-8 text-secondary-800"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fill-rule="evenodd"
          d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.008-3.018a1.502 1.502 0 0 1 2.522 1.159v.024a1.44 1.44 0 0 1-1.493 1.418 1 1 0 0 0-1.037.999V14a1 1 0 1 0 2 0v-.539a3.44 3.44 0 0 0 2.529-3.256 3.502 3.502 0 0 0-7-.255 1 1 0 0 0 2 .076c.014-.398.187-.774.48-1.044Zm.982 7.026a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2h-.01Z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
    <slot />
  </section>
</div>
