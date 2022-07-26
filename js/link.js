var clickedHrs = [];
var checkbox_ids = [700, 701, 702, 703];
var isDialogOpen = false;
var submitStatus = 600;
var statusCode = 0;
var values = {};
var checkBox401 = "";
var daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
var daysOfWeekShort = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
var todaysDate = new Date().getDate();
var currentMonth = new Date().getMonth();
var currentYear = new Date().getFullYear();
var currentSelectedMonth;
var currentSelectedYear;
var currentWeek = [];
var daysOfTheMonth = [];
var titleDate;
var clickedDay = 0;
var isNotInMonth = false;
var timetableData;
var currentWeekData = [];
var cwDates = [];
var clockOpenClassName = "test-class";
var increaseTimer;
var increaseTimeInterval;
var coursesData = [];
var delCourseVar = -1;

window.onload = () => {

    dashboardComponent();

    $('#courses').on('click', getCourses);
    $('#dashboard').on('click', dashboardComponent);
    $('#recipes').on('click', recipeComponent);


    $(window).resize(function (){
        if (isDialogOpen){
            let mLeft = ($(".main-container").width()/2) - 200;
            let mTop = ($(".main-container").height()/2) - 100;
            $(".dialog").css("margin-top", mTop);
            $(".dialog").css("margin-left", mLeft);
        }
    });
}

function dashboardComponent(){ 
    let data = {
        status: 500
    }
    window.api.send("getDashboardData", data);

    return new Promise((resolve, reject) => {
        window.api.receive("receiveDashboardData", (res) => {
            console.log("Current Timetable Data", timetableData);
            const result = JSON.parse(res[0]);
            timetableData = result;
            console.log("results sent", result);
            loadDashBoardComponents();
            resolve("okay")
            reject("err")
        });
    })
}

function getCourses(){
    if (isDialogOpen){
        cancelDialog();
        isDialogOpen = false;
    }
    let data = {
        status: 500
    }
    window.api.send("getCourses", data);
    window.api.receive("receiveCourses", (res) => {
        const result = JSON.parse(res[0]);
        console.log("results sent", result);
        coursesData = result;
        courseComponent();
    });
}

function courseComponent(){
    $("#component-holder").empty();

    // Top Bar
    let topBar = document.createElement('div');
    topBar.classList.add("top-bar");

    let h1TopBar = document.createElement('h3');
    h1TopBar.classList.add("flexed-div");

    let title = document.createElement("div");
    title.classList.add("date-text");
    title.innerHTML = "Courses";

    let btnHolder = document.createElement("div");
    btnHolder.classList.add("new-course-btn-holder");

    let btn = document.createElement("div");
    btn.classList.add("new-course-btn");
    btn.classList.add("float-right");
    btn.classList.add("btn");
    btn.innerHTML = "NEW COURSE";
    btn.addEventListener("click", newCourseComponent);


    btnHolder.append(btn);

    h1TopBar.append(title, btnHolder);

    let hr = document.createElement("hr");
    topBar.append(h1TopBar, hr);


    // Courses Bar
    let coursesDiv = document.createElement("div");
    coursesDiv.classList.add("flexed-div");
    coursesDiv.classList.add("courses-div");
    
    coursesData.forEach((cd) => {
        let fmtdCourseName = cd["COURSE_NAME"].includes(" ") ? cd["COURSE_NAME"].replace(" ", "") :cd["COURSE_NAME"];
        console.log("formated Course name", fmtdCourseName);
        let courseHolder = document.createElement("div");
        courseHolder.classList.add("course-holder");

        let buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("top-buttons-div");
        buttonsDiv.classList.add("flexed-div");

        let editDiv = document.createElement("div");
        let editInfoBar = document.createElement("div");
        editInfoBar.classList.add("edit-info-bar-" + fmtdCourseName);
    
        let editCtrlDiv = createSvgDiv("edit", "task-edit-" + fmtdCourseName, function(){

        }, function(){
            addInfoBar(this, "Edit Course", "edit-info-bar-" + fmtdCourseName);
            $("#task-edit-" + fmtdCourseName).addClass("icon-edit-hover");
        }, function(){
            $("#task-edit-" + fmtdCourseName).removeClass("icon-edit-hover");
        }, []);
    
        editDiv.append(editCtrlDiv, editInfoBar);
        
        let delDiv = document.createElement("div");
        let delInfoBar = document.createElement("div");
        delInfoBar.classList.add("del-info-bar-" + fmtdCourseName);
    
        let delCtrlDiv = createSvgDiv("delete", "task-del-" + fmtdCourseName, function(){
            delCourseVar = cd['id'];
            launchDialog("Delete " + cd["COURSE_NAME"], 
            "Are you sure you want to delete this course? Action is unreversible.", 
            [{name: "CANCEL", func: enableCourseComponents}, {name: "DELETE", func: deleteCourse}], {func: enableCourseComponents}, [], true);
        }, function(){
            addInfoBar(this, "Delete Course", "del-info-bar-" + fmtdCourseName);
            $("#task-del-" + fmtdCourseName).addClass("icon-warn-hover");
        }, function(){
            $("#task-del-" + fmtdCourseName).removeClass("icon-warn-hover");
        }, [])
        
        delDiv.append(delCtrlDiv, delInfoBar);

        buttonsDiv.append(delDiv, editDiv);

        let detailsDiv = document.createElement("div");
        detailsDiv.classList.add("first-details-div");

        let nameDiv = document.createElement("div");
        nameDiv.innerHTML = cd["COURSE_NAME"];

        let dateDiv = document.createElement("div");
        dateDiv.innerHTML = cd["START_TIME"] + " to " + cd["END_TIME"];

        detailsDiv.append(nameDiv, dateDiv);

        courseHolder.append(buttonsDiv, detailsDiv);
        coursesDiv.append(courseHolder);
    });

    $("#component-holder").append(topBar, coursesDiv);
}

function deleteCourse(){
    console.log("del course var",delCourseVar);
    let delData = {
        "id": delCourseVar,
        "status": 2001
    }
    window.api.send("deleteTask", delData);
    cancelDialog();
    getCourses();
}

function loadDashBoardComponents(){
    $("#component-holder").empty();
    
    // Top Bar
    let topBar = document.createElement('div');
    topBar.classList.add("top-bar");

    let today = new Date();
    titleDate = today.toLocaleString('default', { month: 'long' }) + " " + today.getFullYear();
    let h1TopBar = document.createElement('h3');
    h1TopBar.innerHTML =  titleDate;
    let hr = document.createElement("hr");
    topBar.append(h1TopBar, hr);

    // Day Bar
    daysOfTheMonth = getDaysOfMonth(new Date());
    getCurrentWeekData();
    let dayBarHolder = document.createElement("div");
    dayBarHolder.classList.add("day-bar-holder");
    dayBarHolder.classList.add("full-width");
    dayBarHolder.setAttribute("id", "day-bar-holder");

    let dayBarRes = createDayBar();
    let dayBar = dayBarRes[0];
    let cb = dayBarRes[1]

    dayBarHolder.append(dayBar, cb);

    // Second Bar
    let secondBar = document.createElement("div");
    secondBar.classList.add("second-bar");
    secondBar.classList.add("full-width");
    secondBar.setAttribute("id", "second-bar");

    let ctrlSecondBar = document.createElement("div");
    ctrlSecondBar.classList.add("ctrl-second-bar");
    ctrlSecondBar.classList.add("full-width");
    ctrlSecondBar.classList.add("flexed-div");

    // Time Bar
    let timeBar = document.createElement("div");
    timeBar.classList.add("time-bar");

    for (let i=1; i<=23; i++) {
        let hrBar = document.createElement("div");
        hrBar.classList.add("hr-bar");

        let hr = document.createElement("p");
        hr.classList.add("time-bar-text");
        if (i < 12)
            hr.innerHTML = i + " AM";
        else
            hr.innerHTML = (i == 12 ? i : (i-12)) + " PM";
        hrBar.append(hr);
        // if (i != 0){

        // }
        
        timeBar.append(hrBar)
    }

    // Tasks Bar
    let taskTableHolder = document.createElement("div");
    taskTableHolder.setAttribute("id", "tasks-holder");
    taskTableHolder.classList.add("full-width");
    let taskTableBar = createTaskTableBar();
    taskTableHolder.append(taskTableBar);

    let calendarBar = createCalendarBar();
    ctrlSecondBar.append(timeBar, taskTableHolder);
    secondBar.append(ctrlSecondBar, calendarBar);
    $("#component-holder").append(topBar, dayBarHolder, secondBar);

    $("#1st").css("border-left", "1px solid #DADCE0");
    
}

