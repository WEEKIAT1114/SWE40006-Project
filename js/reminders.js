(function (root, factory) {
  const isNode=typeof module === 'object' && module.exports;
  const api=factory(isNode ? require('./utils.js') : root.StudySprint.utils,isNode ? require('./assignments.js') : root.StudySprint.assignments);
  if(isNode) module.exports=api;else root.StudySprint.reminders=api;
})(globalThis,function(u,assignments){
  'use strict';
  function list(state,now=Date.now()) {
    if(!state.settings.remindersEnabled)return [];
    const days=[...state.settings.reminderDays].sort((a,b)=>a-b);
    return state.assignments.filter(item=>item.status !== 'Completed').map(item=>{
      const diff=u.daysBetween(u.today(now),item.dueDate);const overdue=assignments.overdue(item,now);
      const stage=overdue ? 'overdue' : days.find(day=>diff <= day);
      if(stage === undefined)return null;
      const key=`${item.id}:${item.dueDate}:${item.dueTime || ''}:${stage}`;
      return {key,assignmentId:item.id,title:item.title,subject:item.subject,dueDate:item.dueDate,dueTime:item.dueTime,overdue,
        message:overdue ? 'Overdue — review your next step' : diff === 0 ? 'Due today' : diff === 1 ? 'Due tomorrow' : `Due in ${diff} days`,read:Boolean(state.dismissedAlerts[key])};
    }).filter(Boolean).sort((a,b)=>a.dueDate.localeCompare(b.dueDate) || a.dueTime.localeCompare(b.dueTime));
  }
  return {list};
});
