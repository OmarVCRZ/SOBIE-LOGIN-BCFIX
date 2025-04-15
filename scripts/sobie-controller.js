import {sobieDates} from './sobie-data.js';

$(function() {

  $('#sobieYear').text(sobieDates.sobieYear);  
  $('#sobieStart').text(sobieDates.getSobieStart());  
  $('#sobieEnd').text(sobieDates.getSobieEnd());  

  // console.log(sobieDates.getSobieStart());

  const thisSobieYear = sobieDates.sobieYear; 
  
  // console.log(thisSobieYear); 

  for (let j=0; j<thisSobieYear.length; j++){
  
    // condition ? exprIfTrue : exprIfFalse
      
    j == thisSobieYear.length-1 ?   $('#sobieHeaderYear').append(`${thisSobieYear[j]}`) : $('#sobieHeaderYear').append(`${thisSobieYear[j]}·`)

  }

  // console.log( sobieDates.sobieRate); 
  //sobie rate check
  sobieDates.sobieRate.ready ? 
  $('#sobieRateReady').append(`<div class="border border-2 border-info my-1 p-2 text-center "><a href="${sobieDates.sobieRate.url}" target="book">www.sandestin.com/SOBIE-2025-24X7C2</a><br><br>
    800-320-8115 (
    code: ${sobieDates.sobieRate.code})</a>
  </div>`) : 
  $('#sobieRateReady').append(` <span class="fw-bold"> around ${sobieDates.sobieRate.estimate}<i class="bi bi-hourglass-split"></i></span>`) 

}); //end doc ready 