function createTaskTableBar(){
    let taskTableBar = document.createElement("div");
    taskTableBar.classList.add("tasks-bar");
    taskTableBar.classList.add("full-width");

    for (let i=0; i<7; i++){
        let dailyBar = document.createElement("div");
        dailyBar.classList.add("daily-tasks-bar");
        
        if (i == 0){
            dailyBar.setAttribute("id", "1st");
        }

        let dailyData = getDailyData(cwDates[i]);
        let data = dailyData[0];
        let startHrs = dailyData[1];
        const currentDay = new Date(currentWeek[i]['year'] + "-" + (currentWeek[i]['month'] + 1) + "-" + currentWeek[i]['date']);

        for(let j=0; j<24; j++){
            let hrBar = document.createElement("div");
            hrBar.classList.add("task-hr-bar");
            hrBar.addEventListener("click", launchScheduleDialog);
            hrBar.setAttribute("date", currentDay.toDateString());
            hrBar.setAttribute("hr", j);

            if (startHrs.includes(j)){
                
                hr_data = data[startHrs.indexOf(j)];
                hrBar.setAttribute("idx", hr_data['id']);
                let startHr = parseInt(hr_data['start_hour']);
                let startMin = parseInt(hr_data['start_minute']);
                let startAmPm = hr_data['start_pm_am'];

                let endHr = parseInt(hr_data['end_hour']);
                let endMin = parseInt(hr_data['end_minute']);
                let endAmPm = hr_data['end_pm_am'];

                let duration = (endHr + (endMin > 0 ? endMin/60 : 0)) - (startHr + (startMin > 0 ? startMin/60 : 0));
                // console.log("start hr, end hr, endmin, duration", startHr, endHr, endMin, duration);
                let taskHolder = document.createElement('div');
                taskHolder.classList.add("task-holder");
                // taskHolder.setAttribute("style", "height: " + (duration * 30) + "px;");

                let para = document.createElement("div");
                para.innerHTML = hr_data['task_name'];

                let timePara = document.createElement("div");
                timePara.innerHTML = startHr + ":" + (startMin < 9 ? "0" + startMin : startMin) + startAmPm + " - " + endHr + ":" + (endMin < 9 ? "0" + endMin : endMin) + endAmPm;

                taskHolder.append(para, timePara);

                hrBar.append(taskHolder);
            }

            dailyBar.append(hrBar);
        }

        taskTableBar.append(dailyBar);
    }
    return taskTableBar;
}

function createDayBar(){
    let dayBar = document.createElement("div");
    dayBar.classList.add("day-bar");
    dayBar.classList.add("full-width");

    let dayRow = document.createElement("div");
    dayRow.classList.add("row");
    dayRow.classList.add("day-row-bar");

    for (let i=1; i<8; i++){
        let dayCol = document.createElement("div");
        dayCol.classList.add("col-sm");
        dayCol.classList.add("day-col");

        let dayName = document.createElement("p");
        dayName.classList.add("day-name");
        dayName.innerHTML = daysOfWeekShort[i-1];
        
        let dayNum = document.createElement("div");
        dayNum.classList.add("day-num");
        dayNum.classList.add("btn");

        dayNum.innerHTML = currentWeek[i-1]['date'];
        if (currentWeek[i-1]['date'] == todaysDate && currentWeek[i-1]['month'] == currentMonth && currentWeek[i-1]['year'] == currentYear)
            dayNum.classList.add("today");

        dayCol.append(dayName, dayNum);
        dayRow.append(dayCol);
    }

    dayBar.append(dayRow);

    let cb = document.createElement("div");
    cb.classList.add("cb");

    return [dayBar, cb];
}

function createCalendarBar(){

    let calendarBar = document.createElement("div");
    calendarBar.classList.add("calendar-bar");
    calendarBar.setAttribute("id", "calendarBar");

    let calendarTitleHolder = document.createElement("div");
    calendarTitleHolder.classList.add("calendar-title-holder");

    let dateText = document.createElement("div");
    dateText.classList.add("date-text");
    dateText.innerHTML = titleDate;

    let arrowsDiv =  document.createElement("div");
    arrowsDiv.classList.add("arrows-div");

    let nextDiv = document.createElement("div");
    let nextInfoBar = document.createElement("div");
    nextInfoBar.classList.add("next-info-bar");

    let next = document.createElement("div");
    next.classList.add("next-prev");
    next.setAttribute("id", "#next-month");
    next.classList.add("btn");
    next.innerHTML = ">";
    next.addEventListener("mouseover", function(){
        addInfoBar(this, "Next Month", "next-info-bar")
    })
    next.addEventListener("click", nextMonth);
    nextDiv.append(next, nextInfoBar);

    let prevDiv = document.createElement("div");
    let prevInfoBar = document.createElement("div");
    prevInfoBar.classList.add("prev-info-bar");

    let prev = document.createElement("div");
    prev.classList.add("next-prev");
    prev.setAttribute("id", "#prev-month");
    prev.classList.add("btn");
    prev.innerHTML = "<";
    prev.addEventListener("mouseover", function(){
        addInfoBar(this, "Previous Month", "prev-info-bar")
    });
    prev.addEventListener("click", prevMonth);
    prevDiv.append(prev, prevInfoBar);

    arrowsDiv.append(prevDiv, nextDiv);
    calendarTitleHolder.append(dateText, arrowsDiv);

    let monthDaysHolder = document.createElement("div");

    for (let i=0; i<daysOfTheMonth.length; i++){
        let week = document.createElement("div");
        week.classList.add("week");
        let wk = daysOfTheMonth[i];
        for (let j=0; j<wk.length; j++){

            let dayOfWeek = document.createElement("div");
            
            if (i != 0){
                dayOfWeek.classList.add("btn");
                dayOfWeek.innerHTML = wk[j]['date'];
                let id = "" + wk[j]['date'] + wk[j]['month'] + wk[j]['year']
                dayOfWeek.setAttribute("id", id);
                if (!wk[j]['this_month']) {
                    dayOfWeek.classList.add("prev-month");
                    dayOfWeek.addEventListener("click", function(){
                        let day_id = $(this).attr("id");
                        
                        if (clickedDay == day_id) {
                            $(this).css("background-color", "white");
                            $(this).css("color", "#86a3f5");
                            clickedDay = 0;
                        }else{
                            if (clickedDay != 0 && !isNotInMonth){
                                $("#"+clickedDay).css("background-color", "white");
                                $("#"+clickedDay).css("color", "#273c75");
                            }else if (clickedDay != 0 && isNotInMonth){
                                $("#"+clickedDay).css("background-color", "white");
                                $("#"+clickedDay).css("color", "#86a3f5");
                            }
                            $(this).css("background-color", "#7f8fa6");
                            $(this).css("color", "white");
                            clickedDay = day_id;
                            isNotInMonth = true;
                            changeCurrentWeekInNextMonth();
                        }
                    });
                }else if (wk[j]['date'] == todaysDate && wk[j]['month'] == currentMonth && wk[j]['year'] == currentYear){
                    dayOfWeek.classList.add("today");
                    dayOfWeek.classList.add("day-of-week");
                    dayOfWeek.addEventListener("click", function(){
                        if (clickedDay != 0 && !isNotInMonth){
                            $("#"+clickedDay).css("background-color", "white");
                            $("#"+clickedDay).css("color", "#273c75");
                        }else if (clickedDay != 0 && isNotInMonth){
                            $("#"+clickedDay).css("background-color", "white");
                            $("#"+clickedDay).css("color", "#86a3f5");
                        }
                        let day_id = $(this).attr("id");
                        clickedDay = day_id;
                        changeCurrentWeek();
                        clickedDay = 0;
                        isNotInMonth = false;
                    })
                }else{
                    dayOfWeek.classList.add("day-of-week");
                    dayOfWeek.addEventListener("click", function() {
                        let day_id = $(this).attr("id");
                        if (clickedDay == day_id) {
                            $(this).css("background-color", "white");
                            $(this).css("color", "#273c75");
                            clickedDay = 0;
                        }else{
                            if (clickedDay != 0 && !isNotInMonth){
                                $("#"+clickedDay).css("background-color", "white");
                                $("#"+clickedDay).css("color", "#273c75");
                            }else if (clickedDay != 0 && isNotInMonth){
                                $("#"+clickedDay).css("background-color", "white");
                                $("#"+clickedDay).css("color", "#86a3f5");
                            }
                            $(this).css("background-color", "#7f8fa6");
                            $(this).css("color", "white");
                            clickedDay = day_id;
                            isNotInMonth = false;
                            changeCurrentWeek();
                        }
                        
                    });
                }

                
            }else{
                dayOfWeek.innerHTML = wk[j];
                dayOfWeek.classList.add("day-of-week");
            }
            

            week.append(dayOfWeek);
        }
        monthDaysHolder.append(week);
    }

    calendarBar.append(calendarTitleHolder, monthDaysHolder);
    return calendarBar;
}

