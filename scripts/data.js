const sobieDates = {
  sobieYear: "2025",
  sobieStartDate: new Date("Apr 9 2025 00:00:00 CST"), 
  sobieEndDate: new Date("Apr 11 2025 00:00:00 CST"),
  getSobieStart(){return `${weekday[this.sobieStartDate.getDay()]},  ${month[this.sobieStartDate.getMonth()]} ${this.sobieStartDate.getDate()}, ${this.sobieStartDate.getFullYear()}`},
  getSobieEnd(){return `${weekday[this.sobieEndDate.getDay()]},  ${month[this.sobieEndDate.getMonth()]} ${this.sobieEndDate.getDate()}, ${this.sobieEndDate.getFullYear()}`},
  sobieCallForPapersDate: {
    ready: true,
    estimate: "TBA mid December",
    actual: new Date("Jan 7 2025 09:06:00 CST)")},
  sobieRegistrationDate: {
    ready: false, 
    estimate: "TBA mid March",
  },
  sobieRate : {
    ready: true, 
    estimate: "TBA mid January",
    actual: new Date("Jan 7 2025 09:06:00 CST)"),
    code: "24X7C2", 
    url: "https://www.sandestin.com/book-now?group=24X7C2&checkin=04/07/25&checkout=04/13/25&rooms=1&adults=1&PID=39297#/room"
  }
}

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export { sobieDates }; 
