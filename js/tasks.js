(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./utils.js') : root.StudySprint.utils);
  if (typeof module === 'object' && module.exports) module.exports = api; else root.StudySprint.tasks = api;
})(globalThis, function (u) {
  'use strict';
  function validate(input, state) {
    const assignmentId = input.assignmentId || null;
    const related = state.assignments.find(item=>item.id === assignmentId);
    if (assignmentId && !related) throw new u.ValidationError('The related assignment no longer exists.');
    const subject = related?.subject || u.text(input.subject,'Subject',50);
    if (!state.subjects.includes(subject)) throw new u.ValidationError('Choose or add a subject.');
    return {title:u.text(input.title,'Study task title',100),subject,date:u.date(input.date,'Task date'),time:u.time(input.time || ''),
      priority:u.choice(input.priority || 'Medium',['High','Medium','Low'],'priority'),assignmentId,done:Boolean(input.done)};
  }
  function put(state, operation, now) {
    const index = state.tasks.findIndex(item=>item.id === operation.record.id); const existing = state.tasks[index];
    u.version(existing,operation.expectedRevision);
    const data = validate(operation.record,state);
    const record = {...data,id:u.recordId(operation.record.id || u.id(),'Task ID'),...u.stamp(existing,now),isDemo:Boolean(existing?.isDemo || operation.record.isDemo),completedAt:data.done ? existing?.completedAt || u.today(now) : null};
    if (existing) state.tasks[index] = record; else state.tasks.push(record);
    return record;
  }
  function list(state, view = 'today', now = Date.now()) {
    const today = u.today(now);
    return state.tasks.filter(item=>view === 'all' || (view === 'completed' ? item.done : view === 'upcoming' ? !item.done && item.date > today : view === 'overdue' ? !item.done && item.date < today : item.date === today || (!item.done && item.date < today)))
      .sort((a,b)=>a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.title.localeCompare(b.title));
  }
  return {validate,put,list};
});