function newCourseComponent() {
    submitStatus = 600;
    $("#component-holder").empty();
    let form = document.createElement("form");
    form.setAttribute("id", "course-form")
    let container_fluid = document.createElement("div");
    container_fluid.classList.add("container-fluid");

    // course group
    let course_group = document.createElement("div");
    course_group.classList.add("form-group");
    course_group.classList.add("row");

    let course_label = document.createElement("label");
    course_label.classList.add("col-1");
    course_label.classList.add("col-form-label");
    course_label.setAttribute("for", "coursename");
    course_label.innerHTML = "Course";

    let course_col = document.createElement("col");
    course_col.classList.add("col");
    let course_name = document.createElement("input");
    course_name.classList.add("input-min-width");
    course_name.classList.add("form-control");
    course_name.setAttribute("type", "text");
    course_name.setAttribute("id", "coursename");
    course_name.required = true;
    course_name.setAttribute("placeholder","Course Name");
    course_col.append(course_name);

    course_group.append(course_label, course_col);

    // hours group
    let hrs_group = document.createElement("div");
    hrs_group.classList.add("form-group");
    hrs_group.classList.add("row");
    hrs_group.classList.add("hrs-group")

    let maxhrs_label = document.createElement("label");
    maxhrs_label.classList.add("col-1");
    maxhrs_label.classList.add("col-form-label");
    maxhrs_label.setAttribute("for", "maxhrs");
    maxhrs_label.innerHTML = "Max Hrs Per Day";

    let maxhrs_col = document.createElement("col");
    maxhrs_col.classList.add("col");
    let maxhrs = document.createElement("input");
    maxhrs.classList.add("form-control");
    maxhrs.classList.add("input-min-width");
    maxhrs.setAttribute("type", "number");
    maxhrs.setAttribute("id", "maxhrs");
    maxhrs.setAttribute("step", 0.1);
    maxhrs.setAttribute("value", "0.0");
    maxhrs_col.append(maxhrs);

    let totalhrs_label = document.createElement("label");
    totalhrs_label.classList.add("col-1");
    totalhrs_label.classList.add("col-form-label");
    totalhrs_label.setAttribute("for", "totalhrs");
    totalhrs_label.innerHTML = "Total hrs";

    let totalhrs_col = document.createElement("col");
    totalhrs_col.classList.add("col");
    let totalhrs = document.createElement("input");
    totalhrs.classList.add("input-min-width");
    totalhrs.classList.add("form-control");
    totalhrs.setAttribute("type", "number");
    totalhrs.setAttribute("id", "totalhrs");
    totalhrs.setAttribute("step", 0.1);
    totalhrs.setAttribute("value", "0.0");
    totalhrs_col.append(totalhrs);

    let minhrs_label = document.createElement("label");
    minhrs_label.classList.add("col-2");
    minhrs_label.classList.add("col-form-label");
    minhrs_label.setAttribute("for", "minhrs");
    minhrs_label.innerHTML = "Min time for single study session (hrs)";

    let minhrs_col = document.createElement("col");
    minhrs_col.classList.add("col");
    let minhrs = document.createElement("input");
    minhrs.classList.add("form-control");
    minhrs.classList.add("input-min-width");
    minhrs.setAttribute("type", "number");
    minhrs.setAttribute("id", "minhrs");
    minhrs.setAttribute("step", 0.1);
    minhrs.setAttribute("value", "0.0");
    minhrs_col.append(minhrs);

    hrs_group.append(maxhrs_label, maxhrs_col, totalhrs_label, totalhrs_col, minhrs_label, minhrs_col);

    // Date group
    let date_group = document.createElement("div");
    date_group.classList.add("form-group");
    date_group.classList.add("row");

    let startdate_label = document.createElement("label");
    startdate_label.classList.add("col-1");
    startdate_label.classList.add("col-form-label");
    startdate_label.setAttribute("for", "startdate");
    startdate_label.innerHTML = "Start Date";

    let startdate_col = document.createElement("col");
    startdate_col.classList.add("col");
    let startdate = document.createElement("input");
    startdate.classList.add("input-min-width");
    startdate.classList.add("form-control");
    startdate.setAttribute("type", "date");
    startdate.setAttribute("id", "startdate");
    startdate.required = true
    startdate_col.append(startdate);

    let enddate_label = document.createElement("label");
    enddate_label.classList.add("col-1");
    enddate_label.classList.add("col-form-label");
    enddate_label.setAttribute("for", "enddate");
    enddate_label.innerHTML = "End Date";

    let enddate_col = document.createElement("col");
    enddate_col.classList.add("col");
    let enddate = document.createElement("input");
    enddate.classList.add("input-min-width");
    enddate.classList.add("form-control");
    enddate.setAttribute("type", "date");
    enddate.setAttribute("id", "enddate");
    enddate.required = true;
    enddate_col.append(enddate);

    date_group.append(startdate_label, startdate_col, enddate_label, enddate_col);

    // Time group
    let time_group = document.createElement("div");
    time_group.classList.add("form-group");
    time_group.classList.add("row");
    time_group.classList.add("group");

    let time_title = document.createElement("p");
    time_title.innerHTML = "Select preferred hrs to study";

    let studyhrs = document.createElement("div");
    studyhrs.classList.add("study-hrs");
    for (let i=0; i<24; i++){
        let studyhr = document.createElement("div");
        studyhr.classList.add("study-hr");
        studyhr.classList.add("btn");
        studyhr.setAttribute("id", i)
        studyhr.innerHTML = (i + "").length > 1 ? i + "00hrs" : "0" + i + "00hrs";
        studyhrs.append(studyhr);
    }
    time_group.append(time_title, studyhrs);

    // Check Group 
    let check_group = document.createElement("div");
    check_group.classList.add("form-group");
    check_group.classList.add("row");
    check_group.classList.add("group");

    let satFormCheck = document.createElement("div");
    satFormCheck.classList.add("form-check");

    let satCheckBox = document.createElement("input");
    satCheckBox.setAttribute("type", "checkbox");
    satCheckBox.classList.add("form-check-input");
    // satCheckBox.setAttribute("value", "");
    satCheckBox.setAttribute("id", "sat");

    let label = document.createElement("label")
    label.classList.add("form-check-label");
    label.setAttribute("for", "sat");
    label.innerHTML = "Include Saturday";

    satFormCheck.append(satCheckBox, label);

    let sunFormCheck = document.createElement("div");
    sunFormCheck.classList.add("form-check");

    let sunCheckBox = document.createElement("input");
    sunCheckBox.setAttribute("type", "checkbox");
    sunCheckBox.classList.add("form-check-input");
    // sunCheckBox.setAttribute("value", "");
    sunCheckBox.setAttribute("id", "sun");

    let sunlabel = document.createElement("label")
    sunlabel.classList.add("form-check-label");
    sunlabel.setAttribute("for", "sun");
    sunlabel.innerHTML = "Include Sunday";

    sunFormCheck.append(sunCheckBox, sunlabel);

    check_group.append(satFormCheck, sunFormCheck);

    // submit group
    let submit_group = document.createElement("div")
    submit_group.classList.add("group")
    let btn = document.createElement("button");
    btn.setAttribute("id", "addcourse");
    btn.setAttribute("type", "submit");
    btn.classList.add("btn");
    btn.classList.add("btn-outline-dark");
    btn.innerHTML = "Submit";

    submit_group.append(btn);

    container_fluid.append(course_group, hrs_group, date_group, time_group, check_group, submit_group);
    form.append(container_fluid);
    $("#component-holder").append(form);

    addEvents();
}



