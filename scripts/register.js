let studentMode, htmlBody, emailBody; 

$(document).ready(() => {

    console.log("registration page ready!"); 

    // "declarations" hide & build
     let studentMode = false; 
     $('#sobieStudentSection').hide();
     $('#sobieFacultySection').hide(); 
     $('input.researchIntent').prop('disabled', true);
     $("#studentOtherText").hide();
     $("#studentPaperPreference").hide(); 
     $("#submissionAuthorshipGroup").hide(); 
     $("#submissionSection").hide(); 
     $("#notSubmitYetSection").hide();
     $("#notSubmitSection").hide();
     $("#timeSlotGroup").hide();
    buildResearchAreasButtons(); 
    // buildResearchAreasDropdown();
     $("#researchAreaOtherText").hide(); 

    function buildResearchAreasDropdown() {

        let $researchArea;

        $.each(researchAreasData, (i)=> {

            // console.log(i, researchAreasData[i])

            // if(i===0){ $('#researchAreasList').append(`<li class="list-group-item border-0">`)}

            $researchArea = `<li><a class="dropdown-item" id="researchArea${ i }" value="${researchAreasData[i]}" href="#">${researchAreasData[i]}</a>
                 </li>`;
        
            $('#researchAreasList').append($researchArea); 

            // if( (i+1) % 3 === 0 ) {
            //     $('#researchAreasList').append(`</li><li class="list-group-item border-0">`); 
            // }

            if( i === researchAreasData.length-1)
            {
                 $('#researchAreasList').append(`
                 
                 <li><a class="dropdown-item" id="researchAreaOther" value="other" href="#">${researchAreasData[i]}</a>
                 </li>
                 <input id="researchAreaOtherText" type="text" class="form-control" disabled placeholder="Please Specify..."></li>`); 

            }

        })

      

    }
    function buildResearchAreasButtons() {

        let $researchArea;

        $.each(researchAreasData, (i)=> {

            // console.log(i, researchAreasData[i])

            if(i===0){ $('#researchAreasList').append(`<li class="list-group-item border-0">`)}

            $researchArea = `<input type="radio" class="btn-check researchAreas" name="researchAreas" id="researchArea${ i }" autocomplete="off" value="${researchAreasData[i]}"><label class="btn btn-outline-primary me-2" for="researchArea${ i }">${researchAreasData[i]}</label>`;

            $('#researchAreasList').append($researchArea); 

            if( (i+1) % 3 === 0 ) {
                $('#researchAreasList').append(`</li><li class="list-group-item border-0">`); 
            }

            if( i === researchAreasData.length-1)
            {
                 $('#researchAreasList').append(`</li><li class="list-group-item border-0">
                 <input type="radio" class="btn-check researchAreas" name="researchAreas" id="researchAreaOther" autocomplete="off" value="other"><label class="btn btn-outline-primary me-2" for="researchAreaOther">Other</label><input id="researchAreaOtherText" type="text" class="form-control" disabled placeholder="Please Specify..."></li>`); 

            }

        })

       

    }

    $('.sobieFirst').change((e) => {
       
        e.preventDefault(); 
        let  $yesNo = $('#' + e.target.getAttribute("id")); 
       
        if ($yesNo.val()==='yes') {
          $('#firstSobieMessage').text("Great! We look forward to meeting you!");
        }
        else if($yesNo.val()==='no')
        {
          $('#firstSobieMessage').text("Great! Welcome back.")
        }
    }); 

    $('.sobieStudent').change((e) => {
        console.log('in student  change'); 
     
        e.preventDefault(); 
        
        let $yesNoStudent = $('#' + e.target.getAttribute("id")); 
      
        if ($yesNoStudent.val() === 'yes') {
         $('#sobieFacultySection').hide(); 
          $('#sobieStudentSection').show();
          studentMode = true; 
          $('#studentPaperGroup').hide();
          $('#studentPaperPreference').hide();
          
       
        }
        else if ($yesNoStudent.val() === 'no') {
         $('#sobieStudentSection').hide();
         $('#sobieFacultySection').show(); 
         studentMode = false; 
         $('#studentPaperGroup').show()
        //  $('#studentPaperPreference').show();
          
      }
    });

    $('.studentClass').change((e) => {
      console.log('in student class change'); 
        e.preventDefault(); 
        let $studentOther = $('#' + e.target.getAttribute("id")); 

        if ($studentOther.val() === 'other') {
         $("#studentOtherText").prop('disabled', false).show(); 
       
        }
        else {
         $("#studentOtherText").prop('disabled', true).hide(); 
         $('#studentOtherText').val(''); 
       
      }
    });

    $('#hotelAgree').change((e) => {
     
      $('input[name="hotelAgree"]').is(':checked') ? $('input.researchIntent').prop('disabled', false) : $('input.researchIntent').prop('disabled', true)
          
    }); 

     $('.researchIntent').change((e) => {
        e.preventDefault(); 
        let $researchIntent = $('#' + e.target.getAttribute("id")); 

        if ($researchIntent.val() === 'yesNow') {
         $("#submissionSection").show(); 
         $("#notSubmitYetSection").hide();
         $("#notSubmitSection").hide(); 
        }
       else if ($researchIntent.val() === 'yesLater')
        {
         $("#submissionSection").hide(); 
          $("#notSubmitYetSection").show();
          $("#notSubmitSection").hide(); 
        }
        else if($researchIntent.val() === 'noAttend')
        {
           $("#submissionSection").hide(); 
          $("#notSubmitYetSection").hide();
          $("#notSubmitSection").show()
        }
    });

     $('.studentPaper').change((e) => {
        e.preventDefault(); 
        let $studentPaper = $('#' + e.target.getAttribute("id")); 

        if ($studentPaper.val() === 'yes') {
         $("#studentPaperPreference").show(); 
        }
       else if ($studentPaper.val() === 'no') {
         $("#studentPaperPreference").hide(); 
         //
       

      }
    });

     $('.researchAreas').change((e) => {
        e.preventDefault(); 
        let $researchAreasOther = $('#' + e.target.getAttribute("id")); 

        if ($researchAreasOther.val() === 'other') {
         $("#researchAreaOtherText").prop('disabled', false).show(); 
        }
        else {
         $("#researchAreaOtherText").val('').prop('disabled', true).hide(); 
       

      }
    });

     $('.submissionAuthors').change((e) => {
        e.preventDefault(); 
        let $submissionAuthors = $('#' + e.target.getAttribute("id")); 

        if ($submissionAuthors.val() === 'yes') {
          if(studentMode) {
            $('#studentPaperGroup').hide();
            $('#studentPaperPreference').hide();
          }
          else if(!studentMode) {
            $('#studentPaperGroup').show();
            $('#studentPaperPreference').show();
          } 
        
         $("#submissionAuthorshipGroup").show(); 
        }
        else if ($submissionAuthors.val() === 'no') { 
         $('#studentPaperGroup').hide();
         $('#studentPaperPreference').hide();
         $("#submissionAuthorshipGroup").hide(); 
      }
    });
    
    //currently turnd off 
    $('.timeSlot').change((e) => {
        e.preventDefault(); 
        $timeSlot = $('#' + e.target.getAttribute("id")); 

        let numberNotChecked = $('input.timeSlot:checkbox:not(":checked")').length;
       
        if (numberNotChecked === 0) {
         console.log('plz select not all');

        }
        // else if ($timeSlot.val() === 'no') {
        //    $("#submissionAuthorshipGroup").hide(); 
       //      }
    });

//$('#reviewModal').on('show.bs.modal', function(){
  
$('#reviewRegistration').on('click', function(){

  $('#registrationReviewList').empty(); 

  grabFormData(); 

  htmlBody = "";
  emailBody = ""; 
  emailBody += "SOBIE '25 Registration Information\r"; 
  emailBody += "=============================\r\r";
  
  if(formData[0].registrantFirstName || formData[0].registrantFirstName){
    htmlBody += `<li class="list-group-item"><strong> Name:</strong> ${formData[0].registrantName} </li>`;
    emailBody += `Name: ${formData[0].registrantName}\r\r`;  
  }

  if(formData[0].email){
    htmlBody += `<li class="list-group-item"><strong>Email:</strong> ${formData[0].email} </li>`; 
    emailBody += `Email: ${formData[0].email}\r\r`; 
  }

  if(formData[0].firstSobie){
    htmlBody += `<li class="list-group-item"><strong>First Time Attending SOBIE:</strong> ${formData[0].firstSobie} </li>`; 
    emailBody += `First Time Attending SOBIE: ${formData[0].firstSobie}\r\r`; 
  }

  console.log('student mode', studentMode);
  if(formData[0].studentStatus === 'yes') {
      htmlBody += 
      `<li class="list-group-item"><strong>Student Affiliation:</strong> ${formData[0].student[0].affiliation}, ${formData[0].student[0].program}, ${formData[0].student[0].class} </li>`;
      emailBody += `Student Affiliation: ${formData[0].student[0].affiliation}, ${formData[0].student[0].program}, ${formData[0].student[0].class}\r\r`;
    }
  else if(formData[0].studentStatus === 'no') {
       htmlBody += 
         `<li class="list-group-item"><strong>Affiliation:</strong> ${formData[0].faculty[0].affiliation}, ${formData[0].faculty[0].rank} </li>`;
         emailBody += `Affiliation: ${formData[0].faculty[0].affiliation}, ${formData[0].faculty[0].rank}\r\r`;
    }

    if(formData[0].hotel){
      htmlBody += `<li class="list-group-item"><strong>Hotel Acknowledgement:</strong> ${formData[0].hotel}`; 
      emailBody += `Hotel Acknowledgement: ${formData[0].hotel}\r\r`;
    }

//
    //yesNow yesLater noAttend 
  if(formData[0].researchStatus === "yesNow")
   {
    htmlBody += `<li class="list-group-item"><strong>Research Submission:</strong> ${formData[0].title} (${formData[0].submissionType})</li>`;
    emailBody += `Research Submission: ${formData[0].title}, ${formData[0].submissionType}\r\r`;

    
    //if coauthors and in student mode (no collaboration & session preference)
    if(formData[0].coauthors === 'yes' && formData[0].studentStatus === 'yes'){
      htmlBody += `<li class="list-group-item"><strong>Student co-authors:</strong></li> ${formData[0].coauthors} </li>`; 
      emailBody += `Student co-authors: ${formData[0].coauthors}\r\r`;

    }
    //if coauthors & NOT student mode =  student collaboration & pref.
    else if(formData[0].coauthors === 'yes' && formData[0].studentStatus === 'no' && formData[0].studentCollaboration === 'yes'){
       htmlBody += `<li class="list-group-item"><strong>Student Reserach Collaboration Session Preference:</strong></li>${formData[0].collaborationPreference} </li>`; 
        emailBody += `Student Reserach Collaboration Session Preference: ${formData[0].collaborationPreference}\r\r`;

    }
    // yes coathors and NOT student mode but no student collab, so no PREF. 
    else if(formData[0].coauthors === 'yes' && formData[0].studentStatus === 'no' && formData[0].studentCollaboration === 'no')
    {
       htmlBody += `<li class="list-group-item"><strong>Co-authors:</strong></li> ${formData[0].coauthors} </li>`;; 
      emailBody += `Co-authors: ${formData[0].coauthors}\r\r`;
    }
    
    htmlBody += `<li class="list-group-item"><strong>Submission Abstract:</strong> ${formData[0].abstract} </li>`; 
    emailBody += `Submission Abstract: ${formData[0].abstract}%0D%0A`;

    htmlBody += `<li class="list-group-item"><strong>Research Area:</strong> ${formData[0].area} </li>`; 
    emailBody += `Research Area: ${formData[0].area}\r`;

    htmlBody += `<li class="list-group-item"><strong>Include in Proceedings:</strong> ${formData[0].proceedings} </li>`;   
    emailBody += `Include in Proceedings: ${formData[0].proceedings}\r`;

   } 
   else if(formData[0].researchStatus){
    htmlBody += `<li class="list-group-item"><strong>Research Submission Status:</strong> No or not at this time. <br><i>You may submit research directly to the SOBIE Conference Chair: kdmalone@una.edu.</i></li>`;
    emailBody += `Research Submission Status:  No or not at this time.\rYou may submit research directly to the SOBIE Conference Chair: kdmalone@una.edu\r\r`; 
   }

    if(formData[0].details.length > 1){
      htmlBody += `<li class="list-group-item"><strong>Additional Registration Information:</strong> ${formData[0].details} </li>`
      emailBody += `Additional Registration Information:  ${formData[0].details}\r\r`;
    }
    

  console.log('htmlBody: ', htmlBody);
  $('#registrationReviewList').append(htmlBody);
  
  // emailBody += `%0D%0A%0D%0A%0D%0APlease attach your research submission to this email%0D%0A%0D%0A%0D%0AThank you,%0D%0AThe SOBIE Team`;
 
  //append hotel code info 
  //todo: update from sobie-data.js
  emailBody += `Sandestin Resort Accommodations\rSOBIE Group Code: https://www.sandestin.com/book-now?group=24X7C2&checkin=04/07/25&checkout=04/13/25&rooms=1&adults=1&PID=39297#/room\r`;
  emailBody += `or call: 800-320-8115, use code: 24X7C2\r\r`;

  // emailBody = emailBody.replace(',' ,'%2C'); 
  // emailBody = emailBody.replace(',' ,'%2C'); 
  
  emailBody += `For any changes to your registration information, please email the SOBIE conference chair, Dr. Malone: kdmalone@una.edu\r\r`;

  emailBody += `Next Steps:\rLook out for an email from you SOBIE Conference Chair with a decision on submitted research and further instructions.`;

  emailBody += `Thank you for using the https://SOBIECONFERENCE.org email registration.\rThis is built from the ground up by undergraduate students at UNA.\rWe appreciate your patience!\r\r-See you in Sandestin ☀️\rThe SOBIE WEB TEAM\r\r`;

  emailBody += `SOBIE '25 CFP: https://www.sobieconference.org/assets/sobieDocs/sobie2025-callForPapers.pdf`;


  // console.log('emailBody:' , emailBody); 
  
  //todo: revive? 
    // $('#mailLink').append(`<a class="btn btn-success" href="mailto:kdmalone@una.edu?cc=bcumbie@una.edu&subject=SOBIE24 Registration:${formData[0].registrantName}&body=${emailBody}">click here</a>`); 

   //<a href="mailto:email@example.com">Send Email</a>

  //  $.each(formData[0], function(k,v){
   
  //     $('#registrationReviewList').append(`<li class="list-group-item"><strong>${k}:</strong> ${v} </li>`);  
    
  // });

  
});    

//send static front end form to our node back 
//to save in a mongo atlas & email to ppl
//would be great to get ID and link back too!  
$('#submitRegistration').on('click',()=>{

  console.log('in submit registration save & email'); 
    // e.preventDefault(); 
    
    let renderApp = 'https://sobiecontroller.onrender.com/register';
    // let renderApp = 'http://localhost:3000/register'; 

    $.ajax({
      url: renderApp,
      type: 'post',
      dataType: 'json',
      data: { registrationData: formData[0], emailBody: emailBody, htmlBody: htmlBody },
      success: function(data) {
          console.log('data', data); 
       
      }
    });

    $('#reviewConfirm').empty().append(` <div class="modal-header">
          <!-- todo: update date with variable -->
          <h2 class="modal-title">SOBIE '25 Registration Confirmation</h2>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>`).append(`<div class="modal-body text-center">
          <p>Please check your email for your registration confirmation<br><br><i>${formData[0].email}</i><br><br>
          Please add <i>noreply@sobieconference.org</i> to your known senders list.<br><br>
          Thank you and see you in sunny Sandestin! ☀️<br>
          -The SOBIE Web Team<br><br>
          <a href="index.html">close & go back to SOBIE</a>
          </div>`); 


    })

// Example starter JavaScript for disabling form submissions if there are invalid fields
// (function () {
//   'use strict'

//   // Fetch all the forms we want to apply custom Bootstrap validation styles to
//   var forms = document.querySelectorAll('.needs-validation')

//   // Loop over them and prevent submission
//   Array.prototype.slice.call(forms)
//     .forEach(function (form) {
//       form.addEventListener('submit', function (event) {
//         if (!form.checkValidity()) {
//           event.preventDefault()
//           event.stopPropagation()
//         }

//         form.classList.add('was-validated')
//       }, false)
//     })
// })()



 }); //end of doc ready 


