let DB;

let form = document.querySelector("form");
let patientName = document.querySelector("#patient-name");
let patientLastname = document.querySelector("#patient-last");
let contact = document.querySelector("#contact");
let date = document.querySelector("#date");
let time = document.querySelector("#time");
let symptoms = document.querySelector("#symptoms");
let consultations = document.querySelector("#consultations");
let services = document.querySelector("#services");

document.addEventListener("DOMContentLoaded", () => {
  // create the database
  let ScheduleDB = window.indexedDB.open("consultations", 1);

  // if there's an error
  ScheduleDB.onerror = function () {
    console.log("error");
  };

  // if everything is fine, assign the result to the DB instance
  ScheduleDB.onsuccess = function () {
    DB = ScheduleDB.result;
    showConsultations();
  };

  ScheduleDB.onupgradeneeded = function (e) {
    let db = e.target.result;

    let objectStore = db.createObjectStore("consultations", {
      keyPath: "key",
      autoIncrement: true,
    });

    objectStore.createIndex("patientname", "patientname", { unique: false });
    objectStore.createIndex("patientlastname", "patientlastname", { unique: false });
    objectStore.createIndex("contact", "contact", { unique: false });
    objectStore.createIndex("date", "date", { unique: false });
    objectStore.createIndex("time", "time", { unique: false });
    objectStore.createIndex("symptoms", "symptoms", { unique: false });
  };

  form.addEventListener("submit", addConsultations);

  function addConsultations(e) {
    e.preventDefault();
    let newConsultation = {
      patientname: patientName.value,
      patientlastname: patientLastname.value,  // Saving the last name in the DB
      contact: contact.value,
      date: date.value,
      time: time.value,
      symptoms: symptoms.value,
    };

    let transaction = DB.transaction(["consultations"], "readwrite");
    let objectStore = transaction.objectStore("consultations");

    let request = objectStore.add(newConsultation);
    request.onsuccess = () => {
      form.reset();
    };
    transaction.oncomplete = () => {
      showConsultations();
    };
    transaction.onerror = () => {
      console.error("Error adding consultation");
    };
  }

  function showConsultations() {
    while (consultations.firstChild) {
      consultations.removeChild(consultations.firstChild);
    }

    let objectStore = DB.transaction("consultations").objectStore("consultations");

    objectStore.openCursor().onsuccess = function (e) {
      let cursor = e.target.result;
      if (cursor) {
        let ConsultationHTML = document.createElement("li");
        ConsultationHTML.setAttribute("data-consultation-id", cursor.value.key);
        ConsultationHTML.classList.add("list-group-item");

        ConsultationHTML.innerHTML = `  
                         <p class="font-weight-bold">Patient Name:  <span class="font-weight-normal">${cursor.value.patientname} ${cursor.value.patientlastname}</span></p>
                          <p class="font-weight-bold">Contact:  <span class="font-weight-normal">${cursor.value.contact}</span></p>
                         <p class="font-weight-bold">Date:  <span class="font-weight-normal">${cursor.value.date}</span></p>
                         <p class="font-weight-bold">Time:  <span class="font-weight-normal">${cursor.value.time}</span></p>
                         <p class="font-weight-bold">Symptoms:  <span class="font-weight-normal">${cursor.value.symptoms}</span></p>
                    `;

        const cancelBtn = document.createElement("button");
        cancelBtn.classList.add("btn", "btn-danger");
        cancelBtn.innerHTML = "Cancel";
        cancelBtn.onclick = removeConsultation;

        ConsultationHTML.appendChild(cancelBtn);
        consultations.appendChild(ConsultationHTML);

        cursor.continue();
      } else {
        if (!consultations.firstChild) {
          services.textContent = "Change your visiting hours";
          let noSchedule = document.createElement("p");
          noSchedule.classList.add("text-center");
          noSchedule.textContent = "No results Found";
          consultations.appendChild(noSchedule);
        } else {
          services.textContent = "Cancel Your consultations";
        }
      }
    };
  }

  function removeConsultation(e) {
    let scheduleID = Number(
      e.target.parentElement.getAttribute("data-consultation-id")
    );

    let transaction = DB.transaction(["consultations"], "readwrite");
    let objectStore = transaction.objectStore("consultations");

    objectStore.delete(scheduleID);

    transaction.oncomplete = () => {
      e.target.parentElement.parentElement.removeChild(e.target.parentElement);

      if (!consultations.firstChild) {
        services.textContent = "Change your visiting hours";
       
)}