function addEvents() {
    $("#addcourse").on("click", function(e){
        e.preventDefault();
        let startDate = new Date($("#startdate").val());
        let endDate = new Date($("#enddate").val());
        let courseName = $("#coursename").val();
        let maxHrs = parseFloat($("#maxhrs").val());
        let totalHrs = parseFloat($("#totalhrs").val());
        let unitTime = parseFloat($("#minhrs").val());
        
        let today = new Date();

        if (courseName == "") {
            launchDialog("Invalid Course name!", "Please fill Course name field.", [{name: "GOT IT",func: enableCourseComponents}], {func: enableCourseComponents}, [], true);
        }else if (maxHrs <= 0) {
            launchDialog("Invalid maximum hours!", "Maximum hours should be greater than zero. Please check Max Hrs field.", [{name: "GOT IT",func: enableCourseComponents}], {func: enableCourseComponents}, [], true);
        }else if (totalHrs < maxHrs) {
            launchDialog("Invalid total hrs!", "Total hours should be greater than or equal to maximum hrs per day. Please check Total Hrs field.", [{name: "GOT IT",func: enableCourseComponents}], {func: enableCourseComponents}, [], true);
        }else if(startDate == "Invalid Date" || startDate.getTime() < today) {
            launchDialog("Invalid Date!", "Start date field is empty or less than tomorrow's date", [{name: "GOT IT",func: enableCourseComponents}], {func: enableCourseComponents}, [], true);
        }else if (endDate == "Invalid Date" || endDate.getTime() <= startDate.getTime()){
            launchDialog("Invalid Date!", "End date is empty or equal to start date.", [{name: "GOT IT",func: enableCourseComponents}], {func: enableCourseComponents}, [], true);
        }else if (clickedHrs.length === 0){
            launchDialog("You havent selected anything!", "Please select preferred hour(s) to study.", [{name: "GOT IT",func: enableCourseComponents}], {func: enableCourseComponents}, [], true);
        }else{
            let data = {
                "course_name": courseName,
                "max_hrs": maxHrs,
                "total_hrs": totalHrs,
                "unit_time": unitTime,
                "start_date": $("#startdate").val(),
                "end_date": $("#enddate").val(),
                "preferred_hrs": clickedHrs,
                "status": submitStatus,
                "include_saturday": $("#sat").prop("checked") ? 1 : 0,
                "include_sunday": $("#sun").prop("checked") ? 1 : 0
            }

            window.api.send("toMain", data);
            window.api.receive("fromMain", (res) => {
                const result = JSON.parse(res[0]);
                console.log(" result sent ",result);
                switch (result.status){
                    case 400:
                        statusCode = 400
                        launchDialog(result.title, result.message, [{name: "GOT IT", func: enableCourseComponents}, {name: "CANCEL", func: hoursInvalidCancel}], {func: enableCourseComponents}, result.options, false);
                        break;
                    case 401:
                        statusCode = 401;
                        values = result.prev_values;
                        checkBox401 = result.options[0];
                        console.log("Check Box Value", checkBox401);
                        result.options.splice(0, 1);
                        launchDialog(result.title, result.message, [{name: "SUBMIT", func: hoursInvalidCancel}, {name: "CANCEL", func: hoursInvalidCancel}], {func: hoursInvalidCancel}, result.options, false);
                        break;
                    case 402:
                        statusCode = 402
                        launchDialog(result.title, result.message, [{name: "OKAY", func: getCourses}], {func: getCourses}, [], true);
                        break;
                }               
            }); 
        }
        
    });

    $(".hrs-group input").on("blur", function (){
        if (!(parseFloat(this.value) > 0)){
            this.value = "0.0";
        }
    })

    $(".study-hr").on("click", function(){
        console.log("clicked")
        let hr_id = $(this).attr("id");
        if (clickedHrs.includes(parseInt(hr_id))) {
            $(this).css("background-color", "#f5f6fa");
            $(this).css("color", "#273c75");
            clickedHrs.splice(clickedHrs.indexOf(parseInt(hr_id)), 1);
        }else{
            clickedHrs.push(parseInt(hr_id));
            $(this).css("background-color", "#4c5e8f");
            $(this).css("color", "white");
        }
    });
}

function enableCourseComponents(e){
    isDialogOpen = false;
    if (e.target !== this)
        return;
    cancelDialog();
    if (statusCode == 400){
        deleteRecord();
        statusCode = 0;
    }
}

function cancelDialog(){
    $(".dialog-holder").remove();
    $(".side-bar").removeClass("launch-dialog");
    $(".middle-container").removeClass("launch-dialog");
}

function launchScheduleDialog(){
    isDialogOpen = true;
    let id = this.getAttribute("idx");

    let mTop = $(this).offset()['top'] - 10;
    let mLeft = $(this).offset()['left'] - 420;
    
    let dialogHolder = document.createElement("div");
    dialogHolder.classList.add("dialog-holder");
    dialogHolder.classList.add("full-width");
    dialogHolder.classList.add("full-height");

    let dialog = document.createElement("div");
    dialog.classList.add("schedule-dialog");
    dialog.setAttribute("id", "dia-body");

    let dialogTop = createScheduleDialogTop(id, this);
    let dialogCenter = createScheduleDialogCenter(id, this);
    dialog.append(dialogTop, dialogCenter);
    
    dialogHolder.append(dialog);
    $(".main-container").append(dialogHolder);
    if (mTop > 700){
        if (id){
            $(".schedule-dialog").css("margin-top", mTop - 125);
        }else{
            $(".schedule-dialog").css("margin-top", mTop - 255);
        }
    }
    else
        $(".schedule-dialog").css("margin-top", mTop);

    if (mLeft > 0)
        $(".schedule-dialog").css("margin-left", mLeft);
    else
        $(".schedule-dialog").css("margin-left", $(this).offset()['left'] + 113);


    $(".dialog-holder").on("click", enableCourseComponents);
}

function createScheduleDialogCenter(id, ele){
    let dialogCenter;
    if (id){
        dialogCenter = document.createElement("div");
        let name = document.createElement("div");

        let timeData = getDataWithId(id);
        name.innerHTML = timeData['task_name'];
        name.classList.add("dialog-title");

        let date = document.createElement("div");
        date.innerHTML = timeData['start_date'] + " . " + $(ele).children().children()[1].innerHTML;
        date.classList.add("current-date");

        dialogCenter.append(name, date);
    }else{
        let colDate = $(ele).attr("date");
        let hr = $(ele).attr("hr");
        dialogCenter = createDialogCenter(colDate, hr, id);
    }
    return dialogCenter;
}