function grabFormData() {

    $("input:checked").each(function() {
      if(this.checked == true)
      {
        //this.type
        console.log(this.name, this.value); 
        if(this.name == "sobieFirst") {formData[0].firstSobie = this.value} //: formData[0].firstSobie = "no first sobie response";
        if(this.name == "sobieStudent") { formData[0].studentStatus = this.value} //: formData[0].studentStatus = "not student response"; 
        if(this.name == "hotelAgree") { formData[0].hotel = this.value} //: formData[0].hotel = "no hotel response"; 
        if(this.name == "researchIntent") { formData[0].researchStatus = this.value}//: formData[0].researchStatus = "no research status response"; 
        if(this.name == "submissionType") { formData[0].submissionType = this.value } //: formData[0].submissionType = "no research type response"; 
        if(this.name == "submissionAuthors") { formData[0].coauthors = this.text }
        if(this.name == "studentPaper") { formData[0].studentcollaboration = this.text }//: formData[0].studentcollaboration = "no research type response";        
        if(this.name == "sessionPreference") { formData[0].collaborationPreference = this.text }//: formData[0].collaborationPreference = "no research type response";        
        if(this.name == "includeProdceedings") { formData[0].proceedings = this.value} //: formData[0].proceedings = "no proceedings response"; 
   
      }
    });
    formData[0].registrantName = $('#lastName').val() + ', ' + $('#firstName').val(); 
    formData[0].registrantLastName = $('#lastName').val(); 
    formData[0].registrantFirstName = $('#firstName').val(); 
    formData[0].email = $('#email').val(); 
    
    if(formData[0].studentStatus === 'yes') {
        formData[0].student[0].affiliation = $('#studentAffiliation').val(); 
        formData[0].student[0].program = $('#studentProgram').val();
        
        if($('input[name="studentClass"]:checked').val() === 'other'){
          formData[0].student[0].class = $('#studentOtherText').val();
        }
        else{
            formData[0].student[0].class = $('input[name="studentClass"]:checked').val()
        }
    }
    else if(formData[0].studentStatus === 'no')
    {
      console.log($('#facultyAffiliation').val()); 
           formData[0].faculty[0].affiliation = $('#facultyAffiliation').val(); 
           formData[0].faculty[0].rank = $('#facultyRank').val(); 
    }

    formData[0].title = $('#submissionTitle').val(); 
    formData[0].abstract = $('#submissionAbstract').val(); 
    formData[0].coauthors = $('#submissionAuthorship').val(); 
    formData[0].area = $('#researchArea').val(); 
    formData[0].details = $('#anyOtherDetails').val(); 
    
    console.log('formDataObject: ', formData[0]);

}

