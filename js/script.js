/* =========================================================
   LifeCare Wellness Clinic - Main JavaScript
   Handles the forms, tables and staff login on every page.
   In this prototype the data is saved in the browser
   (localStorage), so no database server is needed.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Clinic data (staff, rooms, services) ---------- */

  var STAFF = [
    { id: 'D01', name: 'Dr. Nimal Perera', role: 'Doctor', speciality: 'General Physician', days: [1, 2, 3, 4, 5, 6], start: '08:00', end: '13:00', room: 'Consultation Room 1' },
    { id: 'D02', name: 'Dr. Anjali Fernando', role: 'Doctor', speciality: 'Cardiologist', days: [1, 3, 5], start: '14:00', end: '18:00', room: 'Consultation Room 2' },
    { id: 'D03', name: 'Dr. Ruwan Silva', role: 'Doctor', speciality: 'Paediatrician', days: [2, 4, 6], start: '09:00', end: '13:00', room: 'Consultation Room 3' },
    { id: 'D04', name: 'Dr. Shalini Jayawardena', role: 'Doctor', speciality: 'Dermatologist', days: [1, 4], start: '15:00', end: '19:00', room: 'Consultation Room 3' },
    { id: 'D05', name: 'Dr. Kasun Wijesinghe', role: 'Doctor', speciality: 'Orthopaedic Surgeon', days: [3, 6], start: '09:00', end: '12:00', room: 'Procedure Room' },
    { id: 'N01', name: 'Nurse Dilani Rathnayake', role: 'Nurse', speciality: 'Senior Nurse', days: [1, 2, 3, 4, 5], start: '07:00', end: '15:00', room: 'Treatment Room' },
    { id: 'N02', name: 'Nurse Tharindu Bandara', role: 'Nurse', speciality: 'Staff Nurse', days: [1, 2, 3, 4, 5], start: '14:00', end: '21:00', room: 'Observation Ward' },
    { id: 'N03', name: 'Nurse Sachini Gunasekara', role: 'Nurse', speciality: 'Weekend Nurse', days: [6, 0], start: '08:00', end: '13:00', room: 'Treatment Room' }
  ];

  var ROOMS = [
    { id: 'CR1', name: 'Consultation Room 1', type: 'Consultation', floor: 'Ground floor', info: 'General consultations' },
    { id: 'CR2', name: 'Consultation Room 2', type: 'Consultation', floor: 'Ground floor', info: 'Cardiology, with ECG machine' },
    { id: 'CR3', name: 'Consultation Room 3', type: 'Consultation', floor: 'First floor', info: 'Paediatrics and dermatology' },
    { id: 'PR1', name: 'Procedure Room', type: 'Procedure', floor: 'First floor', info: 'Minor surgical procedures' },
    { id: 'TR1', name: 'Treatment Room', type: 'Treatment', floor: 'Ground floor', info: 'Dressings, injections, nebulising' },
    { id: 'LAB', name: 'Laboratory', type: 'Diagnostics', floor: 'Ground floor', info: 'Blood and urine sample collection' },
    { id: 'XRY', name: 'X-ray Room', type: 'Diagnostics', floor: 'Ground floor', info: 'Digital X-ray imaging' },
    { id: 'OBW', name: 'Observation Ward', type: 'Ward', floor: 'First floor', info: '6 beds for short-stay observation' }
  ];

  var SERVICES = [
    { code: 'S01', name: 'General consultation', price: 2500 },
    { code: 'S02', name: 'Specialist consultation', price: 4500 },
    { code: 'S03', name: 'Full blood count (FBC)', price: 1200 },
    { code: 'S04', name: 'Lipid profile', price: 2800 },
    { code: 'S05', name: 'Fasting blood sugar', price: 600 },
    { code: 'S06', name: 'ECG', price: 2000 },
    { code: 'S07', name: 'X-ray (single view)', price: 3500 },
    { code: 'S08', name: 'Wound dressing', price: 1000 },
    { code: 'S09', name: 'Minor procedure', price: 8000 },
    { code: 'S10', name: 'Observation ward (per day)', price: 12000 },
    { code: 'S11', name: 'Wellness health check package', price: 9500 }
  ];

  var LOCATIONS = ['Reception', 'Waiting Area', 'Consultation Room 1', 'Consultation Room 2', 'Consultation Room 3',
    'Procedure Room', 'Treatment Room', 'Laboratory', 'X-ray Room', 'Observation Ward', 'Pharmacy',
    'Discharged', 'Transferred to hospital'];

  // Demo staff account for the prototype (a real system would check this on the server)
  var STAFF_ACCOUNTS = [
    { username: 'staff', password: 'LifeCare@2026', name: 'Reception Staff' }
  ];

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var PHONE_PATTERN = /^(\+94|0)\d{9}$/;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---------- 2. Helper functions ---------- */

  var memoryStore = {};

  // Read saved data. If nothing is saved yet, return the default value.
  function getData(key, defaultValue) {
    var text = null;
    try {
      text = window.localStorage.getItem(key);
    } catch (e) {
      text = memoryStore[key] || null;
    }
    if (text === null) { return defaultValue; }
    try {
      return JSON.parse(text);
    } catch (e) {
      return defaultValue;
    }
  }

  // Save data in the browser
  function saveData(key, value) {
    var text = JSON.stringify(value);
    memoryStore[key] = text;
    try {
      window.localStorage.setItem(key, text);
    } catch (e) {
      // Storage is blocked: data stays until the page is closed
    }
  }

  // Stops user input being run as HTML (protects against XSS)
  function escapeHTML(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function dateToString(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function todayString(addDays) {
    var d = new Date();
    d.setDate(d.getDate() + (addDays || 0));
    return dateToString(d);
  }

  function formatDate(str) {
    if (!str) { return ''; }
    var p = str.split('-');
    return parseInt(p[2], 10) + ' ' + MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }

  function formatTime(t) {
    var h = parseInt(t.split(':')[0], 10);
    var m = t.split(':')[1];
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12;
    if (h12 === 0) { h12 = 12; }
    return h12 + ':' + m + ' ' + ampm;
  }

  function toMinutes(t) { var p = t.split(':'); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
  function fromMinutes(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function nowMinutes() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }

  function stampAt(addDays, time) { return todayString(addDays) + ' ' + time; }
  function nowStamp() { var d = new Date(); return dateToString(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function formatStamp(s) { var p = s.split(' '); return formatDate(p[0]) + ', ' + formatTime(p[1]); }

  function dayOfWeek(str) {
    var p = str.split('-');
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10)).getDay();
  }

  function money(n) { return 'LKR ' + Number(n).toLocaleString('en-US'); }

  function cleanPhone(value) { return value.replace(/[\s-]/g, ''); }

  function getAge(dob) {
    if (!dob) { return '-'; }
    var p = dob.split('-');
    var today = new Date();
    var age = today.getFullYear() - parseInt(p[0], 10);
    var month = today.getMonth() + 1 - parseInt(p[1], 10);
    if (month < 0 || (month === 0 && today.getDate() < parseInt(p[2], 10))) { age--; }
    return age;
  }

  // Works out the next ID number, e.g. P1005 -> P1006
  function nextId(list, prefix, start) {
    var max = start;
    for (var i = 0; i < list.length; i++) {
      var n = parseInt(String(list[i].id).replace(/\D/g, ''), 10);
      if (n > max) { max = n; }
    }
    return prefix + (max + 1);
  }

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { return list[i]; }
    }
    return null;
  }

  // "1,2,3,4,5" -> "Mon - Fri" and "1,3,5" -> "Mon, Wed, Fri"
  function daysText(days) {
    var consecutive = days.length >= 3;
    for (var i = 1; i < days.length; i++) {
      if (days[i] !== days[i - 1] + 1) { consecutive = false; }
    }
    if (consecutive) { return DAY_SHORT[days[0]] + ' – ' + DAY_SHORT[days[days.length - 1]]; }
    var names = [];
    for (var j = 0; j < days.length; j++) { names.push(DAY_SHORT[days[j]]); }
    return names.join(', ');
  }

  function nextWorkingDay(staff, startOffset) {
    for (var i = startOffset; i < startOffset + 14; i++) {
      if (staff.days.indexOf(dayOfWeek(todayString(i))) !== -1) { return todayString(i); }
    }
    return todayString(startOffset);
  }

  function showMessage(id, text, type) {
    var el = document.getElementById(id);
    if (!el) { return; }
    el.textContent = text;
    el.className = 'message ' + type;
  }

  function clearMessage(id) {
    var el = document.getElementById(id);
    if (el) { el.textContent = ''; el.className = 'message'; }
  }

  // Shows or clears the error text under a form field
  function setError(input, text) {
    var errorEl = document.getElementById(input.id + 'Error');
    if (text) {
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) { errorEl.textContent = text; }
    } else {
      input.removeAttribute('aria-invalid');
      if (errorEl) { errorEl.textContent = ''; }
    }
  }

  // Checks every field marked "required". Returns true when all are filled in.
  function checkRequired(form) {
    var ok = true;
    var fields = form.querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].type === 'checkbox') { continue; }
      if (fields[i].required && fields[i].value.trim() === '') {
        setError(fields[i], 'This field is required.');
        ok = false;
      } else {
        setError(fields[i], '');
      }
    }
    return ok;
  }

  function focusFirstError(form) {
    var bad = form.querySelector('[aria-invalid="true"]');
    if (bad) { bad.focus(); }
  }

  function clearErrors(form) {
    var fields = form.querySelectorAll('[aria-invalid]');
    for (var i = 0; i < fields.length; i++) { setError(fields[i], ''); }
  }

  function badge(text, colour) { return '<span class="badge badge-' + colour + '">' + escapeHTML(text) + '</span>'; }

  function optionList(items, placeholder) {
    var html = placeholder ? '<option value="">' + escapeHTML(placeholder) + '</option>' : '';
    for (var i = 0; i < items.length; i++) {
      html += '<option value="' + escapeHTML(items[i].value) + '">' + escapeHTML(items[i].text) + '</option>';
    }
    return html;
  }

  function timeOptions(fromTime, toTime) {
    var items = [];
    for (var m = toMinutes(fromTime); m <= toMinutes(toTime); m += 30) {
      items.push({ value: fromMinutes(m), text: formatTime(fromMinutes(m)) });
    }
    return items;
  }

  /* ---------- 3. Sample records (shown the first time the site is opened) ---------- */

  var SAMPLE_PATIENTS = [
    { id: 'P1001', name: 'Kamal Senanayake', dob: '1968-04-12', gender: 'Male', phone: '0771234501', email: 'kamal.s@example.com', address: '12, Temple Road, Nugegoda', blood: 'O+', history: 'Hypertension, on daily medication', allergies: 'None known', emergencyName: 'Sunethra Senanayake', emergencyPhone: '0771234591', registered: todayString(-30) },
    { id: 'P1002', name: 'Nadeesha Kumari', dob: '1990-09-03', gender: 'Female', phone: '0712345602', email: 'nadeesha.k@example.com', address: '45/2, Lake Drive, Rajagiriya', blood: 'A+', history: 'Asthma', allergies: 'Penicillin', emergencyName: 'Chaminda Perera', emergencyPhone: '0712345692', registered: todayString(-21) },
    { id: 'P1003', name: 'Saman Jayasuriya', dob: '1955-01-25', gender: 'Male', phone: '0763456703', email: '', address: '8, Station Road, Dehiwala', blood: 'B+', history: 'Type 2 diabetes', allergies: 'None known', emergencyName: 'Priyanka Jayasuriya', emergencyPhone: '0763456793', registered: todayString(-14) },
    { id: 'P1004', name: 'Hiruni Peiris', dob: '2016-06-18', gender: 'Female', phone: '0754567804', email: 'peiris.family@example.com', address: '21, Flower Road, Colombo 07', blood: 'AB+', history: 'No major illnesses', allergies: 'Peanuts', emergencyName: 'Dilan Peiris', emergencyPhone: '0754567894', registered: todayString(-7) },
    { id: 'P1005', name: 'Mohamed Rizwan', dob: '1983-11-30', gender: 'Male', phone: '0779876505', email: 'rizwan.m@example.com', address: '3, Marine Drive, Wellawatte', blood: 'O-', history: 'Knee ligament injury (2025)', allergies: 'None known', emergencyName: 'Fathima Rizwan', emergencyPhone: '0779876595', registered: todayString(-3) }
  ];

  function sampleAppointments() {
    return [
      { id: 'A2001', patient: 'Kamal Senanayake', phone: '0771234501', doctorId: 'D01', date: nextWorkingDay(STAFF[0], 1), time: '09:00', reason: 'Blood pressure review', status: 'Booked' },
      { id: 'A2002', patient: 'Nadeesha Kumari', phone: '0712345602', doctorId: 'D01', date: nextWorkingDay(STAFF[0], 1), time: '10:30', reason: 'Asthma follow-up', status: 'Booked' },
      { id: 'A2003', patient: 'Saman Jayasuriya', phone: '0763456703', doctorId: 'D02', date: nextWorkingDay(STAFF[1], 1), time: '15:00', reason: 'Chest pain check and ECG', status: 'Booked' },
      { id: 'A2004', patient: 'Hiruni Peiris', phone: '0754567804', doctorId: 'D03', date: nextWorkingDay(STAFF[2], 1), time: '09:30', reason: 'Fever and cough', status: 'Booked' },
      { id: 'A2005', patient: 'Mohamed Rizwan', phone: '0779876505', doctorId: 'D05', date: nextWorkingDay(STAFF[4], 1), time: '10:00', reason: 'Knee review', status: 'Booked' }
    ];
  }

  function sampleRoomBookings() {
    return [
      { id: 'R3001', roomId: 'LAB', date: todayString(0), time: '08:30', duration: 30, purpose: 'Test', patient: 'Kamal Senanayake', doctorId: 'D01', status: 'Booked' },
      { id: 'R3002', roomId: 'PR1', date: todayString(0), time: '10:00', duration: 60, purpose: 'Procedure', patient: 'Mohamed Rizwan', doctorId: 'D05', status: 'Booked' },
      { id: 'R3003', roomId: 'CR2', date: todayString(0), time: '15:00', duration: 30, purpose: 'Consultation', patient: 'Saman Jayasuriya', doctorId: 'D02', status: 'Booked' }
    ];
  }

  function sampleInvoices() {
    return [
      { id: 'INV-4001', date: todayString(-2), patientId: 'P1001', patientName: 'Kamal Senanayake', items: [{ name: 'General consultation', price: 2500 }, { name: 'Lipid profile', price: 2800 }], total: 5300, paid: 5300, payments: [{ date: todayString(-2), amount: 5300, method: 'Cash' }] },
      { id: 'INV-4002', date: todayString(-1), patientId: 'P1003', patientName: 'Saman Jayasuriya', items: [{ name: 'Specialist consultation', price: 4500 }, { name: 'ECG', price: 2000 }, { name: 'Full blood count (FBC)', price: 1200 }], total: 7700, paid: 5000, payments: [{ date: todayString(-1), amount: 5000, method: 'Card' }] },
      { id: 'INV-4003', date: todayString(0), patientId: 'P1005', patientName: 'Mohamed Rizwan', items: [{ name: 'Specialist consultation', price: 4500 }, { name: 'X-ray (single view)', price: 3500 }], total: 8000, paid: 0, payments: [] }
    ];
  }

  function sampleInquiries() {
    return [
      { id: 'Q5001', time: stampAt(0, '09:15'), name: 'Nadeesha Kumari', phone: '0712345602', type: 'Discharge summary', details: 'Asked for a copy of the discharge summary from her observation ward stay last week.', status: 'Open' },
      { id: 'Q5002', time: stampAt(0, '10:40'), name: 'Priyanka Jayasuriya', phone: '0763456793', type: 'Admission', details: 'Asked if her father can stay in the observation ward after his ECG.', status: 'Resolved' }
    ];
  }

  function sampleMovements() {
    return [
      { time: stampAt(0, '08:20'), patientId: 'P1001', patientName: 'Kamal Senanayake', location: 'Laboratory', note: 'Fasting blood test' },
      { time: stampAt(0, '08:55'), patientId: 'P1001', patientName: 'Kamal Senanayake', location: 'Waiting Area', note: 'Waiting for results' },
      { time: stampAt(0, '09:50'), patientId: 'P1005', patientName: 'Mohamed Rizwan', location: 'Procedure Room', note: 'Knee dressing' },
      { time: stampAt(0, '10:05'), patientId: 'P1003', patientName: 'Saman Jayasuriya', location: 'Reception', note: 'Checked in' }
    ];
  }

  function loadList(key, makeSample) {
    var list = getData(key, null);
    if (!list) {
      list = makeSample();
      saveData(key, list);
    }
    return list;
  }

  /* ---------- 4. Staff login ---------- */

  function getSession() {
    try {
      return window.sessionStorage.getItem('lc_staff');
    } catch (e) {
      return memoryStore.lc_staff || null;
    }
  }

  function setSession(name) {
    memoryStore.lc_staff = name;
    try {
      if (name) { window.sessionStorage.setItem('lc_staff', name); } else { window.sessionStorage.removeItem('lc_staff'); }
    } catch (e) { /* ignore */ }
  }

  function isStaff() { return !!getSession(); }

  function applyLoginState() {
    var navLogin = document.getElementById('navLogin');
    if (isStaff()) {
      document.body.classList.add('logged-in');
      if (navLogin) { navLogin.textContent = 'Log Out'; }
    } else {
      document.body.classList.remove('logged-in');
      if (navLogin) { navLogin.textContent = 'Staff Login'; }
    }
    var nameEls = document.querySelectorAll('.staff-name');
    for (var i = 0; i < nameEls.length; i++) { nameEls[i].textContent = getSession() || ''; }
  }

  function logout() {
    setSession(null);
    window.location.href = 'login.html';
  }

  function initNavigation() {
    var btn = document.getElementById('menuBtn');
    var nav = document.getElementById('mainNav');
    if (btn && nav) {
      btn.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    var navLogin = document.getElementById('navLogin');
    if (navLogin) {
      navLogin.addEventListener('click', function (e) {
        if (isStaff()) { e.preventDefault(); logout(); }
      });
    }
    var year = document.getElementById('year');
    if (year) { year.textContent = new Date().getFullYear(); }
  }

  function initLogin() {
    var form = document.getElementById('loginForm');
    var attempts = 0;
    var lockedUntil = 0;

    document.getElementById('showPassword').addEventListener('change', function () {
      document.getElementById('password').type = this.checked ? 'text' : 'password';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (Date.now() < lockedUntil) {
        showMessage('loginMsg', 'Too many failed attempts. Please wait 30 seconds and try again.', 'error');
        return;
      }
      if (!checkRequired(form)) { focusFirstError(form); clearMessage('loginMsg'); return; }
      var username = document.getElementById('username').value.trim().toLowerCase();
      var password = document.getElementById('password').value;
      var account = null;
      for (var i = 0; i < STAFF_ACCOUNTS.length; i++) {
        if (STAFF_ACCOUNTS[i].username === username && STAFF_ACCOUNTS[i].password === password) { account = STAFF_ACCOUNTS[i]; }
      }
      if (account) {
        attempts = 0;
        setSession(account.name);
        form.reset();
        clearMessage('loginMsg');
        applyLoginState();
        showMessage('loggedInMsg', 'Login successful. Welcome, ' + account.name + '.', 'success');
      } else {
        attempts++;
        document.getElementById('password').value = '';
        if (attempts >= 3) {
          attempts = 0;
          lockedUntil = Date.now() + 30000;
          showMessage('loginMsg', 'Incorrect username or password. Login is locked for 30 seconds.', 'error');
        } else {
          showMessage('loginMsg', 'Incorrect username or password. Please try again.', 'error');
        }
      }
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);
  }

  /* ---------- 5. Patient management page ---------- */

  function initPatients() {
    var form = document.getElementById('patientForm');
    var patients = loadList('lc_patients', function () { return SAMPLE_PATIENTS; });
    var editingId = null;
    var submitBtn = document.getElementById('patientSubmit');
    var cancelBtn = document.getElementById('patientCancel');
    var search = document.getElementById('patientSearch');
    var tbody = document.querySelector('#patientTable tbody');
    var details = document.getElementById('patientDetails');

    document.getElementById('pDob').max = todayString(0);

    function fieldValue(id) { return document.getElementById(id).value.trim(); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = checkRequired(form);
      var phone = document.getElementById('pPhone');
      var email = document.getElementById('pEmail');
      var dob = document.getElementById('pDob');
      var ePhone = document.getElementById('pEmergencyPhone');

      if (phone.value.trim() && !PHONE_PATTERN.test(cleanPhone(phone.value))) {
        setError(phone, 'Enter a valid phone number with 10 digits, e.g. 0771234567.'); ok = false;
      }
      if (ePhone.value.trim() && !PHONE_PATTERN.test(cleanPhone(ePhone.value))) {
        setError(ePhone, 'Enter a valid phone number with 10 digits, e.g. 0771234567.'); ok = false;
      }
      if (email.value.trim() && !EMAIL_PATTERN.test(email.value.trim())) {
        setError(email, 'Enter a valid email address, e.g. name@example.com.'); ok = false;
      }
      if (dob.value && dob.value > todayString(0)) {
        setError(dob, 'Date of birth cannot be in the future.'); ok = false;
      }
      if (!ok) {
        showMessage('patientMsg', 'Please correct the highlighted fields and try again.', 'error');
        focusFirstError(form);
        return;
      }

      var data = {
        name: fieldValue('pName'), dob: dob.value, gender: fieldValue('pGender'),
        phone: cleanPhone(phone.value), email: email.value.trim(), address: fieldValue('pAddress'),
        blood: fieldValue('pBlood'), history: fieldValue('pHistory'), allergies: fieldValue('pAllergies'),
        emergencyName: fieldValue('pEmergencyName'), emergencyPhone: cleanPhone(ePhone.value)
      };

      if (editingId) {
        var patient = findById(patients, editingId);
        for (var key in data) { if (data.hasOwnProperty(key)) { patient[key] = data[key]; } }
        showMessage('patientMsg', 'Patient record ' + editingId + ' has been updated.', 'success');
        stopEditing();
      } else {
        data.id = nextId(patients, 'P', 1000);
        data.registered = todayString(0);
        patients.push(data);
        showMessage('patientMsg', 'Thank you, ' + data.name + '. Registration complete. Your patient ID is ' + data.id + '.', 'success');
      }
      saveData('lc_patients', patients);
      form.reset();
      renderPatients();
    });

    function stopEditing() {
      editingId = null;
      submitBtn.textContent = 'Register Patient';
      cancelBtn.hidden = true;
      document.getElementById('formTitle').textContent = 'New Patient Registration';
    }

    cancelBtn.addEventListener('click', function () {
      stopEditing();
      form.reset();
      clearErrors(form);
      clearMessage('patientMsg');
    });

    function renderPatients() {
      var term = search.value.trim().toLowerCase();
      var rows = '';
      var count = 0;
      for (var i = patients.length - 1; i >= 0; i--) {
        var p = patients[i];
        var text = (p.id + ' ' + p.name + ' ' + p.phone).toLowerCase();
        if (term && text.indexOf(term) === -1) { continue; }
        count++;
        rows += '<tr><td class="nowrap">' + escapeHTML(p.id) + '</td><td>' + escapeHTML(p.name) + '</td>' +
          '<td class="num">' + getAge(p.dob) + '</td><td>' + escapeHTML(p.gender) + '</td>' +
          '<td class="nowrap">' + escapeHTML(p.phone) + '</td><td>' + escapeHTML(p.blood || '-') + '</td>' +
          '<td>' + escapeHTML(p.history || '-') + '</td>' +
          '<td class="nowrap"><button type="button" class="btn btn-small" data-view="' + escapeHTML(p.id) + '">View</button> ' +
          '<button type="button" class="btn btn-small btn-secondary" data-edit="' + escapeHTML(p.id) + '">Edit</button></td></tr>';
      }
      if (!count) { rows = '<tr class="empty-row"><td colspan="8">No patients match your search.</td></tr>'; }
      tbody.innerHTML = rows;
      document.getElementById('patientCount').textContent = count + ' of ' + patients.length + ' patients shown';
    }

    function showDetails(p) {
      var rows = [
        ['Patient ID', p.id], ['Full name', p.name], ['Date of birth', formatDate(p.dob) + ' (age ' + getAge(p.dob) + ')'],
        ['Gender', p.gender], ['Phone', p.phone], ['Email', p.email || '-'], ['Address', p.address],
        ['Blood group', p.blood || '-'], ['Medical history', p.history || '-'], ['Allergies', p.allergies || '-'],
        ['Emergency contact', (p.emergencyName || '-') + (p.emergencyPhone ? ' (' + p.emergencyPhone + ')' : '')],
        ['Registered on', formatDate(p.registered)]
      ];
      var html = '<h3>Electronic Health Record: ' + escapeHTML(p.name) + '</h3><dl>';
      for (var i = 0; i < rows.length; i++) {
        html += '<dt>' + escapeHTML(rows[i][0]) + '</dt><dd>' + escapeHTML(rows[i][1]) + '</dd>';
      }
      html += '</dl><button type="button" class="btn btn-secondary" id="closeDetails">Close record</button>';
      details.innerHTML = html;
      details.hidden = false;
      document.getElementById('closeDetails').addEventListener('click', function () { details.hidden = true; });
      details.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function startEditing(p) {
      editingId = p.id;
      document.getElementById('pName').value = p.name;
      document.getElementById('pDob').value = p.dob;
      document.getElementById('pGender').value = p.gender;
      document.getElementById('pPhone').value = p.phone;
      document.getElementById('pEmail').value = p.email || '';
      document.getElementById('pAddress').value = p.address;
      document.getElementById('pBlood').value = p.blood || '';
      document.getElementById('pHistory').value = p.history || '';
      document.getElementById('pAllergies').value = p.allergies || '';
      document.getElementById('pEmergencyName').value = p.emergencyName || '';
      document.getElementById('pEmergencyPhone').value = p.emergencyPhone || '';
      submitBtn.textContent = 'Update Patient';
      cancelBtn.hidden = false;
      document.getElementById('formTitle').textContent = 'Edit Patient ' + p.id;
      clearErrors(form);
      clearMessage('patientMsg');
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('pName').focus({ preventScroll: true });
    }

    tbody.addEventListener('click', function (e) {
      var viewId = e.target.getAttribute('data-view');
      var editId = e.target.getAttribute('data-edit');
      if (viewId) { showDetails(findById(patients, viewId)); }
      if (editId) { startEditing(findById(patients, editId)); }
    });

    search.addEventListener('input', renderPatients);
    renderPatients();
  }

  /* ---------- 6. Staff and appointment scheduling page ---------- */

  function initAppointments() {
    var appointments = loadList('lc_appointments', sampleAppointments);
    var form = document.getElementById('appointmentForm');
    var doctorSelect = document.getElementById('aDoctor');
    var dateInput = document.getElementById('aDate');
    var timeSelect = document.getElementById('aTime');
    var roleFilter = document.getElementById('roleFilter');
    var apptDate = document.getElementById('apptFilterDate');
    var apptTable = document.querySelector('#appointmentTable tbody');

    function renderSchedule() {
      var rows = '';
      for (var i = 0; i < STAFF.length; i++) {
        var s = STAFF[i];
        if (roleFilter.value !== 'all' && s.role !== roleFilter.value) { continue; }
        rows += '<tr><td>' + escapeHTML(s.name) + '</td><td>' + escapeHTML(s.role) + '</td><td>' + escapeHTML(s.speciality) + '</td>' +
          '<td>' + escapeHTML(daysText(s.days)) + '</td><td class="nowrap">' + formatTime(s.start) + ' – ' + formatTime(s.end) + '</td>' +
          '<td>' + escapeHTML(s.room) + '</td></tr>';
      }
      document.querySelector('#scheduleTable tbody').innerHTML = rows;
    }

    var doctors = [];
    for (var i = 0; i < STAFF.length; i++) {
      if (STAFF[i].role === 'Doctor') { doctors.push({ value: STAFF[i].id, text: STAFF[i].name + ' (' + STAFF[i].speciality + ')' }); }
    }
    doctorSelect.innerHTML = optionList(doctors, 'Select a doctor');
    dateInput.min = todayString(0);
    dateInput.max = todayString(60);

    function isTaken(doctorId, date, time) {
      for (var i = 0; i < appointments.length; i++) {
        var a = appointments[i];
        if (a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'Cancelled') { return true; }
      }
      return false;
    }

    function updateTimes() {
      var doc = findById(STAFF, doctorSelect.value);
      var info = document.getElementById('doctorDays');
      info.textContent = doc ? doc.name + ' is available ' + daysText(doc.days) + ', ' + formatTime(doc.start) + ' – ' + formatTime(doc.end) + ' in ' + doc.room + '.' : '';
      if (!doc || !dateInput.value) {
        timeSelect.innerHTML = '<option value="">Select a doctor and date first</option>';
        return;
      }
      if (doc.days.indexOf(dayOfWeek(dateInput.value)) === -1) {
        timeSelect.innerHTML = '<option value="">Doctor not available on this day</option>';
        setError(dateInput, doc.name + ' does not work on ' + DAY_FULL[dayOfWeek(dateInput.value)] + 's. Please choose another date.');
        return;
      }
      setError(dateInput, '');
      var html = '';
      var free = 0;
      for (var m = toMinutes(doc.start); m < toMinutes(doc.end); m += 30) {
        var t = fromMinutes(m);
        var taken = isTaken(doc.id, dateInput.value, t);
        var passed = dateInput.value === todayString(0) && m <= nowMinutes();
        if (taken || passed) {
          html += '<option value="' + t + '" disabled>' + formatTime(t) + (taken ? ' (booked)' : ' (time passed)') + '</option>';
        } else {
          html += '<option value="' + t + '">' + formatTime(t) + '</option>';
          free++;
        }
      }
      timeSelect.innerHTML = (free ? '<option value="">Select a time (' + free + ' free)</option>' : '<option value="">No free times on this day</option>') + html;
    }

    doctorSelect.addEventListener('change', updateTimes);
    dateInput.addEventListener('change', updateTimes);
    roleFilter.addEventListener('change', renderSchedule);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = checkRequired(form);
      var phone = document.getElementById('aPhone');
      var doc = findById(STAFF, doctorSelect.value);
      if (phone.value.trim() && !PHONE_PATTERN.test(cleanPhone(phone.value))) {
        setError(phone, 'Enter a valid phone number with 10 digits, e.g. 0771234567.'); ok = false;
      }
      if (dateInput.value && (dateInput.value < todayString(0) || dateInput.value > todayString(60))) {
        setError(dateInput, 'Choose a date between today and the next 60 days.'); ok = false;
      } else if (doc && dateInput.value && doc.days.indexOf(dayOfWeek(dateInput.value)) === -1) {
        setError(dateInput, doc.name + ' does not work on ' + DAY_FULL[dayOfWeek(dateInput.value)] + 's. Please choose another date.'); ok = false;
      }
      if (doc && dateInput.value && timeSelect.value && isTaken(doc.id, dateInput.value, timeSelect.value)) {
        setError(timeSelect, 'Sorry, this time has just been booked. Please choose another time.'); ok = false;
      }
      if (!ok) {
        showMessage('appointmentMsg', 'Please correct the highlighted fields and try again.', 'error');
        focusFirstError(form);
        return;
      }
      var appt = {
        id: nextId(appointments, 'A', 2000), patient: document.getElementById('aPatient').value.trim(),
        phone: cleanPhone(phone.value), doctorId: doc.id, date: dateInput.value, time: timeSelect.value,
        reason: document.getElementById('aReason').value.trim(), status: 'Booked'
      };
      appointments.push(appt);
      saveData('lc_appointments', appointments);
      showMessage('appointmentMsg', 'Appointment booked. Reference ' + appt.id + ': ' + doc.name + ' on ' + formatDate(appt.date) +
        ' at ' + formatTime(appt.time) + '. Please arrive 15 minutes early.', 'success');
      form.reset();
      updateTimes();
      renderAppointments();
    });

    function statusBadge(status) {
      if (status === 'Booked') { return badge(status, 'blue'); }
      if (status === 'Completed') { return badge(status, 'green'); }
      return badge(status, 'grey');
    }

    function renderAppointments() {
      var list = appointments.slice().sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });
      var rows = '';
      var count = 0;
      for (var i = 0; i < list.length; i++) {
        var a = list[i];
        if (apptDate.value && a.date !== apptDate.value) { continue; }
        var doc = findById(STAFF, a.doctorId);
        count++;
        rows += '<tr><td class="nowrap">' + escapeHTML(a.id) + '</td><td class="nowrap">' + formatDate(a.date) + '</td><td class="nowrap">' + formatTime(a.time) + '</td>' +
          '<td>' + escapeHTML(a.patient) + '</td><td class="nowrap">' + escapeHTML(a.phone) + '</td><td>' + escapeHTML(doc ? doc.name : '') + '</td>' +
          '<td>' + escapeHTML(a.reason || '-') + '</td><td>' + statusBadge(a.status) + '</td><td class="nowrap">' +
          (a.status === 'Booked' ? '<button type="button" class="btn btn-small" data-complete="' + escapeHTML(a.id) + '">Complete</button> ' +
            '<button type="button" class="btn btn-small btn-danger" data-cancel="' + escapeHTML(a.id) + '">Cancel</button>' : '-') + '</td></tr>';
      }
      if (!count) { rows = '<tr class="empty-row"><td colspan="9">No appointments found for this date.</td></tr>'; }
      apptTable.innerHTML = rows;
    }

    apptTable.addEventListener('click', function (e) {
      var id = e.target.getAttribute('data-complete') || e.target.getAttribute('data-cancel');
      if (!id) { return; }
      var appt = findById(appointments, id);
      appt.status = e.target.getAttribute('data-complete') ? 'Completed' : 'Cancelled';
      saveData('lc_appointments', appointments);
      renderAppointments();
      updateTimes();
    });

    apptDate.addEventListener('change', renderAppointments);
    document.getElementById('apptShowAll').addEventListener('click', function () { apptDate.value = ''; renderAppointments(); });

    renderSchedule();
    renderAppointments();
  }

  /* ---------- 7. Room and facility management page ---------- */

  function initRooms() {
    var bookings = loadList('lc_rooms', sampleRoomBookings);
    var checkDate = document.getElementById('checkDate');
    var checkTime = document.getElementById('checkTime');
    var checkType = document.getElementById('checkType');
    var form = document.getElementById('roomForm');
    var tbody = document.querySelector('#roomBookingTable tbody');

    var slots = timeOptions('07:00', '20:30');
    checkTime.innerHTML = optionList(slots, '');
    document.getElementById('rTime').innerHTML = optionList(slots, 'Select a start time');

    var roomItems = [];
    for (var i = 0; i < ROOMS.length; i++) { roomItems.push({ value: ROOMS[i].id, text: ROOMS[i].name }); }
    document.getElementById('rRoom').innerHTML = optionList(roomItems, 'Select a room');

    var doctorItems = [];
    for (var j = 0; j < STAFF.length; j++) {
      if (STAFF[j].role === 'Doctor') { doctorItems.push({ value: STAFF[j].id, text: STAFF[j].name }); }
    }
    document.getElementById('rDoctor').innerHTML = optionList(doctorItems, 'No doctor needed');

    checkDate.value = todayString(0);
    document.getElementById('rDate').min = todayString(0);
    var rounded = Math.floor(nowMinutes() / 30) * 30;
    checkTime.value = (rounded >= toMinutes('07:00') && rounded <= toMinutes('20:30')) ? fromMinutes(rounded) : '09:00';

    // Finds a booking for a room that covers the given date and time
    function bookingAt(roomId, date, time) {
      var t = toMinutes(time);
      for (var i = 0; i < bookings.length; i++) {
        var b = bookings[i];
        var start = toMinutes(b.time);
        if (b.roomId === roomId && b.date === date && b.status !== 'Cancelled' && t >= start && t < start + b.duration) { return b; }
      }
      return null;
    }

    function overlaps(roomId, date, time, duration) {
      var start = toMinutes(time);
      var end = start + duration;
      for (var i = 0; i < bookings.length; i++) {
        var b = bookings[i];
        var bStart = toMinutes(b.time);
        if (b.roomId === roomId && b.date === date && b.status !== 'Cancelled' && start < bStart + b.duration && end > bStart) { return b; }
      }
      return null;
    }

    function renderRooms() {
      var html = '';
      var free = 0;
      var shown = 0;
      for (var i = 0; i < ROOMS.length; i++) {
        var r = ROOMS[i];
        if (checkType.value !== 'all' && r.type !== checkType.value) { continue; }
        shown++;
        var b = bookingAt(r.id, checkDate.value, checkTime.value);
        if (!b) { free++; }
        html += '<div class="room-card' + (b ? ' booked' : '') + '"><h3>' + escapeHTML(r.name) + '</h3>' +
          '<p class="room-meta">' + escapeHTML(r.type) + ' · ' + escapeHTML(r.floor) + '<br>' + escapeHTML(r.info) + '</p>' +
          '<p class="room-status">' + (b ? badge('Booked', 'red') + ' until ' + formatTime(fromMinutes(toMinutes(b.time) + b.duration)) + ' (' + escapeHTML(b.purpose) + ')' : badge('Available', 'green')) + '</p></div>';
      }
      document.getElementById('roomGrid').innerHTML = html;
      document.getElementById('roomCheckInfo').textContent = free + ' of ' + shown + ' rooms are available on ' + formatDate(checkDate.value) + ' at ' + formatTime(checkTime.value) + '.';
    }

    document.getElementById('roomCheckForm').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!checkDate.value) { checkDate.value = todayString(0); }
      renderRooms();
    });
    checkDate.addEventListener('change', renderRooms);
    checkTime.addEventListener('change', renderRooms);
    checkType.addEventListener('change', renderRooms);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = checkRequired(form);
      var date = document.getElementById('rDate');
      var time = document.getElementById('rTime');
      var room = document.getElementById('rRoom').value;
      var duration = parseInt(document.getElementById('rDuration').value, 10);
      if (date.value && date.value < todayString(0)) { setError(date, 'The date cannot be in the past.'); ok = false; }
      if (time.value && duration && toMinutes(time.value) + duration > toMinutes('21:00')) {
        setError(time, 'The booking must finish by 9:00 PM when the clinic closes.'); ok = false;
      }
      if (ok) {
        var clash = overlaps(room, date.value, time.value, duration);
        if (clash) {
          setError(time, 'This room is already booked from ' + formatTime(clash.time) + ' to ' +
            formatTime(fromMinutes(toMinutes(clash.time) + clash.duration)) + ' (' + clash.id + '). Choose another time or room.');
          ok = false;
        }
      }
      if (!ok) {
        showMessage('roomMsg', 'Please correct the highlighted fields and try again.', 'error');
        focusFirstError(form);
        return;
      }
      var booking = {
        id: nextId(bookings, 'R', 3000), roomId: room, date: date.value, time: time.value, duration: duration,
        purpose: document.getElementById('rPurpose').value, patient: document.getElementById('rPatient').value.trim(),
        doctorId: document.getElementById('rDoctor').value, status: 'Booked'
      };
      bookings.push(booking);
      saveData('lc_rooms', bookings);
      showMessage('roomMsg', 'Room booked. Reference ' + booking.id + ': ' + findById(ROOMS, room).name + ' on ' + formatDate(booking.date) + ', ' +
        formatTime(booking.time) + ' – ' + formatTime(fromMinutes(toMinutes(booking.time) + duration)) + '.', 'success');
      form.reset();
      renderRooms();
      renderBookings();
    });

    function renderBookings() {
      var list = bookings.slice().sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });
      var rows = '';
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        var doc = findById(STAFF, b.doctorId);
        rows += '<tr><td class="nowrap">' + escapeHTML(b.id) + '</td><td>' + escapeHTML(findById(ROOMS, b.roomId).name) + '</td>' +
          '<td class="nowrap">' + formatDate(b.date) + '</td><td class="nowrap">' + formatTime(b.time) + ' – ' + formatTime(fromMinutes(toMinutes(b.time) + b.duration)) + '</td>' +
          '<td>' + escapeHTML(b.purpose) + '</td><td>' + escapeHTML(b.patient) + '</td><td>' + escapeHTML(doc ? doc.name : '-') + '</td>' +
          '<td>' + (b.status === 'Booked' ? badge('Booked', 'blue') : badge(b.status, 'grey')) + '</td>' +
          '<td>' + (b.status === 'Booked' ? '<button type="button" class="btn btn-small btn-danger" data-cancel="' + escapeHTML(b.id) + '">Cancel</button>' : '-') + '</td></tr>';
      }
      if (!rows) { rows = '<tr class="empty-row"><td colspan="9">No room bookings yet.</td></tr>'; }
      tbody.innerHTML = rows;
    }

    tbody.addEventListener('click', function (e) {
      var id = e.target.getAttribute('data-cancel');
      if (!id) { return; }
      findById(bookings, id).status = 'Cancelled';
      saveData('lc_rooms', bookings);
      renderBookings();
      renderRooms();
    });

    renderRooms();
    renderBookings();
  }

  /* ---------- 8. Invoicing and billing page ---------- */

  function initBilling() {
    var invoices = loadList('lc_invoices', sampleInvoices);
    var patients = loadList('lc_patients', function () { return SAMPLE_PATIENTS; });
    var form = document.getElementById('invoiceForm');
    var payForm = document.getElementById('paymentForm');
    var serviceList = document.getElementById('serviceList');
    var paidInput = document.getElementById('iPaid');
    var tbody = document.querySelector('#invoiceTable tbody');
    var view = document.getElementById('invoiceView');
    var filter = document.getElementById('invoiceFilter');

    var patientItems = [];
    for (var i = 0; i < patients.length; i++) { patientItems.push({ value: patients[i].id, text: patients[i].id + ' – ' + patients[i].name }); }
    document.getElementById('iPatient').innerHTML = optionList(patientItems, 'Select a patient');
    document.getElementById('iDate').value = todayString(0);

    var listHtml = '';
    for (var s = 0; s < SERVICES.length; s++) {
      listHtml += '<li><label><input type="checkbox" name="service" value="' + SERVICES[s].code + '"> ' + escapeHTML(SERVICES[s].name) + '</label>' +
        '<span class="price">' + money(SERVICES[s].price) + '</span></li>';
    }
    serviceList.innerHTML = listHtml;

    function statusOf(inv) {
      if (inv.paid >= inv.total) { return 'Paid'; }
      if (inv.paid > 0) { return 'Partially paid'; }
      return 'Unpaid';
    }

    function statusBadge(inv) {
      var st = statusOf(inv);
      return badge(st, st === 'Paid' ? 'green' : (st === 'Unpaid' ? 'red' : 'amber'));
    }

    function selectedServices() {
      var boxes = serviceList.querySelectorAll('input:checked');
      var items = [];
      for (var i = 0; i < boxes.length; i++) {
        var svc = null;
        for (var j = 0; j < SERVICES.length; j++) { if (SERVICES[j].code === boxes[i].value) { svc = SERVICES[j]; } }
        items.push({ name: svc.name, price: svc.price });
      }
      return items;
    }

    function updateTotal() {
      var items = selectedServices();
      var total = 0;
      for (var i = 0; i < items.length; i++) { total += items[i].price; }
      var paid = parseFloat(paidInput.value) || 0;
      document.getElementById('iTotal').textContent = money(total);
      document.getElementById('iBalance').textContent = money(Math.max(total - paid, 0));
      return total;
    }

    serviceList.addEventListener('change', function () {
      updateTotal();
      document.getElementById('serviceError').textContent = '';
    });
    paidInput.addEventListener('input', updateTotal);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = checkRequired(form);
      var items = selectedServices();
      var total = updateTotal();
      var paid = paidInput.value.trim() === '' ? 0 : parseFloat(paidInput.value);
      if (!items.length) {
        document.getElementById('serviceError').textContent = 'Select at least one service.';
        ok = false;
      }
      if (isNaN(paid) || paid < 0) {
        setError(paidInput, 'Enter an amount of 0 or more.'); ok = false;
      } else if (paid > total) {
        setError(paidInput, 'The amount paid cannot be more than the total (' + money(total) + ').'); ok = false;
      }
      if (!ok) {
        showMessage('invoiceMsg', 'Please correct the highlighted fields and try again.', 'error');
        focusFirstError(form);
        return;
      }
      var patient = findById(patients, document.getElementById('iPatient').value);
      var inv = {
        id: nextId(invoices, 'INV-', 4000), date: document.getElementById('iDate').value,
        patientId: patient.id, patientName: patient.name, items: items, total: total, paid: paid,
        payments: paid > 0 ? [{ date: todayString(0), amount: paid, method: document.getElementById('iMethod').value }] : []
      };
      invoices.push(inv);
      saveData('lc_invoices', invoices);
      showMessage('invoiceMsg', 'Invoice ' + inv.id + ' created for ' + inv.patientName + '. Total ' + money(total) + ', balance ' + money(total - paid) + '.', 'success');
      form.reset();
      document.getElementById('iDate').value = todayString(0);
      updateTotal();
      refresh();
      showInvoice(inv);
    });

    payForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = checkRequired(payForm);
      var inv = findById(invoices, document.getElementById('payInvoice').value);
      var amountInput = document.getElementById('payAmount');
      var amount = parseFloat(amountInput.value);
      if (amountInput.value.trim() && (isNaN(amount) || amount <= 0)) {
        setError(amountInput, 'Enter an amount greater than 0.'); ok = false;
      } else if (inv && amount > inv.total - inv.paid) {
        setError(amountInput, 'The amount cannot be more than the balance (' + money(inv.total - inv.paid) + ').'); ok = false;
      }
      if (!ok) {
        showMessage('paymentMsg', 'Please correct the highlighted fields and try again.', 'error');
        focusFirstError(payForm);
        return;
      }
      inv.paid += amount;
      inv.payments.push({ date: todayString(0), amount: amount, method: document.getElementById('payMethod').value });
      saveData('lc_invoices', invoices);
      showMessage('paymentMsg', 'Payment of ' + money(amount) + ' recorded for ' + inv.id + '. New balance: ' + money(inv.total - inv.paid) + '.', 'success');
      payForm.reset();
      refresh();
      if (!view.hidden) { showInvoice(inv); }
    });

    function fillPaymentSelect() {
      var items = [];
      for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].paid < invoices[i].total) {
          items.push({ value: invoices[i].id, text: invoices[i].id + ' – ' + invoices[i].patientName + ' (balance ' + money(invoices[i].total - invoices[i].paid) + ')' });
        }
      }
      document.getElementById('payInvoice').innerHTML = optionList(items, items.length ? 'Select an invoice' : 'No unpaid invoices');
    }

    function renderSummary() {
      var billed = 0, received = 0, unpaid = 0;
      for (var i = 0; i < invoices.length; i++) {
        billed += invoices[i].total;
        received += invoices[i].paid;
        if (invoices[i].paid < invoices[i].total) { unpaid++; }
      }
      document.getElementById('sumBilled').textContent = money(billed);
      document.getElementById('sumReceived').textContent = money(received);
      document.getElementById('sumOutstanding').textContent = money(billed - received);
      document.getElementById('sumUnpaid').textContent = unpaid;
    }

    function renderInvoices() {
      var rows = '';
      for (var i = invoices.length - 1; i >= 0; i--) {
        var inv = invoices[i];
        if (filter.value !== 'all' && statusOf(inv) !== filter.value) { continue; }
        rows += '<tr><td class="nowrap">' + escapeHTML(inv.id) + '</td><td class="nowrap">' + formatDate(inv.date) + '</td><td>' + escapeHTML(inv.patientName) + '</td>' +
          '<td class="num">' + money(inv.total) + '</td><td class="num">' + money(inv.paid) + '</td><td class="num">' + money(inv.total - inv.paid) + '</td>' +
          '<td>' + statusBadge(inv) + '</td><td><button type="button" class="btn btn-small" data-view="' + escapeHTML(inv.id) + '">View</button></td></tr>';
      }
      if (!rows) { rows = '<tr class="empty-row"><td colspan="8">No invoices with this status.</td></tr>'; }
      tbody.innerHTML = rows;
    }

    function showInvoice(inv) {
      var rows = '';
      for (var i = 0; i < inv.items.length; i++) {
        rows += '<tr><td>' + escapeHTML(inv.items[i].name) + '</td><td class="num">' + money(inv.items[i].price) + '</td></tr>';
      }
      var pays = '';
      for (var j = 0; j < inv.payments.length; j++) {
        pays += '<li>' + formatDate(inv.payments[j].date) + ': ' + money(inv.payments[j].amount) + ' by ' + escapeHTML(inv.payments[j].method) + '</li>';
      }
      view.innerHTML = '<div class="invoice-head"><div><h2>LifeCare Wellness Clinic</h2><p>No. 45, Duplication Road, Colombo 04</p><p>+94 11 245 6789</p></div>' +
        '<div><h2>Invoice ' + escapeHTML(inv.id) + '</h2><p>Date: ' + formatDate(inv.date) + '</p><p>Status: ' + statusBadge(inv) + '</p></div></div>' +
        '<p><strong>Bill to:</strong> ' + escapeHTML(inv.patientName) + ' (' + escapeHTML(inv.patientId) + ')</p>' +
        '<div class="table-wrap"><table class="data-table"><thead><tr><th>Service</th><th class="num">Amount</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<div class="total-box"><span>Total: ' + money(inv.total) + '</span><span>Paid: ' + money(inv.paid) + '</span><span>Balance due: ' + money(inv.total - inv.paid) + '</span></div>' +
        '<h3>Payments</h3>' + (pays ? '<ul>' + pays + '</ul>' : '<p>No payments recorded yet.</p>') +
        '<button type="button" class="btn btn-secondary" id="closeInvoice">Close invoice</button>';
      view.hidden = false;
      document.getElementById('closeInvoice').addEventListener('click', function () { view.hidden = true; });
      view.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    tbody.addEventListener('click', function (e) {
      var id = e.target.getAttribute('data-view');
      if (id) { showInvoice(findById(invoices, id)); }
    });
    filter.addEventListener('change', renderInvoices);

    function refresh() {
      fillPaymentSelect();
      renderSummary();
      renderInvoices();
    }

    updateTotal();
    refresh();
  }

  /* ---------- 9. Reception management page ---------- */

  function initReception() {
    var inquiries = loadList('lc_inquiries', sampleInquiries);
    var movements = loadList('lc_movements', sampleMovements);
    var patients = loadList('lc_patients', function () { return SAMPLE_PATIENTS; });
    var inquiryForm = document.getElementById('inquiryForm');
    var moveForm = document.getElementById('moveForm');
    var inquiryBody = document.querySelector('#inquiryTable tbody');

    var patientItems = [];
    for (var i = 0; i < patients.length; i++) { patientItems.push({ value: patients[i].id, text: patients[i].id + ' – ' + patients[i].name }); }
    document.getElementById('mPatient').innerHTML = optionList(patientItems, 'Select a patient');
    var locItems = [];
    for (var j = 0; j < LOCATIONS.length; j++) { locItems.push({ value: LOCATIONS[j], text: LOCATIONS[j] }); }
    document.getElementById('mLocation').innerHTML = optionList(locItems, 'Select a location');

    inquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = checkRequired(inquiryForm);
      var phone = document.getElementById('qPhone');
      if (phone.value.trim() && !PHONE_PATTERN.test(cleanPhone(phone.value))) {
        setError(phone, 'Enter a valid phone number with 10 digits, e.g. 0771234567.'); ok = false;
      }
      if (!ok) {
        showMessage('inquiryMsg', 'Please correct the highlighted fields and try again.', 'error');
        focusFirstError(inquiryForm);
        return;
      }
      var q = {
        id: nextId(inquiries, 'Q', 5000), time: nowStamp(), name: document.getElementById('qName').value.trim(),
        phone: cleanPhone(phone.value), type: document.getElementById('qType').value,
        details: document.getElementById('qDetails').value.trim(), status: 'Open'
      };
      inquiries.push(q);
      saveData('lc_inquiries', inquiries);
      showMessage('inquiryMsg', 'Inquiry ' + q.id + ' logged for ' + q.name + '.', 'success');
      inquiryForm.reset();
      renderInquiries();
      renderSummary();
    });

    moveForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!checkRequired(moveForm)) {
        showMessage('moveMsg', 'Please correct the highlighted fields and try again.', 'error');
        focusFirstError(moveForm);
        return;
      }
      var patient = findById(patients, document.getElementById('mPatient').value);
      var location = document.getElementById('mLocation').value;
      movements.push({ time: nowStamp(), patientId: patient.id, patientName: patient.name, location: location, note: document.getElementById('mNote').value.trim() });
      saveData('lc_movements', movements);
      showMessage('moveMsg', patient.name + ' is now recorded at: ' + location + '.', 'success');
      moveForm.reset();
      renderMovements();
      renderSummary();
    });

    function renderInquiries() {
      var rows = '';
      for (var i = inquiries.length - 1; i >= 0; i--) {
        var q = inquiries[i];
        rows += '<tr><td class="nowrap">' + escapeHTML(q.id) + '</td><td class="nowrap">' + formatStamp(q.time) + '</td><td>' + escapeHTML(q.name) +
          (q.phone ? '<br><span class="muted">' + escapeHTML(q.phone) + '</span>' : '') + '</td><td>' + escapeHTML(q.type) + '</td>' +
          '<td>' + escapeHTML(q.details) + '</td><td>' + (q.status === 'Open' ? badge('Open', 'amber') : badge('Resolved', 'green')) + '</td>' +
          '<td>' + (q.status === 'Open' ? '<button type="button" class="btn btn-small" data-resolve="' + escapeHTML(q.id) + '">Mark resolved</button>' : '-') + '</td></tr>';
      }
      if (!rows) { rows = '<tr class="empty-row"><td colspan="7">No inquiries logged yet.</td></tr>'; }
      inquiryBody.innerHTML = rows;
    }

    inquiryBody.addEventListener('click', function (e) {
      var id = e.target.getAttribute('data-resolve');
      if (!id) { return; }
      findById(inquiries, id).status = 'Resolved';
      saveData('lc_inquiries', inquiries);
      renderInquiries();
      renderSummary();
    });

    // Latest location for each patient
    function currentLocations() {
      var latest = {};
      var order = [];
      for (var i = 0; i < movements.length; i++) {
        if (!latest[movements[i].patientId]) { order.push(movements[i].patientId); }
        latest[movements[i].patientId] = movements[i];
      }
      var list = [];
      for (var j = 0; j < order.length; j++) { list.push(latest[order[j]]); }
      return list.sort(function (a, b) { return a.time < b.time ? 1 : -1; });
    }

    function inClinic(location) { return location !== 'Discharged' && location !== 'Transferred to hospital'; }

    function renderMovements() {
      var current = currentLocations();
      var rows = '';
      for (var i = 0; i < current.length; i++) {
        var m = current[i];
        rows += '<tr><td class="nowrap">' + escapeHTML(m.patientId) + '</td><td>' + escapeHTML(m.patientName) + '</td><td>' + escapeHTML(m.location) + '</td>' +
          '<td>' + (inClinic(m.location) ? badge('In clinic', 'blue') : badge('Left clinic', 'grey')) + '</td>' +
          '<td class="nowrap">' + formatStamp(m.time) + '</td><td>' + escapeHTML(m.note || '-') + '</td></tr>';
      }
      if (!rows) { rows = '<tr class="empty-row"><td colspan="6">No patient movements recorded yet.</td></tr>'; }
      document.querySelector('#locationTable tbody').innerHTML = rows;

      var history = '';
      for (var j = movements.length - 1; j >= 0 && j >= movements.length - 10; j--) {
        var h = movements[j];
        history += '<tr><td class="nowrap">' + formatStamp(h.time) + '</td><td>' + escapeHTML(h.patientName) + '</td><td>' + escapeHTML(h.location) + '</td><td>' + escapeHTML(h.note || '-') + '</td></tr>';
      }
      if (!history) { history = '<tr class="empty-row"><td colspan="4">No movements yet.</td></tr>'; }
      document.querySelector('#historyTable tbody').innerHTML = history;
    }

    function renderSummary() {
      var current = currentLocations();
      var inside = 0;
      for (var i = 0; i < current.length; i++) { if (inClinic(current[i].location)) { inside++; } }
      var open = 0;
      for (var j = 0; j < inquiries.length; j++) { if (inquiries[j].status === 'Open') { open++; } }
      var today = 0;
      for (var k = 0; k < movements.length; k++) { if (movements[k].time.indexOf(todayString(0)) === 0) { today++; } }
      document.getElementById('sumInClinic').textContent = inside;
      document.getElementById('sumOpen').textContent = open;
      document.getElementById('sumMoves').textContent = today;
    }

    renderInquiries();
    renderMovements();
    renderSummary();
  }

  /* ---------- 10. Contact page ---------- */

  function initContact() {
    var form = document.getElementById('contactForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = checkRequired(form);
      var email = document.getElementById('cEmail');
      var phone = document.getElementById('cPhone');
      var message = document.getElementById('cMessage');
      if (email.value.trim() && !EMAIL_PATTERN.test(email.value.trim())) {
        setError(email, 'Enter a valid email address, e.g. name@example.com.'); ok = false;
      }
      if (phone.value.trim() && !PHONE_PATTERN.test(cleanPhone(phone.value))) {
        setError(phone, 'Enter a valid phone number with 10 digits, e.g. 0771234567.'); ok = false;
      }
      if (message.value.trim() && message.value.trim().length < 10) {
        setError(message, 'Please write at least 10 characters.'); ok = false;
      }
      if (!ok) {
        showMessage('contactMsg', 'Please correct the highlighted fields and try again.', 'error');
        focusFirstError(form);
        return;
      }
      var messages = getData('lc_messages', []);
      messages.push({ time: nowStamp(), name: document.getElementById('cName').value.trim(), email: email.value.trim(),
        phone: cleanPhone(phone.value), subject: document.getElementById('cSubject').value, message: message.value.trim() });
      saveData('lc_messages', messages);
      showMessage('contactMsg', 'Thank you, ' + document.getElementById('cName').value.trim() + '. Your message has been saved for the reception team.', 'success');
      form.reset();
    });
  }

  /* ---------- 11. Labels for table cells (used by the phone layout) ---------- */

  // Copies each column heading into data-label so phones can show "Heading: value"
  function labelTableCells() {
    var tables = document.querySelectorAll('table.data-table');
    for (var i = 0; i < tables.length; i++) {
      var headers = tables[i].querySelectorAll('thead th');
      var rows = tables[i].querySelectorAll('tbody tr');
      for (var r = 0; r < rows.length; r++) {
        var cells = rows[r].children;
        for (var c = 0; c < cells.length; c++) {
          if (headers[c] && !cells[c].hasAttribute('data-label')) { cells[c].setAttribute('data-label', headers[c].textContent); }
        }
      }
    }
  }

  /* ---------- 12. Start the right code for each page ---------- */

  applyLoginState();
  initNavigation();
  if (document.getElementById('loginForm')) { initLogin(); }
  if (document.getElementById('patientForm')) { initPatients(); }
  if (document.getElementById('appointmentForm')) { initAppointments(); }
  if (document.getElementById('roomForm')) { initRooms(); }
  if (document.getElementById('invoiceForm')) { initBilling(); }
  if (document.getElementById('inquiryForm')) { initReception(); }
  if (document.getElementById('contactForm')) { initContact(); }
  labelTableCells();
  var tableWatcher = new MutationObserver(labelTableCells);
  tableWatcher.observe(document.body, { childList: true, subtree: true });
})();