function createScheduleDialogTop(id, ele){
    let dialogTop = document.createElement("div");
    dialogTop.classList.add("flexed-div");

    let topButtonsDiv = document.createElement("div");
    topButtonsDiv.classList.add("flexed-div");
    topButtonsDiv.classList.add("top-buttons-div");

    let closeDiv = document.createElement("div");
    let closeInfoBar = document.createElement("div");
    closeInfoBar.classList.add("close-info-bar");

    let closeCtrlDiv = createSvgDiv("close", "task-close", function(){ cancelDialog() }, function(){
        addInfoBar(this, "Close", "close-info-bar");
        $("#task-close").addClass("icon-warn-hover");
    }, function(){
        $("#task-close").removeClass("icon-warn-hover");
    }, [])

    closeDiv.append(closeCtrlDiv, closeInfoBar);

    let doneDiv = document.createElement("div");
    let doneInfoBar = document.createElement("div");
    doneInfoBar.classList.add("done-info-bar");

    if (id){
        let doneCtrlDiv = createSvgDiv("task_done", "task-done", function(){
            $("#task-done").addClass("icon-done-clicked");
            updateTaskDone();
        }, function(){
            addInfoBar(this, "Mark Done", "done-info-bar");
            $("#task-done").addClass("icon-edit-hover");
        }, function(){
            $("#task-done").removeClass("icon-edit-hover");
        }, [])
        doneDiv.append(doneCtrlDiv, doneInfoBar);


        let editDiv = document.createElement("div");
        let editInfoBar = document.createElement("div");
        editInfoBar.classList.add("edit-info-bar");
    
        let editCtrlDiv = createSvgDiv("edit", "task-edit", function(){
            $("#dia-body").empty();
            let diaTp = createScheduleDialogTop(id, ele);
            let colDate = $(ele).attr("date");
            let hr = $(ele).attr("hr");
            let diaCen = createDialogCenter(colDate, hr, id);
            $("#dia-body").append(diaTp, diaCen);

        }, function(){
            addInfoBar(this, "Edit Task", "edit-info-bar");
            $("#task-edit").addClass("icon-edit-hover");
        }, function(){
            $("#task-edit").removeClass("icon-edit-hover");
        }, []);
    
        editDiv.append(editCtrlDiv, editInfoBar);
    
        let delDiv = document.createElement("div");
        let delInfoBar = document.createElement("div");
        delInfoBar.classList.add("del-info-bar");
    
        let delCtrlDiv = createSvgDiv("delete", "task-del", function(){
            
            let colDate = $(ele).attr("date");
            let delData = {
                "id": id,
                "status": 2000
            }
            window.api.send("deleteTask", delData);
            cancelDialog();
            reloadDashboardComponent(colDate);
        }, function(){
            addInfoBar(this, "Delete Task", "del-info-bar");
            $("#task-del").addClass("icon-warn-hover");
        }, function(){
            $("#task-del").removeClass("icon-warn-hover");
        }, [])
    
        delDiv.append(delCtrlDiv, delInfoBar);
        topButtonsDiv.append(closeDiv, delDiv, editDiv, doneDiv);

    }
    else 
        topButtonsDiv.append(closeDiv);
    dialogTop.append(topButtonsDiv);

    return dialogTop;
}

function createDialogCenter(colDate, hr, id){
    let prevTaskName = "";
    let prevStartTime = hr <= 12 ? (hr < 10 ? "0" + hr: hr) + ":00" + (hr == 12 ? " PM" : " AM") : ((hr-12) < 10 ? "0" + (hr - 12): (hr - 12)) + ":00 PM";

    let dialogFormView = document.createElement("div");

    let taskNameG = document.createElement("div");
    taskNameG.classList.add("flexed-div");

    let taskname_label = document.createElement("div");
    taskname_label.classList.add("time-group-label");
    taskname_label.innerHTML = "Task Name:";

    let taskname = document.createElement("input");
    taskname.classList.add("form-control");
    taskname.setAttribute("id", "taskname");
    if (id){
        let timeData = getDataWithId(id);
        prevTaskName = timeData['task_name'];
        taskname.setAttribute("value", prevTaskName);
    }

    taskNameG.append(taskname_label, taskname);

    let dateG = document.createElement("div");
    dateG.classList.add("flexed-div");
    dateG.classList.add("dateG");

    let date_label = document.createElement("div");
    date_label.innerHTML = "Date:";

    let date = document.createElement("div");
    date.classList.add("current-date");
    date.innerHTML = colDate;

    dateG.append(date_label, date);

    let time_group = document.createElement("div");
    time_group.classList.add("flexed-div");

    let startTimeGroup = document.createElement("div");
    startTimeGroup.classList.add("time-group");

    let startime_label = document.createElement("div");
    startime_label.classList.add("time-group-label");
    startime_label.innerHTML = "From:";

    let startime = document.createElement("div");
    startime.classList.add("btn");
    startime.classList.add("time-btn");
    
    startime.innerHTML = prevStartTime;
    startime.setAttribute("id", "startime");
    startime.addEventListener("click", function(){
        let clockHr = hr > 12 ? "0" + (hr - 12): hr < 10 ? "0" + hr : "" + hr;
        let amPm = hr >= 12 ? "PM" : "AM";
        launchClock(clockHr, amPm, "start-time-div", "#startime");
    });

    let startTimeDiv = document.createElement("div");
    startTimeDiv.classList.add("start-time-div");

    startTimeGroup.append(startime_label, startime, startTimeDiv);

    let endTimeGroup = document.createElement("div");
    endTimeGroup.classList.add("time-group");

    let endtime_label = document.createElement("div");
    endtime_label.classList.add("time-group-label");
    endtime_label.innerHTML = "To:";

    let endtime = document.createElement("div");
    endtime.classList.add("btn");
    endtime.classList.add("time-btn");

    let endTimeHr = parseInt(hr) + 1;
    let prevEndTime = endTimeHr <= 12 ? (endTimeHr < 10 ? "0" + endTimeHr: endTimeHr) + ":00" + (endTimeHr == 12 ? " PM" : " AM") : ((endTimeHr-12) < 10 ? "0" + (endTimeHr - 12): (endTimeHr - 12)) + ":00 PM";
    endtime.innerHTML = prevEndTime;
    endtime.setAttribute("id", "endtime");

    let endTimeDiv = document.createElement("div");
    endTimeDiv.classList.add("end-time-div");

    endtime.addEventListener("click", function(){
        let tmhr = parseInt(hr) + 1;
        let clockHr = tmhr > 12 ? "0" + (tmhr - 12): tmhr < 10 ? "0" + tmhr : "" + tmhr;
        let amPm = tmhr >= 12 ? "PM" : "AM"
        launchClock(clockHr, amPm, "end-time-div", "#endtime");
    });

    endTimeGroup.append(endtime_label, endtime, endTimeDiv);

    time_group.append(startTimeGroup, endTimeGroup);

    let btnHolder = document.createElement("div");
    btnHolder.classList.add("flexed-div");
    btnHolder.classList.add("top-buttons-div")

    let btn = document.createElement("div");
    btn.innerHTML = "SAVE";
    btn.classList.add("btn");
    btn.classList.add("schedule-dialog-btn");
    btn.addEventListener("click", function(){
        if ($("#startime").text() != prevStartTime || $("#endtime").text() != prevEndTime || $("#taskname").val() != prevTaskName){
            
            if ($("#taskname").val() != prevTaskName){
                if (id){
                    let taskData = getDataWithId(id);
                    let updates = []
                    if ($("#taskname").val() != prevTaskName){
                        updates.push({
                            "TASK_NAME": $("#taskname").val()
                        });
                    }
    
                    if ($("#startime").text() != prevStartTime){
                        updates.push({
                            "START_TIME": $("#startime").text(),
                            "DATE": new Date(colDate).toLocaleDateString("en-US")
                        });
                    }
    
                    if ($("#endtime").text() != prevEndTime){
                        updates.push({
                            "END_TIME": $("#endtime").text(),
                            "DATE": new Date(colDate).toLocaleDateString("en-US")
                        });
                    }
    
                    let data = {
                        "status": 1001,
                        "table_name": 'timetable_tasks',
                        "updates": updates,
                        "id": taskData['id']
                    }
                    console.log("Updates", data);
                    window.api.send("updateData", data);
                    window.api.receive("updateResults", (res) => {
                        console.log("value", res);
                        cancelDialog();   
                    }); 
                }else{
                    let data = {
                        "start_time": $("#startime").text(),
                        "end_time": $("#endtime").text(),
                        "date": new Date(colDate).toLocaleDateString("en-US"),
                        "task_name": $("#taskname").val()
                    }
    
                    window.api.send("insertRecord", data);
                    window.api.receive("insertResponse", (res) => {
                        console.log("value", res);
                        cancelDialog();
                    });
                }
                reloadDashboardComponent(colDate);
            }
            
            
        }
    });

    btnHolder.append(btn);
    dialogFormView.append(taskNameG, dateG, time_group, btnHolder);
    return dialogFormView;
}

