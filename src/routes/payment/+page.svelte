<script>
  import { PUBLIC_SQUARE_APP_ID, PUBLIC_SQUARE_LOCATION_ID } from '$env/static/public'

  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  import { currentUserEmail, currentUserName, coursesEnroled, courseDetails } from '$lib/stores.js'
  import { handleError, handleUnexpectedError, processResponse, apiResponse } from '$lib/utilities.js'
  import { sendToSheetsApp } from '$lib/sheetsAPI.js'

  apiResponse.lastStatus = {}

  const validStates = {
    COMMENCING: 'COMMENCE',
    PAYING: 'PAY',
    PAYMENTERROR: 'PAYMENTERROR',
    ERROR: 'ERROR',
  }

  $: currentState = validStates.COMMENCING
  let errorMessage = ''
  let fetchingData = false

  $: userEnrolments = $coursesEnroled.map((courseName) => {
    const enrolment = $courseDetails.find((el) => el.title === courseName)
    return {
      title: courseName,
      summary: enrolment.summary,
      status: enrolment.courseStatus,
      dates: enrolment.dates,
      time: enrolment.time,
      courseCost: enrolment.courseCost,
    }
  })

  $: costOfEnrolment = userEnrolments.reduce((acc, course) => {
    return course.status === 'Enrol?' ? acc + Number(course.courseCost) : acc
  }, 0)

  $: costOfEnrolmentInCents = parseInt(costOfEnrolment * 100)

  let card

  onMount(async () => {
    if ($currentUserEmail) {
      fetchingData = true

      const originalStyle = {
        input: {
          backgroundColor: '#f5f7f9',
        },
        '.input-container': {
          borderColor: 'transparent',
          borderRadius: '.25em',
        },
      }

      if (!window.Square) {
        throw new Error('Square.js failed to load properly')
      }
      errorMessage = ''
      const payments = window.Square.payments(PUBLIC_SQUARE_APP_ID, PUBLIC_SQUARE_LOCATION_ID)
      // console.log('adding payment container')

      // INIT CARD
      try {
        card = await payments.card({
          style: originalStyle,
        })
        await card.attach('#card-container')
      } catch (e) {
        // TODO: error handling
        errorMessage = 'Initializing card failed - please try again later'
        console.error(errorMessage)
        return
      }
      fetchingData = false
    }
  })

  async function tokenize(paymentMethod) {
    const tokenResult = await paymentMethod.tokenize()
    if (tokenResult.status === 'OK') {
      return tokenResult.token
    } else {
      let errorMessage = `Tokenization failed with status: ${tokenResult.status}`
      if (tokenResult.errors) {
        errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`
      }
      throw new Error(errorMessage)
    }
  }

  async function readyToPay() {
    // console.log('readyToPay: here')
    fetchingData = true
    currentState = validStates.PAYING

    //try to make the CC  payment
    await handlePaymentSubmission()
    //if not OK - show any errors and allow retry?
    if (!apiResponse.lastStatus.ok) {
      fetchingData = false
      return
    }

    //did the payment complete OK
    const paymentCompleted = apiResponse?.lastStatus?.response?.payment?.status === 'COMPLETED'
    if (!paymentCompleted) return
    errorMessage = 'Payment completed'
    await completeEnrolment(apiResponse.lastStatus.response)
    if (errorMessage === '') {
      goto(`/enrolment-success`)
      fetchingData = false
      return
    }
    currentState = validStates.ERROR
    fetchingData = false
    return
  }

  async function completeEnrolment(squarePaymentResponse) {
    // console.log('completeEnrolment: here')
    // console.log(squarePaymentResponse.payment.receiptUrl)
    const wasFetching = fetchingData
    fetchingData = true
    errorMessage = 'Recording your enrolment and sending you an email - please be patient'
    const response = await sendToSheetsApp({
      data: {
        name: $currentUserName,
        email: $currentUserEmail,
        coursesEnroled: userEnrolments,
        paymentReceipt: apiResponse.lastStatus.response.payment.receiptUrl,
      },
      requestType: 'addEnrolments',
    })
    // console.log('completeEnrolment', JSON.stringify(response, null, 2))
    if (response.result === 'error') {
      errorMessage = response.data
      handleUnexpectedError(errorMessage)
      fetchingData = wasFetching
      return
    }
    errorMessage = ''
    fetchingData = wasFetching
    return
  }

  async function handlePaymentSubmission() {
    const wasFetching = fetchingData
    fetchingData = true
    // console.log('handlePaymentSubmission: here')
    errorMessage = 'Sending payment to Card Processor (Square)'
    let token
    try {
      token = await tokenize(card)
    } catch (e) {
      errorMessage = 'Card details not correct - try again'
      console.error(e.message)
      fetchingData = wasFetching
      return
    }
    apiResponse.lastStatus = {}
    try {
      const paymentResponse = await fetch(`/api/payment`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          locationId: PUBLIC_SQUARE_LOCATION_ID,
          sourceId: token,
          amount: costOfEnrolmentInCents,
          email: $currentUserEmail,
          note: `Enrolment - ${$currentUserName} (${$currentUserEmail}) ${JSON.stringify($coursesEnroled, null, 2)}`,
          reference_id: `Enrolment - ${$currentUserName} (${$currentUserEmail}) (ref) `,
        }),
      })
      const data = await processResponse(paymentResponse)
      console.log(`handlePaymentSubmission-data: ${JSON.stringify(data, null, 4)}`)
      apiResponse.lastStatus.response = data
      if (!apiResponse.lastStatus.ok) {
        errorMessage = `Payment Failed, try again later - ${handleError(apiResponse.lastStatus).detail}`
        currentState = validStates.PAYMENTERROR
        return
      }
      // Payment response was ok
      fetchingData = wasFetching
      return
    } catch (err) {
      console.log('handlePaymentSubmission-err' + err)
      currentState = validStates.PAYMENTERROR
      errorMessage = 'Payment failed'
      handleUnexpectedError(err)
      throw new Error(err)
    }
  }

  // $: apiThings = apiResponse //debugging
</script>

<div>
  {#if !$currentUserName}
    <h1 class="mb-6 text-xl font-bold">Please enrol first</h1>
    <a
      class="rounded-md bg-secondary-300 px-5 py-1 text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-secondary-400 hover:shadow-lg focus:bg-secondary-400 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-secondary-200 active:shadow-lg"
      href="https://u3abermagui.com.au/current-program/">Back to the Program</a
    >
  {:else}
    <div class="mt-4">
      <p class="text-xl mt-6">For: {$currentUserName}</p>
      <p class="mt-1 px-10">{$currentUserEmail}</p>
      <p class="mt-6 text-xl text-primary-400">
        Your enrolment has a total fee of ${costOfEnrolment}
      </p>
    </div>
    {#if errorMessage}
      <p class="mt-6 text-red-500">{errorMessage}</p>
    {:else}
      <p class="mt-6">&nbsp</p>
    {/if}
    {#if fetchingData}
      <div
        style="border-top-color:transparent"
        class="m-6 h-16 w-16 animate-spin rounded-full border-8 border-solid border-accent"
      />
    {/if}
    {#if currentState === validStates.COMMENCING || currentState === validStates.PAYMENTERROR}
      <div class="mt-6 max-w-prose px-3">
        <form
          on:submit|preventDefault={() => {
            readyToPay()
          }}
          id="payment-form"
          method="POST"
        >
          <!-- this is the container that gets the Credit Card fields dropped into it by Square -->
          <div id="card-container" class="w-100 mx-auto" />
          <button
            type="submit"
            disabled={fetchingData}
            class="mt-8 inline-block w-auto rounded-lg bg-secondary-300 px-7 py-3 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-secondary-400 hover:shadow-lg focus:bg-secondary-400 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-secondary-200 active:shadow-lg disabled:cursor-not-allowed"
            >Pay Enrolment of ${costOfEnrolment}</button
          >
        </form>
      </div>
    {/if}

    {#if currentState === validStates.ERROR}
      <h3 class="mt-6 text-xl font-bold text-accent">?SOMETHING WENT WRONG!</h3>
      <p class="text-accent">Please contact us and let us know - contact@u3abermagui.com</p>
    {/if}
  {/if}
</div>
