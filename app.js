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


const {utils:U,model:M,assignments:A,tasks:T,timer:F,progress:P,reminders:R} = StudySprint;
const repository=window.studySprintStorage;
let state=M.empty(), timer=state.timer, appReady=false, pendingSave=Promise.resolve(), taskView='today';
let filters={status:'All',subject:'All',priority:'All',sort:'due-asc',search:new URLSearchParams(location.search).get('q') || ''};
const currentView=document.body.dataset.page || 'dashboard';
const PAGE_URLS={dashboard:'index.html',assignments:'assignments.html',calendar:'calendar.html',progress:'progress.html'};
const main=$('#main-content'),pageMarkup=main.innerHTML;
let calendarDate=parseDate(todayKey()),selectedDate=todayKey(),calendarMode='month',lastDay=todayKey(),finishingTimer=false;
let importWorkspace=null,confirmation=null;
const badge=value=>`<span class="badge ${escapeHtml(String(value).toLowerCase().replaceAll(' ','-'))}"><span class="badge-dot"></span>${escapeHtml(value)}</span>`;
const emptyState=(title,message,action='',label='')=>`<div class="empty-state"><span>${icon('inbox')}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p>${action ? `<button class="button secondary" data-action="${action}">${escapeHtml(label)}</button>` : ''}</div>`;
const todayTasks=()=>T.list(state,'today');
const focusToday=()=>state.focusSessions.filter(s=>s.date===todayKey());
const completionRate=()=>P.summary(state).percent;
const activeAssignments=()=>state.assignments.filter(a=>a.status!=='Completed').sort((a,b)=>A.dueAt(a)-A.dueAt(b));
const weeklyCompleted=()=>P.summary(state).weeklyCompleted;
const weekData=()=>P.week(state).map(day=>({...day,key:day.date,label:parseDate(day.date).toLocaleDateString('en-US',{weekday:'short'}).slice(0,1),value:day.completed+day.assignments+state.focusSessions.filter(s=>s.date===day.date).length}));