function reloadDashboardComponent(colDate){
    timetableData = [];
    currentWeekData = [];
    dashboardComponent().then(function(){
        let editDate = new Date(colDate);
        clickedDay = "" + editDate.getDate() + editDate.getMonth() + editDate.getFullYear();

        let cwDates = []
        currentWeek.forEach((cw) => {
            cwDates.push(parseInt(cw['date']));
        });
        if (editDate.getDate() == todaysDate && editDate.getMonth() == currentMonth && editDate.getFullYear() == currentYear){
            
        }else if (cwDates.includes(editDate.getDate()) && editDate.getMonth() == currentMonth && editDate.getFullYear() == currentYear){
            
        }else if (editDate.getMonth() == currentMonth){
            $("#" + clickedDay).css("background-color", "#7f8fa6");
            $("#" + clickedDay).css("color", "white");
        }
        if (editDate.getMonth() == currentMonth){
            changeCurrentWeek();
        }else{
            changeCurrentWeekInNextMonth();
        }
        
    }).catch((err) => {
        console.log("an error occured", err);
    });
}

function launchClock(clockHr, am_pm, classname, divId){
    $("." + clockOpenClassName).empty();
    $("." + classname).empty();
    let clockBar = document.createElement("div");
    clockBar.classList.add("clock-bar");

    // TOP GROUP
    let topGroup = document.createElement("div");
    topGroup.classList.add("clock-group");

    let leftUpCtrlDiv = createSvgDiv("up", "task-leftUp", function(){ increaseTime("#startHr", "Hr") }, function(){
        $("#task-leftUp").addClass("icon-edit-hover");
    }, function(){
        $("#task-leftUp").removeClass("icon-edit-hover");
    }, [{e: "mousedown", func: function(){
        increaseTimer = window.setTimeout(function(){
            increaseTimeInterval = window.setInterval(function(){
                increaseTime("#startHr", "Hr");
            }, 100);
        }, 500);
    }}, {e: "mouseup", func: function(){
        clearInterval(increaseTimeInterval);
        clearTimeout(increaseTimer);
    }}]);

    let rightUpCtrlDiv = createSvgDiv("up", "task-rightUp", function(){ increaseTime("#endHr", "Min") }, function(){
        $("#task-rightUp").addClass("icon-edit-hover");
    }, function(){
        $("#task-rightUp").removeClass("icon-edit-hover");
    }, [{e: "mousedown", func: function(){
        increaseTimer = window.setTimeout(function(){
            increaseTimeInterval = window.setInterval(function(){
                increaseTime("#endHr", "Min");
            }, 100);
        }, 500);
    }}, {e: "mouseup", func: function(){
        clearInterval(increaseTimeInterval);
        clearTimeout(increaseTimer);
    }}]);

    let thirdCtrlDiv = document.createElement("div");
    thirdCtrlDiv.classList.add("clock-div");

    topGroup.append(leftUpCtrlDiv, rightUpCtrlDiv, thirdCtrlDiv);


    // CENTER GROUP
    let centerGroup = document.createElement("div");
    centerGroup.classList.add("clock-group");
    centerGroup.classList.add("clock-center-group");


    let startHrHolder = document.createElement("div");

    let startHr = document.createElement("input");
    startHr.classList.add("form-control");
    startHr.setAttribute("id", "startHr");
    startHr.setAttribute("value", clockHr);
    startHr.classList.add("clock-time-bar-left");
    startHr.addEventListener("blur", function(){
        if (isNaN($(this).val()))
            $(this).val(clockHr);
        else if (parseInt($(this).val()) > 12 || parseInt($(this).val()) < 0)
            $(this).val(clockHr);
    });

    startHrHolder.append(startHr);

    let colonHolder = document.createElement("div");

    let colon = document.createElement("div");
    colon.classList.add("colon");
    colon.innerHTML = ":";

    colonHolder.append(colon);

    let endHrHolder = document.createElement("div");

    let endHr = document.createElement("input");
    endHr.classList.add("form-control");
    endHr.setAttribute("id", "endHr");
    endHr.setAttribute("value", "00");
    endHr.classList.add("clock-time-bar-right");

    endHrHolder.append(endHr);

    let amPm = document.createElement("div");
    amPm.classList.add("clock-amPm");
    amPm.classList.add("btn");
    amPm.innerHTML = am_pm;
    amPm.addEventListener("click", function(){
        if ($(this).text() == "AM")
            $(this).text("PM");
        else
            $(this).text("AM");
    });

    centerGroup.append(startHrHolder, colonHolder, endHrHolder, amPm);


// BOTTOM GROUP
    let bottomGroup = document.createElement("div");
    bottomGroup.classList.add("clock-group");

    let leftDownCtrlDiv = createSvgDiv("down", "task-leftDown", function(){ decreaseTime("#startHr", "Hr") }, function(){
        $("#task-leftDown").addClass("icon-edit-hover");
    }, function(){
        $("#task-leftDown").removeClass("icon-edit-hover");
    }, [{e: "mousedown", func: function(){
        increaseTimer = window.setTimeout(function(){
            increaseTimeInterval = window.setInterval(function(){
                decreaseTime("#startHr", "Hr");
            }, 100);
        }, 500);
    }}, {e: "mouseup", func: function(){
        clearInterval(increaseTimeInterval);
        clearTimeout(increaseTimer);
    }}]);

    let bottomCenter = document.createElement("div");
    bottomCenter.classList.add("clock-div");

    let rightDownCtrlDiv = createSvgDiv("down", "task-rightDown", function(){ decreaseTime("#endHr", "Min") }, function(){
        $("#task-rightDown").addClass("icon-edit-hover");
    }, function(){
        $("#task-rightDown").removeClass("icon-edit-hover");
    }, [{e: "mousedown", func: function(){
        increaseTimer = window.setTimeout(function(){
            increaseTimeInterval = window.setInterval(function(){
                decreaseTime("#endHr", "Min");
            }, 100);
        }, 500);
    }}, {e: "mouseup", func: function(){
        clearInterval(increaseTimeInterval);
        clearTimeout(increaseTimer);
    }}]);

    bottomGroup.append(leftDownCtrlDiv, rightDownCtrlDiv, bottomCenter);

    let btn = document.createElement("div");
    btn.innerHTML = "DONE";
    btn.classList.add("btn");
    btn.classList.add("clock-btn");

    btn.addEventListener("click", function(){
        let time = $("#startHr").val() + ":" + $("#endHr").val() + " " + $(".clock-amPm").text();
        $(divId).text(time);
        $("." + classname).empty();
    });

    clockBar.append(topGroup, centerGroup, bottomGroup, btn);
    $("." + classname).append(clockBar);
    clockOpenClassName = classname;

}

function createSvgDiv(svgFileName, svgId, clickFunc, mouseOver, mouseOut, addFuncs){
    let svgHolder = document.createElement("div");
    svgHolder.classList.add("clock-div");

    let ctrlDiv = document.createElement("div");
    ctrlDiv.classList.add("position-abs");
    ctrlDiv.classList.add("icon-ctrl-divs");

    let svg = document.createElement("object");
    svg.setAttribute("type", "image/svg+xml");
    svg.setAttribute("data", "./images/" + svgFileName + ".svg");
    svg.classList.add("icon");
    svg.setAttribute("id", svgId);

    ctrlDiv.addEventListener("click", clickFunc);
    ctrlDiv.addEventListener("mouseover", mouseOver);
    ctrlDiv.addEventListener("mouseout", mouseOut);
    addFuncs.forEach(ad => {
        ctrlDiv.addEventListener(ad.e, ad.func);
    });

    svgHolder.append(ctrlDiv, svg);

    return svgHolder;
}

function increaseTime(id, type){
    let cv = parseInt($(id).val());
    if (cv >= 1 && cv < (type == "Hr" ? 12 : 59))
        cv = cv + 1;
    else if (cv == 12 && type == "Hr")
        cv = 1
    else if (cv == 0 && type == "Min")
        cv = cv + 1
    else if (cv == 59)
        cv = 0
    
    $(id).val(cv < 10 ? "0" + cv : cv);
}

function decreaseTime(id, type){
    let cv = parseInt($(id).val());
    if (cv > 1 && cv <= (type == "Hr" ? 12 : 59))
        cv = cv - 1;
    else if (cv == 1 && type == "Hr")
        cv = 12;
    else if (cv == 1 && type == "Min")
        cv = cv - 1;
    else if (cv == 0 && type == "Min")
        cv = 59;
    
    $(id).val(cv < 10 ? "0" + cv : cv);
}


