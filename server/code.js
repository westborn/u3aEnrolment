this.CONFIG = {
  TERM_SHEET: "1ACJNTS7f8-9r9M9hommyg2pHtHgWjUH2kaQqC_7VyDE",
  SAMPLE_DETAIL: {
    title: '',
    presenter: ''
  }
}

function test() {
  const ss = SpreadsheetApp.openById(CONFIG.TERM_SHEET)
  const res = getCourseDetails("", ss)
  console.log(res.getContent())
}

function doPost(e) {
  // Original URL:    ScriptApp.getService().getUrl()
  // queryString:     e.queryString
  // parameter:       JSON.stringify(e.parameter, null, 2)
  // parameters:      JSON.stringify(e.parameters, null, 2)
  // content(parsed): JSON.stringify(JSON.parse(e.postData.contents), null, 2)

  if (!e.parameter.requestType) {
    console.log("No Function Specified")
    return sendResponse('error', 'No data in POST')
  }

  try {
    var ss = SpreadsheetApp.openById(CONFIG.TERM_SHEET)
    var request = JSON.parse(e.postData.contents)
    const requestType = e.parameter.requestType
    var res
    switch (requestType) {
      case "getCourseDetail":
        res = getCourseDetails(request, ss)
        break
      default:
        console.log(request.data)
        res = sendResponse('error', 'Unknown Function')
        break
    }
  }
  catch (err) {
    console.log(err)
    res = sendResponse('error', err)
  }
  return res
}

function getCourseDetails(request, ss) {
  //now get the details for all courses
  var courseSheet = ss.getSheetByName('CourseDetails')
  console.log(courseSheet)
  const courseData = courseSheet.getDataRange().getValues()
  const allCourses = wbLib.getJsonArrayFromData(courseData)
  return sendResponse('ok', { data: allCourses })
}


function sendResponse(status, data) {
  try {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': status, 'data': data }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  catch (err) {
    console.log(err)
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'data': err }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