function applyState(next){
  if(next.revision<state.revision)return;
  state=next;timer=state.timer;appReady=true;
  updateProfile();renderView();updateStorageLabel('Saved on this device');
  document.body.dataset.ready='true';
}
async function commit(operation,message){
  if(!appReady && operation.type!=='data:import'){toast('Use recovery or import a backup before making changes.');return null;}
  const task=pendingSave.catch(()=>{}).then(()=>repository.commit(operation));pendingSave=task;
  updateStorageLabel('Saving…');
  try{const result=await task;applyState(result.state);if(message && result.changed)toast(message);return result;}
  catch(error){updateStorageLabel('Changes not saved',true);toast(error.message || 'Saving failed. Please try again.');return null;}
}
function updateStorageLabel(message,warning=false){$('#storage-label').textContent=message;$('.saved-label').classList.toggle('storage-warning',warning);}
function updateProfile(){ $('#profile-name').textContent=state.profile.name;$('#profile-course').textContent=state.profile.course;$('#profile-avatar').textContent=state.profile.name.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase(); }
function stats(){
  const values=P.summary(state);
  for(const [key,value] of Object.entries({due:values.dueSoon,tasks:values.tasksDue,progress:`${values.percent}%`,completed:values.weeklyCompleted,total:values.total,'total-completed':values.completed})){
    const node=$(`[data-stat="${key}"]`);if(node)node.textContent=value;
  }
  $('[data-stat="tasks-note"]').textContent=`${values.overdue} overdue assignment${values.overdue===1 ? '' : 's'} to review`;
}
function barChart(focusOnly=false){
  const days=weekData(),max=Math.max(...days.map(d=>focusOnly ? d.minutes : d.value),focusOnly ? 25 : 3);
  return `<div class="weekly-chart" role="img" aria-label="${focusOnly ? 'Focus minutes' : 'Completed activities'} this week: ${days.map(d=>`${longDate(d.key)}: ${focusOnly ? d.minutes : d.value}`).join(', ')}">${days.map(d=>`<div class="chart-column ${d.key===todayKey() ? 'is-today' : ''}" title="${escapeHtml(longDate(d.key))}: ${focusOnly ? d.minutes+' minutes' : d.value+' activities'}"><div class="chart-bar-wrap"><div class="chart-bar" style="height:${Math.max(3,(focusOnly ? d.minutes : d.value)/max*100)}%"></div></div><span>${d.label}</span></div>`).join('')}</div>`;
}
function assignmentRows(items,full=false){
  return items.map(a=>{
    const linked=P.forAssignment(state,a.id),steps=a.checklist.filter(step=>step.done).length;
    return `<tr><td><div class="assignment-name"><span class="assignment-symbol" style="${colorStyle(a.subject)}">${icon('book')}</span><div><button class="assignment-title-button" data-action="edit-assignment" data-id="${escapeHtml(a.id)}">${escapeHtml(a.title)}</button><small class="assignment-subject">${full ? `${linked.done}/${linked.tasks} study tasks · ${linked.minutes} min focused${a.estimatedHours ? ' / '+a.estimatedHours+'h planned' : ''}${a.checklist.length ? ` · ${steps}/${a.checklist.length} steps` : ''}` : escapeHtml(a.subject)}</small>${a.isDemo ? '<span class="sample-label">Sample</span>' : ''}</div></div></td>${full ? `<td>${escapeHtml(a.subject)}</td>` : ''}<td><span class="due-date ${A.overdue(a) ? 'urgent' : ''}">${escapeHtml(shortDate(a.dueDate))}${a.dueTime ? `<small class="assignment-subject">${escapeHtml(a.dueTime)}</small>` : ''}${A.overdue(a) ? '<small class="overdue-label">Overdue</small>' : ''}</span></td><td class="priority-column">${badge(a.priority)}</td><td>${full ? `<select class="status-select" data-status-id="${escapeHtml(a.id)}" aria-label="Status of ${escapeHtml(a.title)}">${A.statuses.map(s=>`<option ${a.status===s ? 'selected' : ''}>${s}</option>`).join('')}</select>` : badge(a.status)}</td>${full ? `<td><div class="row-actions"><button class="icon-button" data-action="plan-task" data-id="${escapeHtml(a.id)}" aria-label="Plan a study task for ${escapeHtml(a.title)}">${icon('calendar')}</button><button class="icon-button" data-action="focus-assignment" data-id="${escapeHtml(a.id)}" aria-label="Focus on ${escapeHtml(a.title)}">${icon('play')}</button><button class="icon-button" data-action="edit-assignment" data-id="${escapeHtml(a.id)}" aria-label="Edit ${escapeHtml(a.title)}">${icon('edit')}</button><button class="icon-button danger-text" data-action="delete-assignment" data-id="${escapeHtml(a.id)}" aria-label="Delete ${escapeHtml(a.title)}">${icon('trash')}</button></div></td>` : ''}</tr>`;
  }).join('');
}
function taskCard(){
  const items=T.list(state,taskView),done=items.filter(t=>t.done).length;
  $('#task-view').value=taskView;
  $('#tasks-list').innerHTML=items.map(t=>{
    const related=state.assignments.find(a=>a.id===t.assignmentId);
    return `<div class="task-row ${t.done ? 'is-complete' : ''}"><input class="task-check" type="checkbox" data-task-id="${escapeHtml(t.id)}" ${t.done ? 'checked' : ''} aria-label="Complete ${escapeHtml(t.title)}"><div class="task-content"><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.subject)}${related ? ' · '+escapeHtml(related.title) : ''}</small><small class="${!t.done && t.date<todayKey() ? 'overdue-label' : ''}">${escapeHtml(shortDate(t.date))}${t.time ? ' · '+escapeHtml(t.time) : ''}${!t.done && t.date<todayKey() ? ' · Overdue' : ''}${t.isDemo ? ' · Sample' : ''}</small></div>${badge(t.priority)}<div class="task-actions"><button class="icon-button" data-action="focus-task" data-id="${escapeHtml(t.id)}" aria-label="Focus on task ${escapeHtml(t.title)}">${icon('play')}</button><button class="icon-button" data-action="edit-task" data-id="${escapeHtml(t.id)}" aria-label="Edit task ${escapeHtml(t.title)}">${icon('edit')}</button><button class="icon-button danger-text" data-action="delete-task" data-id="${escapeHtml(t.id)}" aria-label="Delete task ${escapeHtml(t.title)}">${icon('trash')}</button></div></div>`;
  }).join('') || emptyState('Make space for your next step','Schedule a study task, or choose another task view.','add-task','Add a study task');
  const percent=items.length ? Math.round(done/items.length*100) : 0;
  $('#task-completion-label').textContent=`${done} of ${items.length} shown tasks completed`;$('#task-completion-percent').textContent=`${percent}%`;$('#task-progress-fill').style.width=`${percent}%`;
}
function contextOptions(){return '<option value="">Unlinked focus session</option>'+state.assignments.filter(a=>a.status!=='Completed').map(a=>`<option value="assignment:${escapeHtml(a.id)}">Assignment: ${escapeHtml(a.title)}</option>`).join('')+state.tasks.filter(t=>!t.done).map(t=>`<option value="task:${escapeHtml(t.id)}">Task: ${escapeHtml(t.title)}</option>`).join('');}
function timerCard(){
  $('#timer-duration').innerHTML=[...new Set([15,25,45,60,timer.minutes])].sort((a,b)=>a-b).map(m=>`<option value="${m}">${m} min</option>`).join('');$('#timer-duration').value=timer.minutes;
  $('#timer-kind').value=timer.kind;$('#focus-context').innerHTML=contextOptions();$('#focus-context').value=timer.taskId ? 'task:'+timer.taskId : timer.assignmentId ? 'assignment:'+timer.assignmentId : '';
  $('#focus-goal-label').textContent=`${focusToday().length} / ${state.profile.goal} sessions today`;
}
function renderDashboard(){
  stats();taskCard();timerCard();
  const upcoming=activeAssignments().slice(0,4);$('#upcoming-table').hidden=!upcoming.length;$('#upcoming-bottom').hidden=!upcoming.length;$('#upcoming-empty').hidden=Boolean(upcoming.length);
  $('#upcoming-empty').innerHTML=upcoming.length ? '' : emptyState('A clear space for your goals','Create your first assignment or load the sample workspace.','add-assignment','Add assignment');
  $('#upcoming-rows').innerHTML=assignmentRows(upcoming);$('#upcoming-count').textContent=`${activeAssignments().length} active assignments · ${P.summary(state).overdue} overdue`;
  const activity=weekData().reduce((sum,d)=>sum+d.value,0);$('#weekly-activity-count').textContent=activity;$('#weekly-activity-chart').innerHTML=barChart();$('#weekly-activity-caption').textContent=activity ? 'Your completed tasks, assignments, and focus sessions.' : 'A small step today is a good place to start.';
  $('#workspace-intro').hidden=Boolean(state.assignments.length || state.tasks.length);
}
function filteredAssignments(){const order={High:0,Medium:1,Low:2};return state.assignments.filter(a=>(filters.status==='All' || (filters.status==='Overdue' ? A.overdue(a) : a.status===filters.status)) && (filters.subject==='All' || a.subject===filters.subject) && (filters.priority==='All' || a.priority===filters.priority) && `${a.title} ${a.subject} ${a.notes}`.toLowerCase().includes(filters.search.toLowerCase().trim())).sort((a,b)=>filters.sort==='due-desc' ? A.dueAt(b)-A.dueAt(a) : filters.sort==='priority' ? order[a.priority]-order[b.priority] || A.dueAt(a)-A.dueAt(b) : filters.sort==='title' ? a.title.localeCompare(b.title) : A.dueAt(a)-A.dueAt(b));}