function addInfoBar(ele, message, classname){
    let infoBar = document.createElement("div");
    infoBar.classList.add("info-bar");

    let p = document.createElement("div");
    p.innerHTML = message;

    infoBar.append(p);
    $("." + classname).append(infoBar);

    ele.addEventListener("mouseout", function(){
        $(".info-bar").remove();
    });
}

function launchDialog(title, message, btns, exitFunc, listItems, canceleable){
    isDialogOpen = true;
    $(".side-bar").addClass("launch-dialog");
    $(".middle-container").addClass("launch-dialog");

    
    let dialogHolder = document.createElement("div");
    dialogHolder.classList.add("dialog-holder");
    dialogHolder.classList.add("full-width");
    dialogHolder.classList.add("full-height");

    let dialog = document.createElement("div");
    dialog.classList.add("dialog");
    let dialogTop = document.createElement("div");
    dialogTop.classList.add("dialog-top");
    let dHead = document.createElement("p");
    dHead.classList.add("dialog-heading");
    dHead.innerHTML = title;
    let dMess = document.createElement("p");
    dMess.classList.add("dialog-message");
    dMess.innerHTML = message;
    dialogTop.append(dHead, dMess);
    dialog.append(dialogTop);

    if (listItems.length > 0){
        let dialogCenter = document.createElement("div");

        if (statusCode == 401){
            let formCheck = document.createElement("div");
            formCheck.classList.add("form-check");

            let checkBox = document.createElement("input");
            checkBox.setAttribute("type", "checkbox");
            checkBox.classList.add("form-check-input");
            checkBox.setAttribute("id", 401);

            let label = document.createElement("label")
            label.classList.add("form-check-label");
            label.setAttribute("for", 401);
            label.innerHTML = checkBox401;

            formCheck.append(checkBox, label);
            dialogCenter.append(formCheck);
        }
        
        let listDiv = document.createElement("ul");
        listDiv.classList.add("dialog-center");

        for (let i=0; i<listItems.length; i++){
            let li = document.createElement("li");
            li.innerHTML = listItems[i];
            listDiv.append(li);
        }

        dialogCenter.append(listDiv);
        dialog.append(dialogCenter);
        
    }

    let dialogBottom = document.createElement("div");
    dialogBottom.classList.add("dialog-bottom");
    let btnHolder = document.createElement("div");
    btnHolder.classList.add("buttons-holder");

    btns.forEach((b) => {
        let btn = document.createElement("button");
        btn.classList.add("btn");
        btn.classList.add("btn-btn-link");
        btn.innerHTML = b.name;
        if (statusCode == 401 && b.name == "SUBMIT"){
            console.log("submit section")

            btn.addEventListener("click", function(){
                if ($("#401").prop("checked")){
                    console.log("here 2 biach")
                    submit401();
                }else{
                    console.log("here 3 biach")
                    b.func();
                }
            });
        }else{
            btn.addEventListener("click", b.func);
        }
        btnHolder.append(btn);
    });

    dialogBottom.append(btnHolder);
    dialog.append(dialogBottom);

    
    dialogHolder.append(dialog);

    $(".main-container").append(dialogHolder);
    // $("body").css("overflow-x", "hidden");

    let mLeft = ($(".main-container").width()/2) - 200;
    let mTop = ($(".main-container").height()/2) - 100;
    $(".dialog").css("margin-top", mTop);
    $(".dialog").css("margin-left", mLeft);

    if (canceleable)
        $(".dialog-holder").on("click", exitFunc.func);

}

function hoursInvalidCancel(){
    deleteRecord();
    cancelDialog();
}

function deleteRecord(){
    let courseName = $("#coursename").val();
    let data = {
        "course_name": courseName,
        "status": 1000
    }
    window.api.send("toMain", data);
}

function submit401(){

    console.log("Im here biach");
    let startDate = new Date($("#startdate").val());
    let endDate = new Date($("#enddate").val());
    let courseName = $("#coursename").val();
    let maxHrs = parseFloat($("#maxhrs").val());
    let totalHrs = parseFloat($("#totalhrs").val());
    let unitTime = parseFloat($("#minhrs").val());

    let data = {
        "course_name": courseName,
        "max_hrs": maxHrs,
        "total_hrs": totalHrs,
        "unit_time": unitTime,
        "start_date": $("#startdate").val(),
        "end_date": $("#enddate").val(),
        "preferred_hrs": clickedHrs,
        "status": 602,
        "include_saturday": $("#sat").prop("checked") ? 1 : 0,
        "include_sunday": $("#sun").prop("checked") ? 1 : 0,
        "prev_values": values
    }
}


function getDaysOfMonth(today){
    currentSelectedMonth = today.getMonth();
    currentSelectedYear = today.getFullYear();
    let daysOfTheMonth = [daysOfWeek, [], [], [], [], [], []];
    let week1 = [];
    let firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    let day1 = firstDay.getDay();

    let prevMonth = 0;
    let prevMonthYear = 0;
    if (today.getMonth() - 1 >= 0){
        prevMonth = today.getMonth() - 1;
        prevMonthYear = today.getFullYear(); 
    }else{
        prevMonth = 11;
        prevMonthYear = today.getFullYear() - 1; 
    }

    for (let i=day1 - 1; i >= 0; i--){
        week1.push({
            date: new Date(prevMonthYear, prevMonth + 1, 0).getDate() - i,
            this_month: false,
            month: prevMonth,
            year: prevMonthYear
        });
    }
    
    daysOfTheMonth[1] = week1;
    let lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    let index = 1;

    if (today.getMonth() == currentMonth && today.getFullYear() == currentYear){
        let week1Size = week1.length + today.getDate();
        let diff = 1;
        let sub = 7;
        let ctrl = 0;
        while (diff > 0){
            diff = week1Size - sub;
            sub += 7;
            ctrl ++;
        }
        currentWeek = daysOfTheMonth[ctrl]
    }else{
        currentWeek = daysOfTheMonth[3]
    }

    for (let i=1; i <= lastDay; i++) {
        let wk = daysOfTheMonth[index];
        wk.push({
            date: i,
            this_month: true,
            month: today.getMonth(),
            year: today.getFullYear() 
        });
        if (wk.length >= 7){
            index++;
        }
    }

    let lastDate = 1;
    let week5Size = 7 - daysOfTheMonth[5].length;
    let nextMonth = 0;
    let nextMonthYear = 0;
    if (today.getMonth() + 1 < 12){
        nextMonth = today.getMonth() + 1;
        nextMonthYear = today.getFullYear(); 
    }else{
        nextMonth = 0;
        nextMonthYear = today.getFullYear() + 1; 
    }
    if (week5Size > 0){
        let wk = daysOfTheMonth[5];
        while (week5Size > 0){
            wk.push({
                date: lastDate,
                this_month: false,
                month: nextMonth,
                year: nextMonthYear
            });
            lastDate++;
            week5Size--;
        }
    }

    let week6Size = 7 - daysOfTheMonth[6].length;
    if (week6Size > 0){
        let wk = daysOfTheMonth[6];
        while (week6Size > 0){
            wk.push({
                date: lastDate,
                this_month: false,
                month: nextMonth,
                year: nextMonthYear
            });
            lastDate++;
            week6Size--;
        }
    }

    return daysOfTheMonth;
}

function emptyCalendarBar(){
    $("#calendarBar").remove();
}

function prevMonth(){
    emptyCalendarBar();

    let prevMonth = 0;
    let prevMonthYear = 0;
    if (currentSelectedMonth - 1 >= 0){
        prevMonth = currentSelectedMonth - 1;
        prevMonthYear = currentSelectedYear; 
    }else{
        prevMonth = 11;
        prevMonthYear = currentSelectedYear - 1; 
    }

    let newDate = new Date(prevMonthYear, prevMonth, 1);
    
    titleDate = newDate.toLocaleString('default', { month: 'long' }) + " " + newDate.getFullYear();
    daysOfTheMonth = getDaysOfMonth(newDate);
    let calendarBar = createCalendarBar();
    $("#second-bar").append(calendarBar);
}

