(function () {
'use strict';
if (window.studySprintStorageFrame) return;

// All data remains in the current browser. No API keys or external services.
const SUBJECTS = ['Computer Science', 'Business Management', 'Physics', 'English Literature', 'Calculus', 'Psychology', 'Other'];
const SUBJECT_COLORS = {
  'Computer Science': ['#8c70ca', '#f0eaff'], 'Business Management': ['#b18acc', '#f5ebfc'],
  Physics: ['#c49b50', '#fff7e6'], 'English Literature': ['#729bc2', '#edf5ff'],
  Calculus: ['#65a58b', '#eaf8f1'], Psychology: ['#bf87a3', '#fceef5'], Other: ['#9590b2', '#f0eef7']
};
const ICONS = {
  graduation: '<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v6c4 3 8 3 12 0v-6M3 10v7"/><path d="M2 18h2"/>',
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h6M9 18h3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h2M12 14h2M7 17h2"/>',
  chart: '<path d="M4 20V12h3v8M10.5 20V7h3v13M17 20V3h3v17M3 21h18"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  'chevron-down': '<path d="m7 10 5 5 5-5"/>', 'chevron-left': '<path d="m14 6-6 6 6 6"/>', 'chevron-right': '<path d="m10 6 6 6-6 6"/>',
  home: '<path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"/>', search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="m6 6 12 12M6 18 18 6"/>',
  arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>', sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4M18 4h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', check: '<path d="m5 12 4 4L19 6"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>', trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0V3ZM8 5H4v3a4 4 0 0 0 4 4M16 5h4v3a4 4 0 0 1-4 4M12 13v5M8 21h8M10 18h4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  play: '<path d="m9 5 10 7-10 7V5Z"/>', pause: '<path d="M8 5v14M16 5v14"/>', reset: '<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>',
  leaf: '<path d="M20 3c-9 0-16 2-16 9a7 7 0 0 0 7 7c7 0 9-7 9-16ZM4 21l10-10"/>',
  edit: '<path d="m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5"/>', trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  book: '<path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2v16"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  trend: '<path d="m3 17 6-6 4 4 8-10M15 5h6v6"/>', flame: '<path d="M12 2s2 5-1 8c-2-1-3-3-3-3s-5 5-4 10c1 7 15 7 16-1 1-5-3-8-3-8s1 5-2 6c2-7-3-12-3-12Z"/>',
  filter: '<path d="M4 5h16l-6 7v7l-4 2v-9L4 5Z"/>', inbox: '<path d="M3 14 6 4h12l3 10v6H3v-6ZM3 14h5l2 3h4l2-3h5"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};
const $ = (selector, root = document) => root.querySelector(selector);
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.book}</svg>`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const todayKey = () => dateKey(new Date());
const parseDate = value => new Date(`${value}T12:00:00`);
const shiftDate = (value, days) => { const date = typeof value === 'string' ? parseDate(value) : new Date(value); date.setDate(date.getDate() + days); return date; };
const relativeKey = days => dateKey(shiftDate(new Date(), days));
const shortDate = value => parseDate(value).toLocaleDateString('en-US', {month:'short', day:'numeric'});
const longDate = value => parseDate(value).toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'});
const weekStart = value => { const date = typeof value === 'string' ? parseDate(value) : new Date(value); date.setHours(12,0,0,0); date.setDate(date.getDate() - (date.getDay() + 6) % 7); return date; };
const colorStyle = subject => { const colors = SUBJECT_COLORS[subject] || SUBJECT_COLORS.Other; return `--subject-color:${colors[0]};--subject-bg:${colors[1]}`; };
const isDateKey = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(parseDate(value).getTime()) && dateKey(parseDate(value)) === value;

function seedState() {
  const assignment = (title, subject, offset, priority, status, notes = '') => ({id:uid(),title,subject,dueDate:relativeKey(offset),priority,status,notes,createdAt:new Date().toISOString(),completedAt:status === 'Completed' ? relativeKey(offset) : null});
  return {version:1,profile:{name:'Sarah Chen',course:'Computer Science',goal:4},assignments:[
    assignment('Data Structures Assignment','Computer Science',2,'High','In Progress','Implement and compare sorting algorithms. Include a short analysis of time complexity.'),
    assignment('Marketing Case Study','Business Management',4,'High','Not Started','Choose a brand and evaluate its latest marketing strategy.'),
    assignment('Lab Report #4','Physics',5,'Medium','In Progress','Summarize the experiment, observations, and sources of error.'),
    assignment('Final Essay Draft','English Literature',7,'Medium','Not Started','Prepare an outline and a first draft with references.'),
    assignment('Calculus Problem Set','Calculus',9,'Low','Not Started','Practice integration problems from chapter 7.'),
    assignment('Psychology Presentation','Psychology',11,'Medium','Not Started','Prepare slides on memory and learning.'),
    assignment('Introduction to Algorithms Quiz','Computer Science',-1,'Medium','Completed'),
    assignment('Weekly Math Worksheet','Calculus',-2,'Low','Completed')
  ],tasks:[
    {id:uid(),title:'Read Chapter 6',subject:'Computer Science',priority:'High',done:false,date:todayKey(),time:'9:00 AM'},
    {id:uid(),title:'Complete math worksheet',subject:'Calculus',priority:'Medium',done:true,date:todayKey(),time:'11:00 AM',completedAt:todayKey()},
    {id:uid(),title:'Write lab report introduction',subject:'Physics',priority:'Medium',done:false,date:todayKey(),time:'2:00 PM'},
    {id:uid(),title:'Review for psychology quiz',subject:'Psychology',priority:'Low',done:false,date:todayKey(),time:'6:00 PM'}
  ],focusSessions:[],notificationsRead:false};
}
let storageAvailable = true;
function loadState(raw) {
  try {
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || !Array.isArray(parsed.assignments) || !Array.isArray(parsed.tasks) || !parsed.profile) return seedState();
    parsed.assignments = parsed.assignments.filter(a => a && typeof a.id === 'string' && typeof a.title === 'string' && SUBJECTS.includes(a.subject) && isDateKey(a.dueDate) && ['High','Medium','Low'].includes(a.priority) && ['Not Started','In Progress','Completed'].includes(a.status));
    parsed.tasks = parsed.tasks.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string' && isDateKey(t.date));
    parsed.focusSessions = Array.isArray(parsed.focusSessions) ? parsed.focusSessions.filter(s => s && isDateKey(s.date) && Number.isFinite(s.minutes) && s.minutes > 0) : [];
    parsed.profile = {name:String(parsed.profile.name || 'Student').slice(0,50),course:String(parsed.profile.course || 'My studies').slice(0,60),goal:[2,4,6,8].includes(Number(parsed.profile.goal)) ? Number(parsed.profile.goal) : 4};
    return parsed;
  } catch { storageAvailable = false; return seedState(); }
}
let state = seedState();
let pendingSave = Promise.resolve();
let appReady = false;
const currentView = document.body.dataset.page || 'dashboard';
const PAGE_URLS = {dashboard:'index.html',assignments:'assignments.html',calendar:'calendar.html',progress:'progress.html'};
let filters = {status:'All',subject:'All',priority:'All',sort:'due-asc',search:new URLSearchParams(location.search).get('q') || ''};
let calendarDate = parseDate(todayKey());
let selectedDate = todayKey();
let calendarMode = 'month';
let timer = {minutes:25,remaining:25 * 60,running:false,endAt:null};
let lastDay = todayKey();
const main = $('#main-content');
// Keep each page's actual HTML as its layout; JavaScript only fills changing data.
const pageMarkup = main.innerHTML;

function saveState() {
  state.focusTimer = {...timer};
  pendingSave = window.studySprintStorage.write(JSON.stringify(state)).then(() => {
    storageAvailable = true; updateStorageLabel();
  }).catch(() => {
    if(storageAvailable) toast('Browser storage is unavailable. Your changes are currently in memory.');
    storageAvailable = false; updateStorageLabel();
  });
  return pendingSave;
}
function updateStorageLabel() {
  $('#storage-label').textContent = storageAvailable ? 'Saved on this device' : 'Session only · storage unavailable';
  $('.saved-label').classList.toggle('storage-warning',!storageAvailable);
}
function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
function updateProfile() {
  $('#profile-name').textContent = state.profile.name;
  $('#profile-course').textContent = state.profile.course;
  $('#profile-avatar').textContent = state.profile.name.trim().split(/\s+/).slice(0,2).map(s => s[0]).join('').toUpperCase();
}
function toast(message, undo) {
  const node = document.createElement('div'); node.className = 'toast';
  const check = document.createElement('span'); check.innerHTML = icon('check-circle');
  const text = document.createElement('span'); text.textContent = message;
  node.append(check,text);
  if (undo) { const button = document.createElement('button'); button.textContent = 'Undo'; button.addEventListener('click',() => { undo(); node.remove(); }); node.append(button); }
  $('#toast-region').replaceChildren(node);
  setTimeout(() => node.remove(),undo ? 10000 : 4500);
}
function badge(value) { return `<span class="badge ${escapeHtml(value.toLowerCase().replaceAll(' ','-'))}"><span class="badge-dot"></span>${escapeHtml(value)}</span>`; }
function todayTasks() { return state.tasks.filter(t => t.date === todayKey()); }
function focusToday() { return state.focusSessions.filter(s => s.date === todayKey()); }
function completionRate() { return state.assignments.length ? Math.round(state.assignments.filter(a => a.status === 'Completed').length / state.assignments.length * 100) : 0; }
function activeAssignments() { return state.assignments.filter(a => a.status !== 'Completed').sort((a,b) => a.dueDate.localeCompare(b.dueDate)); }
function weeklyCompleted() { const start = dateKey(weekStart(new Date())); return state.assignments.filter(a => a.status === 'Completed' && a.completedAt >= start && a.completedAt <= todayKey()).length; }
function activitiesForDay(day) { return state.assignments.filter(a => a.status === 'Completed' && a.completedAt === day).length + state.tasks.filter(t => t.done && t.completedAt === day).length + state.focusSessions.filter(s => s.date === day).length; }
function weekData() { const start = weekStart(new Date()); return Array.from({length:7},(_,i) => { const date = shiftDate(start,i); const key = dateKey(date); return {key,label:date.toLocaleDateString('en-US',{weekday:'short'}).slice(0,1),value:activitiesForDay(key),minutes:state.focusSessions.filter(s => s.date === key).reduce((sum,s) => sum + s.minutes,0)}; }); }
function barChart(focusOnly = false) {
  const days = weekData(); const max = Math.max(...days.map(d => focusOnly ? d.minutes : d.value),focusOnly ? 25 : 3);
  return `<div class="weekly-chart" role="img" aria-label="${focusOnly ? 'Focus minutes' : 'Completed activities'} this week: ${days.map(d => `${escapeHtml(longDate(d.key))}: ${focusOnly ? d.minutes : d.value}`).join(', ')}">${days.map(d => `<div class="chart-column ${d.key === todayKey() ? 'is-today' : ''}" title="${escapeHtml(longDate(d.key))}: ${focusOnly ? d.minutes + ' minutes' : d.value + ' activities'}"><div class="chart-bar-wrap"><div class="chart-bar" style="height:${Math.max(5,(focusOnly ? d.minutes : d.value) / max * 100)}%"></div></div><span>${d.label}</span></div>`).join('')}</div>`;
}
function heading() {
  $('#page-date').textContent = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  if (currentView === 'dashboard') {
    $('#page-eyebrow').textContent = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}).toUpperCase();
    $('#page-title').textContent = `Let’s make today count, ${state.profile.name.trim().split(/\s+/)[0]} 👋`;
  }
}
function stats() {
  $('[data-stat="due"]').textContent = activeAssignments().filter(a => a.dueDate <= relativeKey(7)).length;
  $('[data-stat="tasks"]').textContent = todayTasks().filter(t => !t.done).length;
  $('[data-stat="tasks-note"]').textContent = `${todayTasks().filter(t => t.done).length} checked off. You’ve got this!`;
  $('[data-stat="progress"]').textContent = `${completionRate()}%`;
  $('[data-stat="completed"]').textContent = weeklyCompleted();
}

function assignmentRows(assignments, full = false) {
  return assignments.map(a => `<tr><td><div class="assignment-name"><span class="assignment-symbol" style="${colorStyle(a.subject)}">${icon('book')}</span><div><button class="assignment-title-button" data-action="edit-assignment" data-id="${escapeHtml(a.id)}">${escapeHtml(a.title)}</button>${!full ? `<small class="assignment-subject">${escapeHtml(a.subject)}</small>` : ''}</div></div></td>${full ? `<td>${escapeHtml(a.subject)}</td>` : ''}<td><span class="due-date ${a.dueDate <= relativeKey(2) && a.status !== 'Completed' ? 'urgent' : ''}">${escapeHtml(shortDate(a.dueDate))}${a.dueDate < todayKey() && a.status !== 'Completed' ? '<small class="assignment-subject">Overdue</small>' : ''}</span></td><td class="priority-column">${badge(a.priority)}</td><td>${full ? `<select class="status-select" data-status-id="${escapeHtml(a.id)}" aria-label="Status of ${escapeHtml(a.title)}">${['Not Started','In Progress','Completed'].map(s => `<option ${a.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select>` : badge(a.status)}</td>${full ? `<td><div class="row-actions"><button class="icon-button" data-action="edit-assignment" data-id="${escapeHtml(a.id)}" aria-label="Edit ${escapeHtml(a.title)}">${icon('edit')}</button><button class="icon-button danger-text" data-action="delete-assignment" data-id="${escapeHtml(a.id)}" aria-label="Delete ${escapeHtml(a.title)}">${icon('trash')}</button></div></td>` : ''}</tr>`).join('');
}
function emptyState(title, message, action = '', label = '') { return `<div class="empty-state"><span>${icon('inbox')}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p>${action ? `<button class="button secondary" data-action="${action}">${escapeHtml(label)}</button>` : ''}</div>`; }
function taskCard() {
  const tasks = todayTasks(); const done = tasks.filter(t => t.done).length;
  $('#tasks-list').innerHTML = tasks.map(t => `<div class="task-row ${t.done ? 'is-complete' : ''}"><input class="task-check" type="checkbox" data-task-id="${escapeHtml(t.id)}" ${t.done ? 'checked' : ''} aria-label="Complete ${escapeHtml(t.title)}"><div class="task-content"><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.subject)}</small></div><span class="task-time">${escapeHtml(t.time || '')}</span>${badge(t.priority || 'Medium')}<button class="icon-button task-delete" data-action="delete-task" data-id="${escapeHtml(t.id)}" aria-label="Delete task ${escapeHtml(t.title)}">${icon('x')}</button></div>`).join('') || emptyState('A fresh start','Add a small task to get your day going.','add-task','Add a task');
  const percent = tasks.length ? Math.round(done/tasks.length*100) : 0;
  $('#task-completion-label').textContent = `${done} of ${tasks.length} tasks completed`;
  $('#task-completion-percent').textContent = `${percent}%`;
  $('#task-progress-fill').style.width = `${percent}%`;
}
function timerCard() {
  $('#timer-duration').value = timer.minutes;
  $('#focus-goal-label').textContent = `${focusToday().length} / ${state.profile.goal} sessions today`;
}
function renderDashboard() {
  stats(); taskCard(); timerCard();
  const upcoming = activeAssignments().slice(0,4);
  $('#upcoming-table').hidden = upcoming.length === 0;
  $('#upcoming-bottom').hidden = upcoming.length === 0;
  $('#upcoming-empty').hidden = upcoming.length > 0;
  $('#upcoming-empty').innerHTML = upcoming.length ? '' : emptyState('You’re all caught up','Enjoy the breathing room, or plan your next assignment.','add-assignment','Add assignment');
  $('#upcoming-rows').innerHTML = assignmentRows(upcoming);
  $('#upcoming-count').textContent = `${activeAssignments().length} assignments on your radar`;
  const activity = weekData().reduce((sum,d) => sum+d.value,0);
  $('#weekly-activity-count').textContent = activity;
  $('#weekly-activity-chart').innerHTML = barChart();
  $('#weekly-activity-caption').textContent = activity ? 'Every little effort adds up. Keep going!' : 'Your next step starts a new streak.';
}
function filteredAssignments() {
  const priorityOrder = {High:0,Medium:1,Low:2};
  return state.assignments.filter(a => (filters.status === 'All' || a.status === filters.status) && (filters.subject === 'All' || a.subject === filters.subject) && (filters.priority === 'All' || a.priority === filters.priority) && `${a.title} ${a.subject} ${a.notes || ''}`.toLowerCase().includes(filters.search.toLowerCase().trim())).sort((a,b) => filters.sort === 'due-desc' ? b.dueDate.localeCompare(a.dueDate) : filters.sort === 'priority' ? priorityOrder[a.priority]-priorityOrder[b.priority] || a.dueDate.localeCompare(b.dueDate) : filters.sort === 'title' ? a.title.localeCompare(b.title) : a.dueDate.localeCompare(b.dueDate));
}
function renderAssignments() {
  const rows = filteredAssignments();
  const anyFilter = filters.status !== 'All' || filters.subject !== 'All' || filters.priority !== 'All' || Boolean(filters.search);
  document.querySelectorAll('[data-filter-status]').forEach(tab => {
    const status = tab.dataset.filterStatus; const active = filters.status === status;
    tab.classList.toggle('active',active); tab.setAttribute('aria-selected',String(active)); tab.tabIndex = active ? 0 : -1;
    $('[data-status-count]',tab).textContent = status === 'All' ? state.assignments.length : state.assignments.filter(a => a.status === status).length;
  });
  $('#filter-subject').innerHTML = '<option value="All">All subjects</option>' + SUBJECTS.map(s => `<option>${escapeHtml(s)}</option>`).join('');
  $('#filter-subject').value = filters.subject; $('#filter-priority').value = filters.priority; $('#filter-sort').value = filters.sort;
  $('#assignment-search').value = filters.search;
  $('#assignments-table').hidden = rows.length === 0; $('#assignments-empty').hidden = rows.length > 0;
  $('#assignment-rows').innerHTML = assignmentRows(rows,true);
  $('#assignments-empty').innerHTML = rows.length ? '' : emptyState(anyFilter ? 'No matching assignments' : 'A little room for your next goal',anyFilter ? 'Try another search or clear your filters.' : 'Add your first assignment and make a plan.',anyFilter ? 'clear-filters' : 'add-assignment',anyFilter ? 'Clear filters' : 'Add assignment');
  $('#assignment-count').textContent = `Showing ${rows.length} of ${state.assignments.length} assignments`;
  $('#clear-assignment-filters').hidden = !anyFilter || rows.length === 0;
  $('#assignment-footer-note').hidden = anyFilter;
}
function renderCalendar() {
  const month = calendarDate.getMonth(); const year = calendarDate.getFullYear();
  const monthName = calendarDate.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const first = new Date(year,month,1,12); const start = calendarMode === 'week' ? weekStart(calendarDate) : weekStart(first);
  const total = calendarMode === 'week' ? 7 : Math.ceil((((first.getDay()+6)%7) + new Date(year,month+1,0).getDate())/7)*7;
  const monthAssignments = state.assignments.filter(a => { const d = parseDate(a.dueDate); return d.getMonth() === month && d.getFullYear() === year; }).sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  const selected = state.assignments.filter(a => a.dueDate === selectedDate);
  const weekLabel = `${shortDate(dateKey(start))} – ${shortDate(dateKey(shiftDate(start,6)))}, ${year}`;
  let content;
  if (calendarMode === 'list') {
    content = `<div class="calendar-list">${monthAssignments.map(a => `<div class="calendar-list-item"><div class="list-date"><strong>${parseDate(a.dueDate).getDate()}</strong><small>${parseDate(a.dueDate).toLocaleDateString('en-US',{weekday:'short'})}</small></div><span class="assignment-symbol" style="${colorStyle(a.subject)}">${icon('book')}</span><div class="list-event-info"><button class="assignment-title-button" data-action="edit-assignment" data-id="${escapeHtml(a.id)}">${escapeHtml(a.title)}</button><small>${escapeHtml(a.subject)}</small></div>${badge(a.priority)}${badge(a.status)}</div>`).join('') || emptyState('A little breathing room','No assignments are due this month.','add-assignment','Plan an assignment')}</div>`;
  } else {
    content = `<div class="calendar-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `<span>${d}</span>`).join('')}</div><div class="calendar-grid ${calendarMode === 'week' ? 'calendar-week' : ''}">${Array.from({length:total},(_,i) => { const day = shiftDate(start,i); const key = dateKey(day); const events = state.assignments.filter(a => a.dueDate === key); return `<div class="calendar-cell ${day.getMonth() !== month && calendarMode === 'month' ? 'outside-month' : ''} ${key === todayKey() ? 'is-today' : ''} ${key === selectedDate ? 'selected' : ''}" data-calendar-day="${key}"><button class="day-number" data-action="select-day" data-date="${key}" aria-label="${escapeHtml(longDate(key))}${events.length ? `, ${events.length} assignments` : ''}" ${key === todayKey() ? 'aria-current="date"' : ''} aria-pressed="${key === selectedDate}">${day.getDate()}</button>${events.slice(0,calendarMode === 'week' ? 10 : 2).map(a => `<button class="calendar-event ${a.status === 'Completed' ? 'completed-event' : ''}" style="${colorStyle(a.subject)}" data-action="edit-assignment" data-id="${escapeHtml(a.id)}" title="${escapeHtml(a.title)} — ${escapeHtml(a.subject)}">${escapeHtml(a.title)}</button>`).join('')}${events.length > 2 && calendarMode === 'month' ? `<button class="calendar-more" data-action="select-day" data-date="${key}">+${events.length-2} more</button>` : ''}</div>`; }).join('')}</div><div class="calendar-legend">${['Computer Science','Business Management','Physics','Calculus'].map(s => `<span style="${colorStyle(s)}"><i class="legend-dot"></i>${s}</span>`).join('')}</div>`;
  }
  $('#calendar-title').textContent = calendarMode === 'week' ? weekLabel : monthName;
  $('[data-action="calendar-prev"]').setAttribute('aria-label',`Previous ${calendarMode === 'week' ? 'week' : 'month'}`);
  $('[data-action="calendar-next"]').setAttribute('aria-label',`Next ${calendarMode === 'week' ? 'week' : 'month'}`);
  document.querySelectorAll('[data-calendar-mode]').forEach(button => { const active = button.dataset.calendarMode === calendarMode; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
  $('#calendar-content').innerHTML = content;
  $('#agenda-title').textContent = `${shortDate(selectedDate)}, ${parseDate(selectedDate).getFullYear()}`;
  $('#agenda-date-label').textContent = `${selectedDate === todayKey() ? 'Today · ' : ''}${parseDate(selectedDate).toLocaleDateString('en-US',{weekday:'long'})}`;
  $('[data-action="add-on-date"]').setAttribute('aria-label',`Add assignment on ${shortDate(selectedDate)}`);
  $('#agenda-list').innerHTML = selected.length ? selected.map(a => `<div class="agenda-item" style="${colorStyle(a.subject)}"><strong>${escapeHtml(a.title)}</strong><small>${escapeHtml(a.subject)}</small>${badge(a.priority)} ${badge(a.status)}${a.notes ? `<small>${escapeHtml(a.notes)}</small>` : ''}<button class="text-button" data-action="edit-assignment" data-id="${escapeHtml(a.id)}">View details ${icon('arrow')}</button></div>`).join('') : `<div class="agenda-empty">${icon('leaf')}<p>No deadlines on this day.<br>A good moment to get ahead.</p><button class="text-button" data-action="add-on-date">${icon('plus')}Plan something</button></div>`;
}
function renderProgress() {
  stats();
  const completed = state.assignments.filter(a => a.status === 'Completed').length;
  const inProgress = state.assignments.filter(a => a.status === 'In Progress').length;
  const subjects = [...new Set(state.assignments.map(a => a.subject))];
  $('#subject-progress').innerHTML = subjects.map(s => { const all = state.assignments.filter(a => a.subject === s); const done = all.filter(a => a.status === 'Completed').length; return `<div class="subject-row" style="${colorStyle(s)}"><div class="subject-info"><span>${escapeHtml(s)}</span><small>${done} / ${all.length} complete · ${Math.round(done/all.length*100)}%</small></div><div class="progress-track" role="progressbar" aria-label="${escapeHtml(s)} completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(done/all.length*100)}"><div class="progress-fill" style="width:${done/all.length*100}%"></div></div></div>`; }).join('') || emptyState('Your progress starts here','Add an assignment to start tracking your goals.','add-assignment','Add assignment');
  $('#progress-donut').style.setProperty('--percent',completionRate());
  $('#progress-donut').setAttribute('aria-label',`${completionRate()} percent of assignments completed`);
  $('#donut-percent').textContent = `${completionRate()}%`;
  $('#completed-count').textContent = completed; $('#in-progress-count').textContent = inProgress; $('#pending-count').textContent = state.assignments.length-completed-inProgress;
  $('#focus-minutes').textContent = weekData().reduce((sum,d) => sum+d.minutes,0);
  $('#focus-week-chart').innerHTML = barChart(true);
  $('#progress-focus-goal').textContent = `${focusToday().length} of ${state.profile.goal} focus sessions completed today`;
  $('#achievement-list').innerHTML = [{icon:'check-circle',title:'First step, taken',description:'Complete your first assignment',unlocked:completed>=1},{icon:'flame',title:'Finding your flow',description:'Finish your first focus session',unlocked:state.focusSessions.length>=1},{icon:'trophy',title:'A week of wins',description:'Complete 5 assignments in one week',unlocked:weeklyCompleted()>=5}].map(a => `<div class="achievement ${a.unlocked ? '' : 'locked'}"><span>${icon(a.icon)}</span><div><strong>${a.title}${a.unlocked ? ' ✓' : ''}</strong><small>${a.description}</small></div></div>`).join('');
}
function renderView(preserveFocus = false) {
  const focused = preserveFocus && document.activeElement?.id;
  const position = focused && document.activeElement.selectionStart;
  main.innerHTML = pageMarkup;
  heading();
  const renderers = {dashboard:renderDashboard,assignments:renderAssignments,calendar:renderCalendar,progress:renderProgress};
  renderers[currentView]();
  hydrateIcons(main);
  updateTimerUI();
  if (focused) { const input = document.getElementById(focused); if (input) { input.focus({preventScroll:true}); if (typeof position === 'number' && ['text','search','url','tel','password'].includes(input.type)) input.setSelectionRange(position,position); } }
  $('#notification-dot').hidden = state.notificationsRead || activeAssignments().length === 0;
}
function navigate() {
  document.querySelectorAll('.main-nav a').forEach(link => { const active = link.dataset.view === currentView; link.classList.toggle('active',active); if(active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
  $('#breadcrumb-current').textContent = currentView[0].toUpperCase()+currentView.slice(1);
  document.title = `${currentView[0].toUpperCase()+currentView.slice(1)} · StudySprint`;
  $('#global-search').value = filters.search;
  closeNotifications(); renderView();
}
function goTo(view, query = '') {
  const url = new URL(PAGE_URLS[view] || PAGE_URLS.dashboard,location.href);
  if(query) url.search = new URLSearchParams({q:query}).toString();
  pendingSave.then(() => location.assign(url.href));
}
function setSelectOptions(select, initial = '') { select.innerHTML = `${initial ? `<option value="">${initial}</option>` : ''}${SUBJECTS.map(s => `<option>${escapeHtml(s)}</option>`).join('')}`; }
function openAssignment(id = null, dueDate = null) {
  const assignment = id ? state.assignments.find(a => a.id === id) : null;
  if (id && !assignment) return;
  $('#assignment-form').reset();
  $('#assignment-title').setCustomValidity('');
  $('#assignment-id').value = assignment?.id || '';
  $('#assignment-dialog-title').textContent = assignment ? 'Edit assignment' : 'Add an assignment';
  $('#save-assignment').innerHTML = `${icon(assignment ? 'check' : 'plus')}${assignment ? 'Save changes' : 'Add assignment'}`;
  setSelectOptions($('#assignment-subject'),'Select a subject');
  $('#assignment-title').value = assignment?.title || '';
  $('#assignment-subject').value = assignment?.subject || '';
  $('#assignment-date').value = assignment?.dueDate || dueDate || todayKey();
  $('#assignment-priority').value = assignment?.priority || 'Medium';
  $('#assignment-status').value = assignment?.status || 'Not Started';
  $('#assignment-notes').value = assignment?.notes || '';
  $('#notes-count').textContent = $('#assignment-notes').value.length;
  closeNotifications(); $('#assignment-dialog').showModal(); $('#assignment-title').focus();
}
function openTask() { $('#task-form').reset(); $('#task-title').setCustomValidity(''); setSelectOptions($('#task-subject')); $('#task-dialog').showModal(); $('#task-title').focus(); }
function deleteAssignment(id) {
  const index = state.assignments.findIndex(a => a.id === id); if(index === -1) return;
  const [removed] = state.assignments.splice(index,1); saveState(); renderView();
  toast('Assignment deleted.',() => { state.assignments.splice(Math.min(index,state.assignments.length),0,removed); saveState(); renderView(); toast('Assignment restored.'); });
}
function closeNotifications() { $('#notifications').hidden = true; $('#notification-button').setAttribute('aria-expanded','false'); }
function toggleNotifications() {
  const popover = $('#notifications'); const shouldOpen = popover.hidden;
  if (!shouldOpen) { closeNotifications(); return; }
  popover.innerHTML = `<div class="popover-title"><h3>Coming up next</h3><button class="text-button" id="mark-read">Mark all as read</button></div>${activeAssignments().slice(0,3).map(a => `<button class="notification-item" data-notification-id="${escapeHtml(a.id)}"><span class="notification-icon">${icon('calendar')}</span><span><strong>${escapeHtml(a.title)}</strong><small>${a.dueDate < todayKey() ? 'Overdue · ' : 'Due '}${escapeHtml(shortDate(a.dueDate))} · ${escapeHtml(a.subject)}</small></span></button>`).join('') || '<div class="empty-state"><p>You’re all caught up. A little breathing room!</p></div>'}`;
  popover.hidden = false; $('#notification-button').setAttribute('aria-expanded','true');
}
function startFocus() {
  if(currentView !== 'dashboard') { pendingSave.then(() => location.assign(new URL('index.html#focus-card',location.href).href)); return; }
  $('#focus-card')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'center'});
  $('#timer-toggle')?.focus({preventScroll:true});
}
function updateTimerUI() {
  const display = $('#timer-display'); if(!display) return;
  const seconds = Math.max(0,timer.remaining);
  display.textContent = `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  const ring = $('#timer-progress'); if(ring) ring.style.strokeDashoffset = String(439.823*(1-seconds/(timer.minutes*60)));
  $('#timer-caption').textContent = timer.running ? 'Breathe. You’re making progress.' : seconds < timer.minutes * 60 ? 'A little pause. Come back when ready.' : 'Your next little win starts here.';
  const button = $('#timer-toggle'); const label = timer.running ? 'Pause session' : seconds < timer.minutes * 60 ? 'Resume session' : 'Start focus session';
  if(button.dataset.label !== label) { button.innerHTML = `${icon(timer.running ? 'pause' : 'play')}${label}`; button.dataset.label = label; }
  $('#timer-duration').disabled = timer.running;
}
function toggleTimer() {
  if(timer.running) { timer.remaining = Math.max(0,Math.ceil((timer.endAt-Date.now())/1000)); timer.running = false; timer.endAt = null; }
  else { if(timer.remaining <= 0) timer.remaining = timer.minutes*60; timer.running = true; timer.endAt = Date.now()+timer.remaining*1000; }
  saveState(); updateTimerUI();
}
function tickTimer() {
  if (todayKey() !== lastDay) { lastDay = todayKey(); renderView(); }
  if(!timer.running) return;
  timer.remaining = Math.max(0,Math.ceil((timer.endAt-Date.now())/1000));
  if(timer.remaining === 0) {
    timer.running = false; timer.endAt = null;
    state.focusSessions.push({id:uid(),date:todayKey(),minutes:timer.minutes,completedAt:new Date().toISOString()});
    timer.remaining = timer.minutes*60; saveState(); renderView(); toast(`Nice work! ${timer.minutes} focused minutes, just for your goals. Take a short break.`);
  } else updateTimerUI();
}
function selectCalendarDay(key) { selectedDate = key; calendarDate = parseDate(key); renderView(); const selected = $(`[data-calendar-day="${key}"] .day-number`); selected?.focus({preventScroll:true}); }

// Events are delegated so each view stays interactive after rendering.
main.addEventListener('click',event => {
  const statusTab = event.target.closest('[data-filter-status]');
  if(statusTab) { filters.status = statusTab.dataset.filterStatus; renderView(); $(`[data-filter-status="${filters.status}"]`)?.focus({preventScroll:true}); return; }
  const calendarView = event.target.closest('[data-calendar-mode]');
  if(calendarView) { calendarMode = calendarView.dataset.calendarMode; renderView(); $(`[data-calendar-mode="${calendarMode}"]`)?.focus({preventScroll:true}); return; }
  const button = event.target.closest('[data-action]');
  const action = button?.dataset.action; const id = button?.dataset.id;
  if(action === 'add-assignment') openAssignment();
  else if(action === 'edit-assignment') openAssignment(id);
  else if(action === 'delete-assignment') deleteAssignment(id);
  else if(action === 'add-on-date') openAssignment(null,selectedDate);
  else if(action === 'add-task') openTask();
  else if(action === 'delete-task') { const index = state.tasks.findIndex(t => t.id === id); if(index < 0) return; const [task] = state.tasks.splice(index,1); saveState(); renderView(); toast('Study task deleted.',() => { state.tasks.splice(index,0,task); saveState(); renderView(); }); }
  else if(action === 'clear-filters') { filters = {status:'All',subject:'All',priority:'All',sort:'due-asc',search:''}; $('#global-search').value = ''; renderView(); }
  else if(action === 'focus') startFocus();
  else if(action === 'toggle-timer') toggleTimer();
  else if(action === 'reset-timer') { timer.running = false; timer.endAt = null; timer.remaining = timer.minutes*60; saveState(); updateTimerUI(); toast('Ready for a fresh start.'); }
  else if(action === 'select-day') selectCalendarDay(button.dataset.date);
  else if(action === 'calendar-today') { calendarDate = parseDate(todayKey()); selectedDate = todayKey(); renderView(); }
  else if(action === 'calendar-prev' || action === 'calendar-next') { const direction = action === 'calendar-prev' ? -1 : 1; if(calendarMode === 'week') calendarDate = shiftDate(calendarDate,7*direction); else calendarDate = new Date(calendarDate.getFullYear(),calendarDate.getMonth()+direction,1,12); selectedDate = dateKey(calendarDate); renderView(); }
  else { const cell = event.target.closest('[data-calendar-day]'); if(cell && !event.target.closest('button')) selectCalendarDay(cell.dataset.calendarDay); }
});
main.addEventListener('change',event => {
  const target = event.target;
  if(target.matches('[data-task-id]')) { const task = state.tasks.find(t => t.id === target.dataset.taskId); if(!task) return; task.done = target.checked; task.completedAt = task.done ? todayKey() : null; saveState(); renderView(); $(`[data-task-id="${task.id}"]`)?.focus({preventScroll:true}); if(task.done) toast('One small step, done. Nice work!'); }
  else if(target.matches('[data-status-id]')) { const a = state.assignments.find(a => a.id === target.dataset.statusId); if(!a) return; a.status = target.value; a.completedAt = a.status === 'Completed' ? todayKey() : null; saveState(); renderView(); $(`[data-status-id="${a.id}"]`)?.focus({preventScroll:true}); toast(a.status === 'Completed' ? 'Another assignment, done. That’s a little win!' : 'Assignment status updated.'); }
  else if(target.id === 'filter-subject' || target.id === 'filter-priority' || target.id === 'filter-sort') { filters[target.id.replace('filter-','')] = target.value; renderView(true); }
  else if(target.id === 'timer-duration') { timer.minutes = Number(target.value); timer.remaining = timer.minutes*60; timer.running = false; timer.endAt = null; saveState(); updateTimerUI(); }
});
main.addEventListener('input',event => { if(event.target.id === 'assignment-search') { filters.search = event.target.value; $('#global-search').value = filters.search; renderView(true); } });
$('#assignment-form').addEventListener('submit',event => {
  event.preventDefault(); const form = event.currentTarget;
  const title = $('#assignment-title').value.trim();
  if(!title) { $('#assignment-title').setCustomValidity('Please enter an assignment title.'); $('#assignment-title').reportValidity(); return; }
  if(!form.reportValidity()) return;
  const id = $('#assignment-id').value; const existing = state.assignments.find(a => a.id === id);
  const newStatus = $('#assignment-status').value;
  const data = {id:id || uid(),title,subject:$('#assignment-subject').value,dueDate:$('#assignment-date').value,priority:$('#assignment-priority').value,status:newStatus,notes:$('#assignment-notes').value.trim(),createdAt:existing?.createdAt || new Date().toISOString(),completedAt:newStatus === 'Completed' ? existing?.completedAt || todayKey() : null};
  if(!isDateKey(data.dueDate) || !SUBJECTS.includes(data.subject)) { toast('Please choose a valid subject and date.'); return; }
  if(existing) Object.assign(existing,data); else state.assignments.push(data);
  state.notificationsRead = false; saveState(); $('#assignment-dialog').close(); renderView(); toast(existing ? 'Assignment updated. Your plan is looking good.' : 'Assignment added. One less thing to keep in your head.');
});
$('#assignment-title').addEventListener('input',event => event.target.setCustomValidity(''));
$('#assignment-notes').addEventListener('input',event => { $('#notes-count').textContent = event.target.value.length; });
$('#task-form').addEventListener('submit',event => { event.preventDefault(); const title = $('#task-title').value.trim(); if(!title) { $('#task-title').setCustomValidity('Please enter a task.'); $('#task-title').reportValidity(); return; } state.tasks.push({id:uid(),title,subject:$('#task-subject').value,priority:'Medium',done:false,date:todayKey(),time:''}); saveState(); $('#task-dialog').close(); renderView(); toast('A small step added to your day.'); });
$('#task-title').addEventListener('input',event => event.target.setCustomValidity(''));
$('#profile-button').addEventListener('click',() => { closeNotifications(); $('#settings-name').value = state.profile.name; $('#settings-course').value = state.profile.course; $('#settings-goal').value = state.profile.goal; $('#profile-dialog').showModal(); });
$('#profile-form').addEventListener('submit',event => { event.preventDefault(); const name = $('#settings-name').value.trim(); const course = $('#settings-course').value.trim(); if(!name || !course) { toast('Please enter your name and course.'); return; } state.profile = {name,course,goal:Number($('#settings-goal').value)}; saveState(); updateProfile(); $('#profile-dialog').close(); renderView(); toast('Your study space, a little more you.'); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click',() => document.getElementById(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click',event => { if(event.target === dialog) { const rect = dialog.getBoundingClientRect(); if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
$('#global-search').addEventListener('input',event => { if(currentView !== 'assignments') return; filters.search = event.target.value; filters.status = 'All'; filters.subject = 'All'; filters.priority = 'All'; renderView(); });
$('#global-search-form').addEventListener('submit',event => { event.preventDefault(); const query = $('#global-search').value.trim(); if(currentView !== 'assignments') goTo('assignments',query); else { filters.search = query; renderView(); } });
// Finish pending saves before navigating between the local HTML files.
document.addEventListener('click',event => {
  const link = event.target.closest('a[href]');
  if(!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
  const url = new URL(link.href,location.href);
  if(!Object.values(PAGE_URLS).some(file => url.pathname.endsWith('/'+file)) || url.origin !== location.origin || url.pathname.slice(0,url.pathname.lastIndexOf('/')) !== location.pathname.slice(0,location.pathname.lastIndexOf('/'))) return;
  event.preventDefault(); pendingSave.then(() => location.assign(url.href));
});
$('#notification-button').addEventListener('click',toggleNotifications);
$('#notifications').addEventListener('click',event => { const item = event.target.closest('[data-notification-id]'); if(item) openAssignment(item.dataset.notificationId); if(event.target.closest('#mark-read')) { state.notificationsRead = true; saveState(); $('#notification-dot').hidden = true; closeNotifications(); toast('You’re up to date.'); } });
document.addEventListener('click',event => { if(!event.target.closest('.notification-wrap')) closeNotifications(); });
document.addEventListener('keydown',event => { if(event.key === 'Escape') closeNotifications(); if(event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input,textarea,select,[contenteditable]') && !document.querySelector('dialog[open]')) { event.preventDefault(); $('#global-search').focus(); } });
$('.skip-link').addEventListener('click',event => { event.preventDefault(); main.focus(); main.scrollIntoView({block:'start'}); });
main.addEventListener('keydown',event => {
  const tab = event.target.closest('[data-filter-status]');
  if(!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const tabs = [...main.querySelectorAll('[data-filter-status]')]; const index = tabs.indexOf(tab);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : (index+(event.key === 'ArrowRight' ? 1 : -1)+tabs.length)%tabs.length;
  tabs[next].click();
});
document.addEventListener('visibilitychange',() => { if(!document.hidden) tickTimer(); });

window.addEventListener('studysprint-storage-change',event => {
  if(appReady && !document.querySelector('dialog[open]')) { state = loadState(event.detail); restoreTimer(); updateProfile(); renderView(); updateStorageLabel(); }
});
function restoreTimer() {
  const saved = state.focusTimer;
  if(saved && [15,25,45,60].includes(saved.minutes) && Number.isFinite(saved.remaining) && saved.remaining >= 0 && saved.remaining <= saved.minutes*60 && (!saved.running || Number.isFinite(saved.endAt))) {
    timer = {...saved};
    if(timer.running) timer.remaining = Math.max(0,Math.ceil((timer.endAt-Date.now())/1000));
  }
}
async function initialize() {
  try { state = loadState(await window.studySprintStorage.read()); }
  catch { storageAvailable = false; toast('Shared storage is unavailable. Open the project with a local server to keep pages in sync.'); }
  restoreTimer(); hydrateIcons(); updateProfile(); navigate();
  appReady = true;
  if(storageAvailable) await saveState(); else updateStorageLabel();
  tickTimer(); setInterval(tickTimer,1000);
  if(currentView === 'dashboard' && location.hash === '#focus-card') startFocus();
}
initialize();

})();