function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }

function toast(message, undo) {
  const node = document.createElement('div'); node.className = 'toast';
  const check = document.createElement('span'); check.innerHTML = icon('check-circle');
  const text = document.createElement('span'); text.textContent = message;
  node.append(check,text);
  if (undo) { const button = document.createElement('button'); button.textContent = 'Undo'; button.addEventListener('click',() => { undo(); node.remove(); }); node.append(button); }
  $('#toast-region').replaceChildren(node);
  setTimeout(() => node.remove(),undo ? 10000 : 4500);
}

function heading() {
  $('#page-date').textContent = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  if (currentView === 'dashboard') {
    $('#page-eyebrow').textContent = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}).toUpperCase();
    $('#page-title').textContent = `Let’s make today count, ${state.profile.name.trim().split(/\s+/)[0]} 👋`;
  }
}
function renderAssignments() {
  const rows = filteredAssignments();
  const anyFilter = filters.status !== 'All' || filters.subject !== 'All' || filters.priority !== 'All' || Boolean(filters.search);
  document.querySelectorAll('[data-filter-status]').forEach(tab => {
    const status = tab.dataset.filterStatus; const active = filters.status === status;
    tab.classList.toggle('active',active); tab.setAttribute('aria-selected',String(active)); tab.tabIndex = active ? 0 : -1;
    $('[data-status-count]',tab).textContent = status === 'All' ? state.assignments.length : state.assignments.filter(a => status === 'Overdue' ? A.overdue(a) : a.status === status).length;
  });
  $('#filter-subject').innerHTML = '<option value="All">All subjects</option>' + state.subjects.map(s => `<option>${escapeHtml(s)}</option>`).join('');
  $('#filter-subject').value = filters.subject; $('#filter-priority').value = filters.priority; $('#filter-sort').value = filters.sort;
  $('#assignment-search').value = filters.search;
  $('#assignments-table').hidden = rows.length === 0; $('#assignments-empty').hidden = rows.length > 0;
  $('#assignment-rows').innerHTML = assignmentRows(rows,true);
  $('#assignments-empty').innerHTML = rows.length ? '' : emptyState(anyFilter ? 'No matching assignments' : 'A little room for your next goal',anyFilter ? 'Try another search or clear your filters.' : 'Add your first assignment and make a plan.',anyFilter ? 'clear-filters' : 'add-assignment',anyFilter ? 'Clear filters' : 'Add assignment');
  $('#assignment-count').textContent = `Showing ${rows.length} of ${state.assignments.length} assignments`;
  $('#clear-assignment-filters').hidden = !anyFilter || rows.length === 0;
  $('#assignment-footer-note').hidden = anyFilter;
}

