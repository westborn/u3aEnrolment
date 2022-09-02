this.CONFIG = {
  TERM_SHEET: '1PFIu02Bn4CkuC6gbWaLlh_yFFEqKbsnXIUlQxl202E0',
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
      coursesEnroled: [
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
    console.log('Function Failed: ', err)
    res = sendResponse('error', `Function Failed - ${err}`)
  }
  return res
}

function getCourseDetails(request, ss) {
  //now get the details for all courses
  const courseData = ss.getSheetByName('CourseDetails').getDataRange().getValues()
  const allCourses = wbLib.getJsonArrayFromData(courseData)
  return sendResponse('ok', { data: allCourses })
}

function validateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true
  }
  return false
}

function addEnrolments(request, ss) {
  if (!request.name || request.name.trim() === '') {
    return sendResponse('error', 'Invalid name for enrolment')
  }
  if (!request.email || validateEmail(request.email) === false) {
    return sendResponse('error', 'Invalid email for enrolment')
  }
  if (!request.coursesEnroled || request.coursesEnroled.length === 0) {
    return sendResponse('error', 'No courses fror enrolment')
  }
  const enrolmentSheet = ss.getSheetByName('OnlineEnrolments')

  //map the enrolments to an array of ["name", "email", courseEnroled]
  const enrolments = request.coursesEnroled.map((course) => [
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

  //get the list of titles that the user enroled for and update 'CourseDetails' sheet
  const enroledCourses = request.coursesEnroled.map((course) => course.title)
  updateEnrolmentStats(ss, enroledCourses)

  // we're done here
  return sendResponse('ok', { data: enrolments })
}

function sendResponse(status, data) {
  try {
    return ContentService.createTextOutput(JSON.stringify({ result: status, data: data })).setMimeType(
      ContentService.MimeType.JSON
    )
  } catch (err) {
    console.log('SendResponse: ', err)
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', data: err })).setMimeType(
      ContentService.MimeType.JSON
    )
  }
}

function updateEnrolmentStats(ss, enroledCourses) {
  const courseData = ss.getSheetByName('CourseDetails').getDataRange().getValues()
  const allCourses = wbLib.getJsonArrayFromData(courseData)
  const columnnHeadings = courseData[0]

  for (const enroledCourse of enroledCourses) {
    const selectedCourse = allCourses.find((course) => course.title === enroledCourse)
    if (selectedCourse.courseStatus === 'Enrol?') {
      selectedCourse.numberCurrentlyEnroled++
      selectedCourse.courseStatus =
        selectedCourse.max > 0 && selectedCourse.numberCurrentlyEnroled >= selectedCourse.max ? 'Waitlist?' : 'Enrol?'
    }
  }

  var columnData, columnNumber
  columnData = allCourses.map((column) => [column.numberCurrentlyEnroled])
  columnNumber = columnnHeadings.indexOf('numberCurrentlyEnroled') + 1
  ss.getSheetByName('CourseDetails').getRange(2, columnNumber, columnData.length, 1).setValues(columnData)

  columnData = allCourses.map((column) => [column.courseStatus])
  columnNumber = columnnHeadings.indexOf('courseStatus') + 1
  ss.getSheetByName('CourseDetails').getRange(2, columnNumber, columnData.length, 1).setValues(columnData)
}
