(function (root, factory) {
  const isNode = typeof module === 'object' && module.exports;
  const api = factory(isNode ? require('./utils.js') : root.StudySprint.utils,isNode ? require('./assignments.js') : root.StudySprint.assignments);
  if (isNode) module.exports = api; else root.StudySprint.progress = api;
})(globalThis, function (u, assignments) {
  'use strict';
  function summary(state, now = Date.now()) {
    const today = u.today(now);const start=u.weekStart(now);
    const completed=state.assignments.filter(item=>item.status === 'Completed').length;
    return {total:state.assignments.length,completed,percent:state.assignments.length ? Math.round(completed/state.assignments.length*100) : 0,
      overdue:state.assignments.filter(item=>assignments.overdue(item,now)).length,
      dueSoon:state.assignments.filter(item=>item.status !== 'Completed' && item.dueDate <= u.shift(today,7)).length,
      tasksDue:state.tasks.filter(item=>!item.done && item.date <= today).length,
      tasksPlanned:state.tasks.filter(item=>item.date >= start && item.date <= u.shift(start,6)).length,
      tasksCompleted:state.tasks.filter(item=>item.done && item.completedAt >= start && item.completedAt <= u.shift(start,6)).length,
      weeklyCompleted:state.assignments.filter(item=>item.status === 'Completed' && item.completedAt >= start && item.completedAt <= today).length,
      focusToday:state.focusSessions.filter(item=>item.date === today).length,
      minutes:state.focusSessions.reduce((sum,item)=>sum+item.minutes,0),
      weeklyMinutes:state.focusSessions.filter(item=>item.date >= start && item.date <= u.shift(start,6)).reduce((sum,item)=>sum+item.minutes,0)};
  }
  function week(state, now=Date.now()) {
    const start=u.weekStart(now);
    return Array.from({length:7},(_,index)=>{const date=u.shift(start,index);return {date,planned:state.tasks.filter(item=>item.date === date).length,completed:state.tasks.filter(item=>item.done && item.completedAt === date).length,assignments:state.assignments.filter(item=>item.status === 'Completed' && item.completedAt === date).length,minutes:state.focusSessions.filter(item=>item.date === date).reduce((sum,item)=>sum+item.minutes,0)};});
  }
  function forAssignment(state,id) { const tasks=state.tasks.filter(item=>item.assignmentId === id);return {tasks:tasks.length,done:tasks.filter(item=>item.done).length,minutes:state.focusSessions.filter(item=>item.assignmentId === id).reduce((sum,item)=>sum+item.minutes,0)}; }
  return {summary,week,forAssignment};
});
