import { writable } from 'svelte/store'

const currentUserEmail = writable(null)
const currentUserName = writable(null)
const coursesEnroled = writable([])

export { currentUserEmail, currentUserName, coursesEnroled }