const formData = [
	{
        registrantName: '', 
        registrantFirstName: '', 
        registrantLastName: '',
        email: '', 
        firstSobie: '', 
        studentStatus: '', 
        student: [
            { 
                affiliation: '',
                program: '', 
                class: ''
            }],
        faculty: [
            {
                affiliation: '',
                rank: ''
            }],
        hotel: '',
        researchStatus: '', 
        submissionType: '', 
        title: '',
        coauthors: '', 
        studentCollaboration: '', 
        collaborationPreference: '', 
        abstract: '', 
        area: '', 
        proceedings: '', 
        details: ''
    }
]; 
 
// const sobieDates = 
// [
//     {year: "2024",
//      month: "April",
//      wednesday: "April 10",
//      thursday: "April 11",
//      friday: "April 12",
//      start: "April 10",
//      end: "April 14", 
//      numDates: "4/10/2023 - 4/12/2023",
//      numDatesShort: "4/10 to 4/12"
//     }
// ]; 

const researchAreasData = 
[
    "Advertising & Promotion", "Business Administration", "Business Communication", "Business Education", "Business Ethics", "Business Information Systems (CIS or MIS)", "Business Law", "Case Studies", "E-Commerce", "Economics", "Entrepreneurship", "Family & Small Business Enterprises", "Finance", "Governmental Accounting", "Health Care Administration", "History of Economic Thought", "Human Resource Management", "Interdisciplinary Research", "International Business", "Leadership", "Management", "Marketing", "Medical Economics", "Non-Profit Organizations", "Operations Management", "Organizational Behavior & Theory", "Organizational Development", "Pedagogy", "Public Administration", "Public Policy Analysis", "Sales Management", "Sports Economics", "Statistics", "Strategic Management Policy", "Tax Policy", "Trade"
]; 






