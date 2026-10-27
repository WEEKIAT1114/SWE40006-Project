(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./utils.js') : root.StudySprint.utils);
  if (typeof module === 'object' && module.exports) module.exports = api; else root.StudySprint.assignments = api;
})(globalThis, function (u) {
  'use strict';
  const statuses = ['Not Started','In Progress','Completed'];
  const priorities = ['High','Medium','Low'];
  function validate(input, subjects) {
    const subject = u.text(input.subject,'Subject',50);
    if (!subjects.includes(subject)) throw new u.ValidationError('Add this subject before using it.');
    const checklist = input.checklist || [];
    if (!Array.isArray(checklist) || checklist.length > 50) throw new u.ValidationError('Use at most 50 checklist steps.');
    const steps=checklist.map(item=>({id:u.recordId(item.id || u.id(),'Checklist ID'),title:u.text(item.title,'Checklist step',120),done:Boolean(item.done)}));
    if(new Set(steps.map(item=>item.id)).size!==steps.length)throw new u.ValidationError('Checklist step IDs must be unique.');
    return {title:u.text(input.title,'Assignment title',120),subject,dueDate:u.date(input.dueDate,'Due date'),dueTime:u.time(input.dueTime || ''),
      priority:u.choice(input.priority,priorities,'priority'),status:u.choice(input.status,statuses,'status'),notes:u.text(input.notes || '','Notes',500,true),
      estimatedHours:u.number(input.estimatedHours || 0,'Estimated hours',0,1000),checklist:steps};
  }
  function dueAt(item) { return new Date(`${item.dueDate}T${item.dueTime || '23:59'}:00`).getTime(); }
  function overdue(item, now = Date.now()) { return item.status !== 'Completed' && dueAt(item) < now; }
  function put(state, operation, now) {
    const index = state.assignments.findIndex(item=>item.id === operation.record.id);
    const existing = state.assignments[index];
    u.version(existing,operation.expectedRevision);
    const data = validate(operation.record,state.subjects);
    const record = {...data,id:u.recordId(operation.record.id || u.id(),'Assignment ID'),...u.stamp(existing,now),isDemo:Boolean(existing?.isDemo || operation.record.isDemo),completedAt:data.status === 'Completed' ? existing?.completedAt || u.today(now) : null};
    if (existing) state.assignments[index] = record; else state.assignments.push(record);
    return record;
  }
  return {statuses,priorities,validate,dueAt,overdue,put};
});
