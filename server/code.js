// function testget() {
//   const ssId = wbLib.getCONFIG('AA_CourseCONFIG.JSON').COURSE_SHEET_ID
//   const ss = SpreadsheetApp.openById(ssId)
//   const res = getCourseDetails('', ss)
//   console.log(res.getContent())
// }

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
    const ssId = wbLib.getCONFIG('AA_CourseCONFIG.JSON').COURSE_SHEET_ID
    const ss = SpreadsheetApp.openById(ssId)
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
    return sendResponse('error', 'No courses selectedCourse for enrolment')
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
  const membershipStatusCheckCol = headers.indexOf('membershipStatus') + 1

  function setFormulaAndFillDown(sheet, col, formula) {
    const lastRow = sheet.getLastRow() - 1 // Adjusted to get the correct last row
    sheet.getRange(2, col, 1, 1).setFormula(formula)
    let fillDownRange = sheet.getRange(2, col, lastRow)
    sheet.getRange(2, col, 1, 1).copyTo(fillDownRange)
  }

  // nameCheck formula
  setFormulaAndFillDown(
    enrolmentSheet,
    nameCheckCol,
    '=ArrayFormula(index(Members,match(TRUE, exact(B2,memberName),0),1))'
  )
  // emailCheck formula
  setFormulaAndFillDown(
    enrolmentSheet,
    emailCheckCol,
    '=ArrayFormula(index(Members,match(TRUE, exact(C2,memberEmail),0),1))'
  )
  // membershipStatus formula
  setFormulaAndFillDown(enrolmentSheet, membershipStatusCheckCol, '=vlookup(B2,Members,7,false)')

  //get the list of titles that the user enroled, with a status of "Enrol?"
  const enroledCourses = request.coursesEnroled.reduce((acc, course) => {
    if (course.status === 'Enrol?') {
      acc.push(course.title)
    }
    return acc
  }, [])
  updateEnrolmentStats(ss, enroledCourses)

  // send an email confirmation with all enrolments
  // get all the course details
  const courseData = ss.getSheetByName('CourseDetails').getDataRange().getValues()
  const allCourses = wbLib.getJsonArrayFromData(courseData)

  // loop through enroled courses
  const enroledCourseList = request.coursesEnroled.filter((course) => course.status === 'Enrol?')
  const enrolHTML =
    enroledCourseList.length > 0
      ? `<p style="background-color: #d25f15; color: #f1f1f1; font-weight: bold">Courses you are Enroled for:</p>
    ${buildHTMLOutput(enroledCourseList, allCourses)}`
      : ''

  // loop through waitlisted courses
  const waitlistedCourseList = request.coursesEnroled.filter((course) => course.status === 'Waitlist?')
  const waitlistHTML =
    waitlistedCourseList.length > 0
      ? `<p style="background-color: #d25f15; color: #f1f1f1; font-weight: bold">Courses you are Waitlisted for:</p>
      ${buildHTMLOutput(waitlistedCourseList, allCourses)}`
      : ''

  const paymentReceipt = request.paymentReceipt ? `<p>Payment Receipt: ${request.paymentReceipt}</p><br>` : ''

  const memberData = ss.getSheetByName('MemberDetails').getDataRange().getValues()
  const allMembers = wbLib.getJsonArrayFromData(memberData)
  const memberEmail = allMembers.find((member) => member.email === request.email)
  const knownEmailMessage = memberEmail
    ? ``
    : `
<p style="color: #FF0000">Please be aware that we were not able to adequately verify your email address.
<br>Your membership may have lapsed, or you may not be a member yet. (or we may have slipped up somewhere)
<br>We will contact you directly to try to resolve your membership status, however, you have been enrolled/waitlisted for the courses shown in this email.
<br></p>`

  const fieldReplacer = {
    memberName: request.name,
    classInfo: enrolHTML + paymentReceipt + waitlistHTML + knownEmailMessage,
  }
  // get the draft Gmail message to use as a template
  const emailTemplate = wbLib.getGmailTemplateFromDrafts('TEMPLATE - Course Enrolment Confirmation')

  try {
    const msgObj = wbLib.fillinTemplateFromObject(emailTemplate.message, fieldReplacer)
    const msgText = wbLib.stripHTML(msgObj.text)
    //
    // GmailApp.createDraft(request.email, 'U3A Bermagui - Course Enrolment Confirmation', msgText, {
    // OR
    // GmailApp.sendEmail(request.email, 'U3A Bermagui - Course Enrolment Confirmation', msgText, {
    //
    GmailApp.sendEmail(request.email, 'U3A Bermagui - Course Enrolment Confirmation', msgText, {
      htmlBody: msgObj.html,
      // bcc: 'a.bbc@email.com',
      // cc: 'a.cc@email.com',
      // from: 'an.alias@email.com',
      // name: 'name of the sender',
      // replyTo: 'a.reply@email.com',
      attachments: emailTemplate.attachments,
    })
  } catch (e) {
    throw new Error("Oops - can't create new Gmail draft")
  }

  // we're done here
  return sendResponse('ok', { data: enrolments })
}

function buildHTMLOutput(courseList, allCourses) {
  const res = courseList
    .map((courseItem) => {
      const cR = allCourses.find((course) => course.title === courseItem.title)
      const withPresenter = cR.presenter ? ` with ${cR.presenter}` : ''
      const tmp = `
    <b>${cR.title}</b><font color="#606060">${withPresenter}</font>
    <br>&nbsp;&nbsp;&nbsp;&nbsp;When: ${cR.days} ${cR.dates}
    <br>&nbsp;&nbsp;&nbsp;&nbsp;Time: ${cR.time}
    <br>&nbsp;&nbsp;&nbsp;&nbsp;Where: ${cR.location}
    <br>&nbsp;&nbsp;&nbsp;&nbsp;Contact: ${cR.contact} - ${cR.phone}
    <br>
    <br>
    `
      return tmp
    })
    .join('<br>')
  return res
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
    selectedCourse.numberCurrentlyEnroled++
    selectedCourse.courseStatus =
      selectedCourse.max > 0 && selectedCourse.numberCurrentlyEnroled >= selectedCourse.max ? 'Waitlist?' : 'Enrol?'
  }

  var columnData, columnNumber
  columnData = allCourses.map((column) => [column.numberCurrentlyEnroled])
  columnNumber = columnnHeadings.indexOf('numberCurrentlyEnroled') + 1
  ss.getSheetByName('CourseDetails').getRange(2, columnNumber, columnData.length, 1).setValues(columnData)

  columnData = allCourses.map((column) => [column.courseStatus])
  columnNumber = columnnHeadings.indexOf('courseStatus') + 1
  ss.getSheetByName('CourseDetails').getRange(2, columnNumber, columnData.length, 1).setValues(columnData)
}
