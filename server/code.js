this.CONFIG = {
  TERM_SHEET: '1ACJNTS7f8-9r9M9hommyg2pHtHgWjUH2kaQqC_7VyDE',
  SAMPLE_DETAIL: {
    title: '',
    presenter: '',
  },
}

function testadd() {
  const ss = SpreadsheetApp.openById(CONFIG.TERM_SHEET)
  const res = addEnrolments(
    {
      name: 'George1 Stone',
      email: 'george1@westborn.com.au',
      coursesEnrolled: [
        { title: 'testing', status: 'Enrol?' },
        { title: 'tester', status: 'Waitlist?' },
      ],
    },
    ss
  )
  console.log(res.getContent())
}

function testget() {
  const ss = SpreadsheetApp.openById(CONFIG.TERM_SHEET)
  const res = getCourseDetails('', ss)
  console.log(res.getContent())
}

function doPost(e) {
  // Original URL:    ScriptApp.getService().getUrl()
  // queryString:     e.queryString
  // parameter:       JSON.stringify(e.parameter, null, 2)
  // parameters:      JSON.stringify(e.parameters, null, 2)
  // content(parsed): JSON.stringify(JSON.parse(e.postData.contents), null, 2)

  if (!e.parameter.requestType) {
    console.log('No Function Specified')
    return sendResponse('error', 'No data in POST')
  }

  try {
    var ss = SpreadsheetApp.openById(CONFIG.TERM_SHEET)
    var request = JSON.parse(e.postData.contents)
    const requestType = e.parameter.requestType
    var res
    switch (requestType) {
      case 'getCourseDetail':
        res = getCourseDetails(request, ss)
        break
      case 'addEnrolments':
        res = addEnrolments(request, ss)
        break
      default:
        console.log(request.data)
        res = sendResponse('error', 'Unknown Function')
        break
    }
  } catch (err) {
    console.log(err)
    res = sendResponse('error', err)
  }
  return res
}

function getCourseDetails(request, ss) {
  //now get the details for all courses
  const courseData = ss.getSheetByName('CourseDetails').getDataRange().getValues()
  const allCourses = wbLib.getJsonArrayFromData(courseData)
  return sendResponse('ok', { data: allCourses })
}

function addEnrolments(request, ss) {
  if (!request.name || request.name.trim() === '') {
    return sendResponse('error', 'Invalid name for enrolment')
  }
  if (!request.email || request.email.trim() === '') {
    return sendResponse('error', 'Invalid email for enrolment')
  }
  if (!request.coursesEnrolled || request.coursesEnrolled.length === 0) {
    return sendResponse('error', 'No courses fror enrolment')
  }
  const enrolmentSheet = ss.getSheetByName('OnlineEnrolments')

  //map the enrolments to an array of ["name", "email", courseEnroled]
  const enrolments = request.coursesEnrolled.map((course) => [
    new Date(),
    request.name,
    request.email,
    course.title,
    course.status,
  ])

  //write all the enrolments for this member to the sheet
  enrolmentSheet
    .getRange(enrolmentSheet.getLastRow() + 1, 1, enrolments.length, enrolments[0].length)
    .setValues(enrolments)

  //set a formula in the last 2 columns as error checking
  const headers = enrolmentSheet.getRange(1, 1, 1, enrolmentSheet.getLastColumn()).getValues().shift()
  const nameCheckCol = headers.indexOf('nameCheck') + 1
  const emailCheckCol = headers.indexOf('emailCheck') + 1
  const lastRow = enrolmentSheet.getLastRow() - 1
  var fillDownRange

  // nameCheck formula
  enrolmentSheet
    .getRange(2, nameCheckCol, 1, 1)
    .setFormula('=ArrayFormula(index(Members,match(TRUE, exact(B2,memberName),0),1))')
  fillDownRange = enrolmentSheet.getRange(2, nameCheckCol, lastRow)
  enrolmentSheet.getRange(2, nameCheckCol, 1, 1).copyTo(fillDownRange)

  // emailCheck formula
  enrolmentSheet
    .getRange(2, emailCheckCol, 1, 1)
    .setFormula('=ArrayFormula(index(Members,match(TRUE, exact(C2,memberEmail),0),1))')
  fillDownRange = enrolmentSheet.getRange(2, emailCheckCol, lastRow)
  enrolmentSheet.getRange(2, emailCheckCol, 1, 1).copyTo(fillDownRange)

  // get all the enrolments to-date
  const enrolmentData = enrolmentSheet.getDataRange().getValues()
  const allEnrolments = wbLib.getJsonArrayFromData(enrolmentData)

  // sum them by enrolment type (enrol or waitlist)
  const occurrences = allEnrolments
    .reduce((acc, curr, idx) => {
      if (acc[curr.courseEnrolledIn]) {
        ++acc[curr.courseEnrolledIn][curr.status === 'Enrol?' ? 'enrol' : 'waitlist']
      } else {
        acc[curr.courseEnrolledIn] = { enrol: curr.status === 'Enrol?' ? 1 : 0, waitlist: curr.status === 'Waitlist?' ? 1 : 0 }
      }
      return acc
    }, {})
  console.log(Object.keys(occurrences))
  console.log(Object.values(occurrences))
  console.log(Object.entries(occurrences))
  console.log(Object.values(occurrences).reduce((acc, {enrol, waitlist}) => {return acc+ enrol + waitlist}, 0))

  const a = Object.entries(occurrences).map(([title, { enrol, waitlist }]) => { return ({ title: title, total: enrol + waitlist }) })
  console.log(JSON.stringify(a, null, 2))

  //get courseDetail sheet
  const courseData = ss.getSheetByName('CourseDetails').getDataRange().getValues()
  const allCourses = wbLib.getJsonArrayFromData(courseData)
  const courseHeaders = courseData.shift()

  // we're done here
  return sendResponse('ok', { data: enrolments })
}

function sendResponse(status, data) {
  try {
    return ContentService.createTextOutput(JSON.stringify({ result: status, data: data })).setMimeType(
      ContentService.MimeType.JSON
    )
  } catch (err) {
    console.log(err)
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', data: err })).setMimeType(
      ContentService.MimeType.JSON
    )
  }
}
