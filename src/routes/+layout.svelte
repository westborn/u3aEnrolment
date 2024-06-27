<script>
  import '../app.css'
  import { currentUserEmail, currentUserName, coursesEnroled } from '$lib/stores.js'
  currentUserName.set('')
  currentUserEmail.set('')
  coursesEnroled.set([])

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
<div class="mt-8">
  <p class="ml-28 -mt-8 mb-4text-xl font-bold text-gray-700">Course Enrolment</p>
</div>
<div class="mx-auto my-8 flex max-w-2xl flex-col justify-around">
  <slot />
</div>