function nextMonth(){
    emptyCalendarBar();
    let nextMonth = 0;
    let nextMonthYear = 0;
    if (currentSelectedMonth + 1 < 12){
        nextMonth = currentSelectedMonth + 1;
        nextMonthYear = currentSelectedYear;
    }else{
        nextMonth = 0;
        nextMonthYear = currentSelectedYear + 1; 
    }

    let newDate = new Date(nextMonthYear, nextMonth, 1);
    
    titleDate = newDate.toLocaleString('default', { month: 'long' }) + " " + newDate.getFullYear();
    daysOfTheMonth = getDaysOfMonth(newDate);
    let calendarBar = createCalendarBar();
    $("#second-bar").append(calendarBar);
}

function changeCurrentWeek(){
    $("#day-bar-holder").empty();

    let selectedDate = $("#"+clickedDay).text();
    let week = [];
    for (let i=1; i<daysOfTheMonth.length; i++){
        let cw = daysOfTheMonth[i];
        let isCurrent = false;
        cw.forEach((d) => {
            if (d['date'] == selectedDate && d['this_month']){
                isCurrent = true;
            }
                
        });
        if (isCurrent)
            week = cw;
    }

    currentWeek = week;
    let dayBarRes = createDayBar();
    $("#day-bar-holder").append(dayBarRes[0], dayBarRes[1]);
    getCurrentWeekData();
    $("#tasks-holder").empty();
    let taskTableBar = createTaskTableBar();
    $("#tasks-holder").append(taskTableBar);
    

}

function changeCurrentWeekInNextMonth(){
    let selectedDate = $("#"+clickedDay).text();
    let wkIndex = 0;
    for (let i=1; i<daysOfTheMonth.length; i++){
        let cw = daysOfTheMonth[i];
        for (let j=0; j<cw.length; j++){
            d = cw[j];
            if (d['date'] == selectedDate && !d['this_month']){
                wkIndex = i;
                break;
            }   
        };
    }

    isNotInMonth = false;
    if (wkIndex == 1)
        prevMonth();
    else if (wkIndex == 6 || wkIndex == 5)
        nextMonth();

    $("#"+clickedDay).css("background-color", "#7f8fa6");
    $("#"+clickedDay).css("color", "white");
    changeCurrentWeek();

}

function getCurrentWeekData(){
    cwDates = []
    let currentMonths = []
    currentWeek.forEach((wk) => {
        cwDates.push(wk['date']);
        if (!currentMonths.includes(parseInt(wk['month'])))
            currentMonths.push(wk['month'])
    });

    currentWeekData = []
    timetableData.forEach((ttd) => {
        if (currentMonths.includes(parseInt(ttd['start_month']) - 1) && parseInt(ttd['start_year']) == currentYear && cwDates.includes(parseInt(ttd['start_day']))){
            currentWeekData.push(ttd);
        }
    });
}


function getDailyData(day){
    let data = [];
    let startHrs = []
    currentWeekData.forEach((wkd) => {
        if (wkd['start_day'] == day){
            data.push(wkd);
            if (wkd['start_pm_am'] == 'AM')
                startHrs.push(parseInt(wkd['start_hour']));
            else if (parseInt(wkd['start_hour']) == 12)
                startHrs.push(parseInt(wkd['start_hour']));
            else
                startHrs.push(parseInt(wkd['start_hour']));
        }
    });
    return [data, startHrs];

}

function getDataWithId(id){
    let timeData = []
    for (let i=0; i<currentWeekData.length; i++){
        let wkd = currentWeekData[i];
        if (wkd['id'] == id){
            timeData = wkd;
            break;
        }
    }
    return timeData;
}





// RECIPE COMPONENT

function recipeComponent(){
    $("#component-holder").empty();

    // Top Bar
    let topBar = document.createElement('div');
    topBar.classList.add("top-bar");

    let h1TopBar = document.createElement('h3');
    h1TopBar.classList.add("flexed-div");

    let title = document.createElement("div");
    title.classList.add("date-text");
    title.innerHTML = "Recipes";

    let btnHolder = document.createElement("div");
    btnHolder.classList.add("new-course-btn-holder");

    let btn = document.createElement("div");
    btn.classList.add("new-course-btn");
    btn.classList.add("float-right");
    btn.classList.add("btn");
    btn.innerHTML = "NEW RECIPE";
    btn.addEventListener("click", newRecipeComponent);


    btnHolder.append(btn);

    h1TopBar.append(title, btnHolder);

    let hr = document.createElement("hr");
    topBar.append(h1TopBar, hr);


    // Courses Bar
    // let coursesDiv = document.createElement("div");
    // coursesDiv.classList.add("flexed-div");
    // coursesDiv.classList.add("courses-div");
    
    // coursesData.forEach((cd) => {
    //     let courseHolder = document.createElement("div");
    //     courseHolder.classList.add("course-holder");

    //     let buttonsDiv = document.createElement("div");
    //     buttonsDiv.classList.add("top-buttons-div");
    //     buttonsDiv.classList.add("flexed-div");

    //     let editDiv = document.createElement("div");
    //     let editInfoBar = document.createElement("div");
    //     editInfoBar.classList.add("edit-info-bar-" + cd["COURSE_NAME"]);
    
    //     let editCtrlDiv = createSvgDiv("edit", "task-edit-" + cd["COURSE_NAME"], function(){

    //     }, function(){
    //         addInfoBar(this, "Edit Task", "edit-info-bar-" + cd["COURSE_NAME"]);
    //         $("#task-edit-" + cd["COURSE_NAME"]).addClass("icon-edit-hover");
    //     }, function(){
    //         $("#task-edit-" + cd["COURSE_NAME"]).removeClass("icon-edit-hover");
    //     }, []);
    
    //     editDiv.append(editCtrlDiv, editInfoBar);
        
    //     let delDiv = document.createElement("div");
    //     let delInfoBar = document.createElement("div");
    //     delInfoBar.classList.add("del-info-bar-" + cd["COURSE_NAME"]);
    
    //     let delCtrlDiv = createSvgDiv("delete", "task-del-" + cd["COURSE_NAME"], function(){
    //         delCourseVar = cd['id'];
    //         launchDialog("Delete " + cd["COURSE_NAME"], 
    //         "Are you sure you want to delete this course? Action is unreversible.", 
    //         [{name: "CANCEL", func: enableCourseComponents}, {name: "DELETE", func: deleteCourse}], {func: enableCourseComponents}, [], true);
    //     }, function(){
    //         addInfoBar(this, "Delete Course", "del-info-bar-" + cd["COURSE_NAME"]);
    //         $("#task-del-" + cd["COURSE_NAME"]).addClass("icon-warn-hover");
    //     }, function(){
    //         $("#task-del-" + cd["COURSE_NAME"]).removeClass("icon-warn-hover");
    //     }, [])
        
    //     delDiv.append(delCtrlDiv, delInfoBar);

    //     buttonsDiv.append(delDiv, editDiv);

    //     let detailsDiv = document.createElement("div");
    //     detailsDiv.classList.add("first-details-div");

    //     let nameDiv = document.createElement("div");
    //     nameDiv.innerHTML = cd["COURSE_NAME"];

    //     let dateDiv = document.createElement("div");
    //     dateDiv.innerHTML = cd["START_TIME"] + " to " + cd["END_TIME"];

    //     detailsDiv.append(nameDiv, dateDiv);

    //     courseHolder.append(buttonsDiv, detailsDiv);
    //     coursesDiv.append(courseHolder);
    // });

    $("#component-holder").append(topBar);
}

function newRecipeComponent(){
    $("#component-holder").empty();
    let form = document.createElement("form");

    // Ingredients Group
    let ingredientsGroup = document.createElement("div");

    let ingredientsTitle = document.createElement("div");
    ingredientsTitle.innerHTML = "Ingredients";

    let firstIngredient = document.createElement("div");
    firstIngredient.classList.add("flexed-div");

    let firstIngredientInput = document.createElement("input");
    firstIngredientInput.classList.add("form-control");
    firstIngredientInput.setAttribute("placeholder", "Ingredient Name");

    let addBtn = document.createElement("div");
    addBtn.innerHTML = "+";
    addBtn.classList.add("btn");
    addBtn.classList.add("clock-btn");

    firstIngredient.append(firstIngredientInput, addBtn);
    ingredientsGroup.append(ingredientsTitle,firstIngredient);

    form.append(ingredientsGroup);
    $("#component-holder").append(form);
}