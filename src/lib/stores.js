import { writable } from 'svelte/store'

const currentUserEmail = writable(null)
const currentUserName = writable(null)
const coursesEnrolled = writable([])

export { currentUserEmail, currentUserName, coursesEnrolled }
