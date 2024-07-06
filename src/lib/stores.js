import { writable } from 'svelte/store'

const currentUserEmail = writable(null)
const currentUserName = writable(null)
const coursesEnroled = writable([])
const courseDetails = writable([])

export { currentUserEmail, currentUserName, coursesEnroled, courseDetails }
