this.CONFIG = {
  TERM_SHEET: '1ACJNTS7f8-9r9M9hommyg2pHtHgWjUH2kaQqC_7VyDE',
  SAMPLE_DETAIL: {
    title: '',
    presenter: '',
  },
}

function testget() {
  const ss = SpreadsheetApp.openById(CONFIG.TERM_SHEET)
  const res = getCourseDetails('', ss)
  console.log(res.getContent())
}

function testadd() {
  const ss = SpreadsheetApp.openById(CONFIG.TERM_SHEET)
  const res = addEnrolments(
    { name: 'George Stone', email: 'george@westborn.com.au', coursesEnrolled: ['testing', 'tester'] },
    ss
  )
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
  var courseSheet = ss.getSheetByName('CourseDetails')
  const courseData = courseSheet.getDataRange().getValues()
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
  //get courseDetail sheet
  const courseData = ss.getSheetByName('CourseDetails').getDataRange().getValues()
  const allCourses = wbLib.getJsonArrayFromData(courseData)

  var enrolmentSheet = ss.getSheetByName('OnlineEnrolments')

  //map the enrolments to an array of ["name", "email", courseEnroled]
  const enrolments = request.coursesEnrolled.map((course) => [
    new Date(),
    request.name,
    request.email,
    course.title,
    course.status,
  ])

  //write the enrolments for this member to the sheet
  enrolmentSheet
    .getRange(enrolmentSheet.getLastRow() + 1, 1, enrolments.length, enrolments[0].length)
    .setValues(enrolments)

  //set a formula in the last 2 columns as error checking
  const formulas = [
    'ArrayFormula(index(Members,match(TRUE, exact(B2,memberName),0),1))',
    'ArrayFormula(index(Members,match(TRUE, exact(C2,memberEmail),0),1))',
  ]
  enrolmentSheet.getRange(2, 6, 1, 2).setFormulas([formulas])
  const fillDownRange = enrolmentSheet.getRange(2, 6, enrolmentSheet.getLastRow() - 1)
  enrolmentSheet.getRange(2, 6, 1, 2).copyTo(fillDownRange)

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