function calendarEvents(){return [...state.assignments.map(a=>({...a,eventType:'assignment',eventDate:a.dueDate,eventTime:a.dueTime,done:a.status==='Completed'})),...state.tasks.map(t=>({...t,eventType:'task',eventDate:t.date,eventTime:t.time}))].sort((a,b)=>a.eventDate.localeCompare(b.eventDate) || a.eventTime.localeCompare(b.eventTime));}
function eventButton(event){return `<button class="calendar-event ${event.done ? 'completed-event' : ''}" style="${colorStyle(event.subject)}" data-action="${event.eventType==='task' ? 'edit-task' : 'edit-assignment'}" data-id="${escapeHtml(event.id)}" title="${escapeHtml(event.title)} — ${escapeHtml(event.subject)}">${event.eventType==='task' ? '☑ ' : '▤ '}${event.eventTime ? escapeHtml(event.eventTime)+' ' : ''}${escapeHtml(event.title)}</button>`;}
function renderCalendar(){
  const month=calendarDate.getMonth(),year=calendarDate.getFullYear(),first=new Date(year,month,1,12);
  const start=calendarMode==='week' ? U.weekStart(calendarDate.getTime()) : U.weekStart(first.getTime());
  const total=calendarMode==='week' ? 7 : Math.ceil((((first.getDay()+6)%7)+new Date(year,month+1,0).getDate())/7)*7;
  const events=calendarEvents(),selected=events.filter(e=>e.eventDate===selectedDate);
  $('#calendar-title').textContent=calendarMode==='week' ? `${shortDate(start)} – ${shortDate(U.shift(start,6))}, ${year}` : calendarDate.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  $('[data-action="calendar-prev"]').setAttribute('aria-label',`Previous ${calendarMode==='week' ? 'week' : 'month'}`);$('[data-action="calendar-next"]').setAttribute('aria-label',`Next ${calendarMode==='week' ? 'week' : 'month'}`);
  document.querySelectorAll('[data-calendar-mode]').forEach(button=>{const active=button.dataset.calendarMode===calendarMode;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  if(calendarMode==='list'){
    const monthEvents=events.filter(e=>{const date=parseDate(e.eventDate);return date.getMonth()===month && date.getFullYear()===year;});
    $('#calendar-content').innerHTML=`<div class="calendar-list">${monthEvents.map(e=>`<div class="calendar-list-item"><div class="list-date"><strong>${parseDate(e.eventDate).getDate()}</strong><small>${parseDate(e.eventDate).toLocaleDateString('en-US',{weekday:'short'})}</small></div><span class="assignment-symbol" style="${colorStyle(e.subject)}">${icon(e.eventType==='task' ? 'check-circle' : 'book')}</span><div class="list-event-info"><button class="assignment-title-button" data-action="${e.eventType==='task' ? 'edit-task' : 'edit-assignment'}" data-id="${escapeHtml(e.id)}">${escapeHtml(e.title)}</button><small>${e.eventType==='task' ? 'Study task' : 'Deadline'} · ${escapeHtml(e.subject)}${e.eventTime ? ' · '+escapeHtml(e.eventTime) : ''}</small></div>${badge(e.priority)}${badge(e.done ? 'Completed' : e.eventType==='task' ? 'Planned' : e.status)}</div>`).join('') || emptyState('A little breathing room','Plan an assignment deadline or schedule a study task.','add-on-date','Plan a study task')}</div>`;
  }else{
    $('#calendar-content').innerHTML=`<div class="calendar-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-grid ${calendarMode==='week' ? 'calendar-week' : ''}">${Array.from({length:total},(_,index)=>{const key=U.shift(start,index),date=parseDate(key),items=events.filter(e=>e.eventDate===key);return `<div class="calendar-cell ${date.getMonth()!==month && calendarMode==='month' ? 'outside-month' : ''} ${key===todayKey() ? 'is-today' : ''} ${key===selectedDate ? 'selected' : ''}" data-calendar-day="${key}"><button class="day-number" data-action="select-day" data-date="${key}" aria-label="${escapeHtml(longDate(key))}, ${items.length} events" aria-pressed="${key===selectedDate}" ${key===todayKey() ? 'aria-current="date"' : ''}>${date.getDate()}</button>${items.slice(0,calendarMode==='week' ? 20 : 2).map(eventButton).join('')}${calendarMode==='month' && items.length>2 ? `<button class="calendar-more" data-action="select-day" data-date="${key}">+${items.length-2} more</button>` : ''}</div>`;}).join('')}</div><div class="calendar-legend"><span>▤ Assignment deadline</span><span>☑ Scheduled study task</span></div>`;
  }
  $('#agenda-title').textContent=`${shortDate(selectedDate)}, ${parseDate(selectedDate).getFullYear()}`;$('#agenda-date-label').textContent=`${selectedDate===todayKey() ? 'Today · ' : ''}${parseDate(selectedDate).toLocaleDateString('en-US',{weekday:'long'})}`;
  $('#agenda-list').innerHTML=selected.map(e=>`<div class="agenda-item" style="${colorStyle(e.subject)}"><strong>${escapeHtml(e.title)}</strong><small>${e.eventType==='task' ? 'Study task' : 'Assignment deadline'} · ${escapeHtml(e.subject)}${e.eventTime ? ' · '+escapeHtml(e.eventTime) : ''}</small>${badge(e.priority)} ${badge(e.done ? 'Completed' : e.eventType==='task' ? 'Planned' : e.status)}<div class="agenda-actions"><button class="text-button" data-action="${e.eventType==='task' ? 'edit-task' : 'edit-assignment'}" data-id="${escapeHtml(e.id)}">Edit details ${icon('arrow')}</button><button class="text-button" data-action="${e.eventType==='task' ? 'focus-task' : 'focus-assignment'}" data-id="${escapeHtml(e.id)}">${icon('play')}Focus</button></div></div>`).join('') || `<div class="agenda-empty">${icon('leaf')}<p>A little room to plan ahead.</p><button class="text-button" data-action="add-on-date">${icon('plus')}Schedule a study task</button></div>`;
}

function renderProgress() {
  stats();
  renderProgressDetails();
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

function renderProgressDetails(){
  const summary=P.summary(state),days=P.week(state),max=Math.max(1,...days.map(d=>Math.max(d.planned,d.completed)));
  $('#study-summary').textContent=`${summary.tasksCompleted} study tasks completed · ${summary.tasksPlanned} scheduled this week · ${summary.overdue} overdue assignments`;
  $('#planned-completed-chart').innerHTML=days.map(d=>`<div class="trend-row"><span>${escapeHtml(shortDate(d.date))}</span><div><div class="trend-bar planned" style="width:${d.planned/max*100}%"></div><div class="trend-bar finished" style="width:${d.completed/max*100}%"></div></div><small>${d.planned} planned / ${d.completed} done</small></div>`).join('');
  const subjects=[...new Set([...state.subjects,...state.focusSessions.map(s=>s.subject)])];
  $('#subject-focus').innerHTML=subjects.filter(subject=>state.focusSessions.some(s=>s.subject===subject)).map(subject=>`<div class="metric-row"><span>${escapeHtml(subject)}</span><strong>${state.focusSessions.filter(s=>s.subject===subject).reduce((sum,s)=>sum+s.minutes,0)} min</strong></div>`).join('') || '<p class="muted">Complete a linked focus session to see time by subject.</p>';
  $('#assignment-effort').innerHTML=state.assignments.map(a=>{const p=P.forAssignment(state,a.id);return `<div class="effort-row"><div><button class="assignment-title-button" data-action="edit-assignment" data-id="${escapeHtml(a.id)}">${escapeHtml(a.title)}</button><small>${p.done}/${p.tasks} study tasks completed · ${a.checklist.filter(c=>c.done).length}/${a.checklist.length} checklist steps</small></div><strong>${p.minutes} min<small>${a.estimatedHours ? a.estimatedHours+'h planned' : 'No effort estimate'}</small></strong></div>`;}).join('') || '<p class="muted">Add an assignment and link study tasks to see your progress.</p>';
}
function renderView(preserveFocus=false){
  const focused=preserveFocus && document.activeElement?.id,position=focused && document.activeElement.selectionStart;
  main.innerHTML=pageMarkup;heading();
  ({dashboard:renderDashboard,assignments:renderAssignments,calendar:renderCalendar,progress:renderProgress})[currentView]();
  hydrateIcons(main);updateTimerUI();updateNotificationBadge();
  if(focused){const input=document.getElementById(focused);if(input){input.focus({preventScroll:true});if(typeof position==='number' && ['text','search'].includes(input.type))input.setSelectionRange(position,position);}}
}
function subjectOptions(select,value='',includeNew=true){select.innerHTML='<option value="">Choose a subject</option>'+state.subjects.map(s=>`<option>${escapeHtml(s)}</option>`).join('')+(includeNew ? '<option value="__new__">+ Add a new subject…</option>' : '');select.value=value;}
function checklistRow(item={id:U.id(),title:'',done:false}){return `<div class="checklist-edit-row" data-checklist-id="${escapeHtml(item.id)}"><input type="checkbox" aria-label="Checklist step complete" ${item.done ? 'checked' : ''}><input class="checklist-title" type="text" maxlength="120" placeholder="A small, clear step" value="${escapeHtml(item.title)}" aria-label="Checklist step title"><button type="button" class="icon-button" data-remove-step aria-label="Remove checklist step">${icon('x')}</button></div>`;}
function openAssignment(id=null,dueDate=null){
  const a=id ? state.assignments.find(item=>item.id===id) : null;if(id && !a)return;
  $('#assignment-form').reset();$('#assignment-title').setCustomValidity('');$('#assignment-id').value=a?.id || '';$('#assignment-revision').value=a ? a.revision : '';
  $('#assignment-dialog-title').textContent=a ? 'Edit assignment' : 'Add an assignment';$('#save-assignment').textContent=a ? 'Save changes' : 'Add assignment';
  for(const [field,value] of Object.entries({title:a?.title || '',date:a?.dueDate || dueDate || todayKey(),time:a?.dueTime || '',hours:a?.estimatedHours || '',priority:a?.priority || 'Medium',status:a?.status || 'Not Started',notes:a?.notes || ''}))$('#assignment-'+field).value=value;
  subjectOptions($('#assignment-subject'),a?.subject || '');$('#assignment-custom-subject-wrap').hidden=true;$('#assignment-custom-subject').value='';
  $('#checklist-editor').innerHTML=(a?.checklist || []).map(checklistRow).join('');$('#notes-count').textContent=$('#assignment-notes').value.length;
  closeNotifications();$('#assignment-dialog').showModal();$('#assignment-title').focus();
}
function updateTaskSubject(){const a=state.assignments.find(item=>item.id===$('#task-assignment').value);$('#task-subject').disabled=Boolean(a);if(a){$('#task-subject').value=a.subject;$('#task-custom-subject-wrap').hidden=true;}}
function openTask(id=null,assignmentId=null,date=null){
  const task=id ? state.tasks.find(t=>t.id===id) : null;if(id && !task)return;
  $('#task-form').reset();$('#task-title').setCustomValidity('');$('#task-id').value=task?.id || '';$('#task-revision').value=task ? task.revision : '';
  $('#task-dialog-title').textContent=task ? 'Edit study task' : 'Plan a study task';$('#save-task').textContent=task ? 'Save changes' : 'Add task';
  $('#task-title').value=task?.title || '';$('#task-date').value=task?.date || date || todayKey();$('#task-time').value=task?.time || '';$('#task-priority').value=task?.priority || 'Medium';$('#task-done').checked=Boolean(task?.done);
  subjectOptions($('#task-subject'),task?.subject || state.subjects[0]);$('#task-custom-subject-wrap').hidden=true;$('#task-custom-subject').value='';
  $('#task-assignment').innerHTML='<option value="">No related assignment</option>'+state.assignments.map(a=>`<option value="${escapeHtml(a.id)}">${escapeHtml(a.title)}</option>`).join('');$('#task-assignment').value=task?.assignmentId || assignmentId || '';updateTaskSubject();
  $('#task-dialog').showModal();$('#task-title').focus();
}
function subjectFor(prefix){const value=$('#'+prefix+'-subject').value;if(value!=='__new__')return {subject:value,operations:[]};const entered=U.text($('#'+prefix+'-custom-subject').value,'Subject',50);const existing=state.subjects.find(s=>s.toLowerCase()===entered.toLowerCase());return {subject:existing || entered,operations:existing ? [] : [{type:'subject:add',name:entered}]};}
function confirmAction(title,message,callback,label='Confirm'){$('#confirm-title').textContent=title;$('#confirm-message').textContent=message;$('#confirm-accept').textContent=label;confirmation=callback;$('#confirm-dialog').showModal();}
async function deleteRecord(kind,id){
  const key=kind==='assignment' ? 'assignments' : 'tasks',record=state[key].find(item=>item.id===id);if(!record)return;
  confirmAction('Delete '+kind+'?',`“${record.title}” will be removed.${kind==='assignment' ? ' Linked study tasks will be kept and unlinked.' : ''} You can undo immediately after deleting.`,async()=>{
    const result=await commit({type:kind+':delete',id,expectedRevision:record.revision});
    if(result)toast(kind==='assignment' ? 'Assignment deleted.' : 'Study task deleted.',()=>commit({type:kind+':restore',record},'Record restored.'));
  },'Delete');
}
function closeNotifications(){$('#notifications').hidden=true;$('#notification-button').setAttribute('aria-expanded','false');}
function updateNotificationBadge(){const unread=R.list(state).filter(r=>!r.read).length;$('#notification-dot').hidden=!unread;$('#notification-button').setAttribute('aria-label',`Notifications${unread ? ', '+unread+' unread' : ''}`);}
function toggleNotifications(){
  if(!$('#notifications').hidden){closeNotifications();return;}
  const reminders=R.list(state);
  $('#notifications').innerHTML=`<div class="popover-title"><h3>Deadline reminders</h3><button class="text-button" id="mark-read">Mark as read</button></div><p class="popover-note">Alerts update while StudySprint is open.</p>${reminders.map(r=>`<button class="notification-item ${r.read ? 'notification-read' : ''}" data-notification-id="${escapeHtml(r.assignmentId)}"><span class="notification-icon">${icon(r.overdue ? 'clock' : 'calendar')}</span><span><strong>${escapeHtml(r.title)}</strong><small>${escapeHtml(r.message)} · ${escapeHtml(shortDate(r.dueDate))}${r.dueTime ? ' '+escapeHtml(r.dueTime) : ''}</small></span></button>`).join('') || '<div class="empty-state"><p>No alerts right now. Set reminder intervals in your profile.</p></div>'}`;
  $('#notifications').hidden=false;$('#notification-button').setAttribute('aria-expanded','true');
}
function updateTimerUI(){
  const display=$('#timer-display');if(!display)return;
  const seconds=F.remaining(timer);display.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  $('#timer-progress').style.strokeDashoffset=String(439.823*(1-seconds/(timer.minutes*60)));
  $('#timer-caption').textContent=timer.kind==='focus' ? (timer.running ? 'One thing at a time. You’re making progress.' : 'Choose a task, then find your focus.') : timer.kind==='short-break' ? 'A short pause to recharge.' : 'You’ve earned a longer break.';
  $('#timer-toggle').innerHTML=icon(timer.running ? 'pause' : 'play')+(timer.running ? 'Pause session' : seconds<timer.minutes*60 ? 'Resume session' : timer.kind==='focus' ? 'Start focus session' : 'Start break');
  for(const id of ['timer-duration','timer-kind','focus-context'])$('#'+id).disabled=timer.running;
}
async function tickTimer(){
  if(!appReady)return;
  if(todayKey()!==lastDay){lastDay=todayKey();renderView();updateNotificationBadge();}
  updateTimerUI();
  if(timer.running && F.remaining(timer)===0 && !finishingTimer){finishingTimer=true;const result=await commit({type:'timer:finish',timerId:timer.id});if(result?.changed)toast('Session complete. Your focus time is saved once. Take a breath.');finishingTimer=false;}
}
async function configureFocus(assignmentId=null,taskId=null){
  if(timer.running){toast('Pause the current session before choosing another focus task.');return;}
  const result=await commit({type:'timer:control',action:'configure',timerId:timer.id,kind:'focus',minutes:state.settings.focusMinutes,assignmentId,taskId});
  if(result){if(currentView!=='dashboard')pendingSave.then(()=>location.assign('index.html#focus-card'));else startFocus();}
}
function startFocus(){if(currentView!=='dashboard'){pendingSave.then(()=>location.assign('index.html#focus-card'));return;}$('#focus-card').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'center'});$('#timer-toggle').focus({preventScroll:true});}
function renderSubjects(){$('#subject-list').innerHTML=state.subjects.map(subject=>`<div class="subject-chip"><span>${escapeHtml(subject)}</span><button type="button" class="icon-button" data-remove-subject="${escapeHtml(subject)}" aria-label="Remove subject ${escapeHtml(subject)}">${icon('x')}</button></div>`).join('');}
function openProfile(){
  closeNotifications();$('#settings-name').value=state.profile.name;$('#settings-course').value=state.profile.course;$('#settings-goal').value=state.profile.goal;
  for(const key of ['focusMinutes','shortBreak','longBreak','longBreakEvery'])$('#settings-'+key).value=state.settings[key];
  $('#settings-reminders').checked=state.settings.remindersEnabled;document.querySelectorAll('[name="reminder-day"]').forEach(input=>input.checked=state.settings.reminderDays.includes(Number(input.value)));
  renderSubjects();$('#profile-dialog').showModal();
}
function download(name,text){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function exportData(raw=false){try{const data=raw ? await repository.raw() : await repository.read();download(`StudySprint-${raw ? 'original-data-' : 'backup-'}${todayKey()}.json`,raw ? (typeof data==='string' ? data : JSON.stringify(data,null,2)) : M.exportBackup(data));toast('Backup downloaded. Keep a copy outside this browser.');}catch(error){toast(error.message);}}
async function importFile(file){
  if(!file)return;if(file.size>5*1024*1024){toast('Choose a JSON backup smaller than 5 MB.');return;}
  try{importWorkspace=M.parseBackup(await file.text());$('#import-summary').textContent=`${importWorkspace.assignments.length} assignments, ${importWorkspace.tasks.length} tasks, and ${importWorkspace.focusSessions.length} focus sessions. Current workspace: ${state.assignments.length} assignments and ${state.tasks.length} tasks.`;$('#import-mode-merge').checked=true;$('#import-dialog').showModal();}catch(error){toast(error.message);}finally{$('#import-file').value='';}
}

main.addEventListener('click',async event=>{
  const tab=event.target.closest('[data-filter-status]');if(tab){filters.status=tab.dataset.filterStatus;renderView();[...main.querySelectorAll('[data-filter-status]')].find(t=>t.dataset.filterStatus===filters.status)?.focus({preventScroll:true});return;}
  const view=event.target.closest('[data-calendar-mode]');if(view){calendarMode=view.dataset.calendarMode;renderView();return;}
  const button=event.target.closest('[data-action]');if(!button){const cell=event.target.closest('[data-calendar-day]');if(cell){selectedDate=cell.dataset.calendarDay;calendarDate=parseDate(selectedDate);renderView();}return;}
  const action=button.dataset.action,id=button.dataset.id;
  if(action==='add-assignment')openAssignment();else if(action==='edit-assignment')openAssignment(id);
  else if(action==='delete-assignment')deleteRecord('assignment',id);else if(action==='delete-task')deleteRecord('task',id);
  else if(action==='add-task')openTask();else if(action==='edit-task')openTask(id);else if(action==='plan-task')openTask(null,id);
  else if(action==='add-on-date')openTask(null,null,selectedDate);
  else if(action==='focus-task')configureFocus(null,id);else if(action==='focus-assignment')configureFocus(id,null);else if(action==='focus')startFocus();
  else if(action==='clear-filters'){filters={status:'All',subject:'All',priority:'All',sort:'due-asc',search:''};$('#global-search').value='';const url=new URL(location.href);url.searchParams.delete('q');history.replaceState(null,'',url);renderView();}
  else if(action==='toggle-timer')await commit({type:'timer:control',action:timer.running ? 'pause' : 'start',timerId:timer.id});
  else if(action==='reset-timer')await commit({type:'timer:control',action:'reset',timerId:timer.id},'Timer reset.');
  else if(action==='load-demo')await commit({type:'data:demo'},'Sample workspace loaded. Sample records are labeled.');
  else if(action==='select-day'){selectedDate=button.dataset.date;calendarDate=parseDate(selectedDate);renderView();}
  else if(action==='calendar-today'){calendarDate=parseDate(todayKey());selectedDate=todayKey();renderView();}
  else if(action==='calendar-prev' || action==='calendar-next'){const direction=action==='calendar-prev' ? -1 : 1;calendarDate=calendarMode==='week' ? parseDate(U.shift(U.dateKey(calendarDate),direction*7)) : new Date(calendarDate.getFullYear(),calendarDate.getMonth()+direction,1,12);selectedDate=U.dateKey(calendarDate);renderView();}
});
main.addEventListener('change',async event=>{
  const target=event.target;
  if(target.matches('[data-task-id]')){const t=state.tasks.find(item=>item.id===target.dataset.taskId);if(t)await commit({type:'task:put',record:{...t,done:target.checked},expectedRevision:t.revision},target.checked ? 'Study task completed.' : 'Study task reopened.');}
  else if(target.matches('[data-status-id]')){const a=state.assignments.find(item=>item.id===target.dataset.statusId);if(a)await commit({type:'assignment:put',record:{...a,status:target.value},expectedRevision:a.revision},'Assignment status updated.');}
  else if(target.id==='task-view'){taskView=target.value;renderView();}
  else if(['filter-subject','filter-priority','filter-sort'].includes(target.id)){filters[target.id.replace('filter-','')]=target.value;renderView(true);}
  else if(['timer-duration','timer-kind','focus-context'].includes(target.id)){
    const context=$('#focus-context').value,[type,id]=context.split(':');const kind=$('#timer-kind').value;
    await commit({type:'timer:control',action:'configure',timerId:timer.id,kind,minutes:target.id==='timer-kind' ? (kind==='focus' ? state.settings.focusMinutes : kind==='short-break' ? state.settings.shortBreak : state.settings.longBreak) : Number($('#timer-duration').value),assignmentId:type==='assignment' ? id : null,taskId:type==='task' ? id : null});
  }
});
main.addEventListener('input',event=>{if(event.target.id==='assignment-search'){filters.search=event.target.value;$('#global-search').value=filters.search;renderView(true);}});
$('#assignment-form').addEventListener('submit',async event=>{
  event.preventDefault();const button=$('#save-assignment');if(button.disabled)return;button.disabled=true;
  try{const subject=subjectFor('assignment');const record={id:$('#assignment-id').value || U.id(),title:$('#assignment-title').value,subject:subject.subject,dueDate:$('#assignment-date').value,dueTime:$('#assignment-time').value,estimatedHours:$('#assignment-hours').value,priority:$('#assignment-priority').value,status:$('#assignment-status').value,notes:$('#assignment-notes').value,checklist:[...document.querySelectorAll('.checklist-edit-row')].map(row=>({id:row.dataset.checklistId,title:$('.checklist-title',row).value,done:$('input[type="checkbox"]',row).checked}))};
    const result=await commit({type:'batch',operations:[...subject.operations,{type:'assignment:put',record,expectedRevision:$('#assignment-id').value ? Number($('#assignment-revision').value) : null}]},'Assignment saved.');if(result)$('#assignment-dialog').close();
  }catch(error){toast(error.message);}finally{button.disabled=false;}
});
$('#task-form').addEventListener('submit',async event=>{
  event.preventDefault();const button=$('#save-task');if(button.disabled)return;button.disabled=true;
  try{const subject=subjectFor('task');const record={id:$('#task-id').value || U.id(),title:$('#task-title').value,subject:subject.subject,date:$('#task-date').value,time:$('#task-time').value,priority:$('#task-priority').value,assignmentId:$('#task-assignment').value || null,done:$('#task-done').checked};
    const result=await commit({type:'batch',operations:[...subject.operations,{type:'task:put',record,expectedRevision:$('#task-id').value ? Number($('#task-revision').value) : null}]},'Study task saved.');if(result)$('#task-dialog').close();
  }catch(error){toast(error.message);}finally{button.disabled=false;}
});
$('#assignment-notes').addEventListener('input',event=>$('#notes-count').textContent=event.target.value.length);
$('#add-checklist-step').addEventListener('click',()=>{if(document.querySelectorAll('.checklist-edit-row').length>=50){toast('Use up to 50 checklist steps.');return;}$('#checklist-editor').insertAdjacentHTML('beforeend',checklistRow());$('#checklist-editor').lastElementChild.querySelector('.checklist-title').focus();});
$('#checklist-editor').addEventListener('click',event=>{if(event.target.closest('[data-remove-step]'))event.target.closest('.checklist-edit-row').remove();});
for(const prefix of ['assignment','task'])$('#'+prefix+'-subject').addEventListener('change',event=>{$('#'+prefix+'-custom-subject-wrap').hidden=event.target.value!=='__new__';if(event.target.value==='__new__')$('#'+prefix+'-custom-subject').focus();});
$('#task-assignment').addEventListener('change',updateTaskSubject);
$('#profile-button').addEventListener('click',openProfile);
$('#profile-form').addEventListener('submit',async event=>{
  event.preventDefault();const button=$('#save-profile');if(button.disabled)return;button.disabled=true;
  const settings={remindersEnabled:$('#settings-reminders').checked,reminderDays:[...document.querySelectorAll('[name="reminder-day"]:checked')].map(input=>Number(input.value))};for(const key of ['focusMinutes','shortBreak','longBreak','longBreakEvery'])settings[key]=Number($('#settings-'+key).value);
  const result=await commit({type:'batch',operations:[{type:'profile:update',profile:{name:$('#settings-name').value,course:$('#settings-course').value,goal:Number($('#settings-goal').value)}},{type:'settings:update',settings}]},'Preferences saved.');button.disabled=false;if(result)$('#profile-dialog').close();
});
$('#add-subject').addEventListener('click',async()=>{const result=await commit({type:'subject:add',name:$('#new-subject').value},'Subject added.');if(result){$('#new-subject').value='';renderSubjects();}});
$('#subject-list').addEventListener('click',async event=>{const button=event.target.closest('[data-remove-subject]');if(button){const result=await commit({type:'subject:remove',name:button.dataset.removeSubject},'Subject removed.');if(result)renderSubjects();}});
$('#export-data').addEventListener('click',()=>exportData());$('#import-data').addEventListener('click',()=>$('#import-file').click());$('#import-file').addEventListener('change',event=>importFile(event.target.files[0]));
$('#import-form').addEventListener('submit',async event=>{event.preventDefault();const mode=$('[name="import-mode"]:checked').value;const result=await commit({type:'data:import',mode,workspace:importWorkspace},'Backup imported.');if(result){$('#import-dialog').close();$('#profile-dialog').close();importWorkspace=null;}});
$('#recover-data').addEventListener('click',()=>confirmAction('Restore the previous snapshot?','This restores the workspace from before the last saved change. Export your current data first if you want to keep both versions.',async()=>{try{applyState(await repository.recover());$('#profile-dialog').close();toast('Previous snapshot restored.');}catch(error){toast(error.message);}},'Restore snapshot'));
$('#load-demo').addEventListener('click',()=>commit({type:'data:demo'},'Labeled sample records added.'));
$('#clear-demo').addEventListener('click',()=>confirmAction('Remove sample records?','Only records labeled Sample will be removed. Your own assignments, tasks, and focus history will be kept.',()=>commit({type:'data:clear-demo'},'Sample records removed.'),'Remove sample records'));
$('#confirm-accept').addEventListener('click',async()=>{const callback=confirmation;confirmation=null;$('#confirm-dialog').close();await callback?.();});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)dialog.close();}}));
$('#global-search').addEventListener('input',event=>{if(currentView==='assignments'){filters={...filters,search:event.target.value,status:'All',subject:'All',priority:'All'};renderView();}});
$('#global-search-form').addEventListener('submit',event=>{event.preventDefault();const query=$('#global-search').value.trim();if(currentView==='assignments'){filters.search=query;renderView();}else pendingSave.catch(()=>{}).then(()=>location.assign('assignments.html?'+new URLSearchParams({q:query})));});
$('#notification-button').addEventListener('click',toggleNotifications);$('#notifications').addEventListener('click',event=>{const button=event.target.closest('[data-notification-id]');if(button)openAssignment(button.dataset.notificationId);if(event.target.closest('#mark-read'))commit({type:'alerts:read',keys:R.list(state).map(r=>r.key)},'Reminders marked as read.').then(closeNotifications);});
document.addEventListener('click',event=>{
  if(!event.target.closest('.notification-wrap'))closeNotifications();
  const link=event.target.closest('a[href]');if(!link || event.defaultPrevented || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download'))return;
  const url=new URL(link.href,location.href);if(Object.values(PAGE_URLS).some(file=>url.pathname.endsWith('/'+file)) && url.origin===location.origin){event.preventDefault();pendingSave.catch(()=>{}).then(()=>location.assign(url.href));}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNotifications();if(event.key==='/' && !event.ctrlKey && !event.metaKey && !event.target.closest('input,textarea,select,[contenteditable]') && !document.querySelector('dialog[open]')){event.preventDefault();$('#global-search').focus();}});
$('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView({block:'start'});});
main.addEventListener('keydown',event=>{const tab=event.target.closest('[data-filter-status]');if(!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...main.querySelectorAll('[data-filter-status]')],index=tabs.indexOf(tab),next=event.key==='Home' ? 0 : event.key==='End' ? tabs.length-1 : (index+(event.key==='ArrowRight' ? 1 : -1)+tabs.length)%tabs.length;tabs[next].click();});
async function refreshState(){try{const latest=await repository.read();if(latest.revision>state.revision)applyState(latest);}catch{/* User save/recovery actions surface persistent errors. */}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshState().then(tickTimer);});
window.addEventListener('focus',refreshState);
repository.subscribe(next=>{if(appReady && next.revision>state.revision)applyState(next);});
async function initialize(){
  hydrateIcons();document.body.dataset.ready='false';
  try{applyState(await repository.read());$('#global-search').value=filters.search;await tickTimer();if(currentView==='dashboard' && location.hash==='#focus-card')startFocus();}
  catch(error){main.insertAdjacentHTML('afterbegin',`<section class="storage-error" role="alert"><h2>Your saved data needs attention</h2><p>${escapeHtml(error.message)}</p><p>No existing records have been replaced. Export the original data or import a valid backup.</p><button class="button secondary" id="export-original">Export original data</button><button class="button primary" id="import-recovery">Import backup</button><button class="button secondary" id="recover-original">Restore previous snapshot</button></section>`);$('#export-original').addEventListener('click',()=>exportData(true));$('#import-recovery').addEventListener('click',()=>$('#import-file').click());$('#recover-original').addEventListener('click',async()=>{try{applyState(await repository.recover());toast('Previous snapshot restored.');}catch(error){toast(error.message);}});updateStorageLabel('Recovery needed',true);}
  setInterval(tickTimer,1000);setInterval(()=>{refreshState();updateNotificationBadge();},15000);
}
initialize();
})();
