(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./utils.js') : root.StudySprint.utils
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.StudySprint.tasks = api;
  }
})(globalThis, function (utils) {
  'use strict';

  function validate(input, state) {
    const assignmentId = input.assignmentId || null;
    const related = state.assignments.find((item) => item.id === assignmentId);

    if (assignmentId && !related) {
      throw new utils.ValidationError('The related assignment no longer exists.');
    }
    const subject = related?.subject || utils.text(input.subject, 'Subject', 50);

    if (!state.subjects.includes(subject)) {
      throw new utils.ValidationError('Choose or add a subject.');
    }

    return {
      title: utils.text(input.title, 'Study task title', 100),
      subject,
      date: utils.date(input.date, 'Task date'),
      time: utils.time(input.time || ''),
      priority: utils.choice(input.priority || 'Medium', ['High', 'Medium', 'Low'], 'priority'),
      assignmentId,
      done: Boolean(input.done),
    };
  }

  function put(state, operation, now) {
    const index = state.tasks.findIndex((item) => item.id === operation.record.id);
    const existing = state.tasks[index];
    utils.version(existing, operation.expectedRevision);
    const data = validate(operation.record, state);
    const record = {
      ...data,
      id: utils.recordId(operation.record.id || utils.id(), 'Task ID'),
      ...utils.stamp(existing, now),
      isDemo: Boolean(existing?.isDemo || operation.record.isDemo),
      completedAt: data.done ? existing?.completedAt || utils.today(now) : null,
    };
    if (existing) {
      state.tasks[index] = record;
    } else {
      state.tasks.push(record);
    }
    return record;
  }

  function list(state, view = 'today', now = Date.now()) {
    const today = utils.today(now);
    return state.tasks
      .filter((task) => {
        switch (view) {
          case 'all':
            return true;
          case 'completed':
            return task.done;
          case 'upcoming':
            return !task.done && task.date > today;
          case 'overdue':
            return !task.done && task.date < today;
          default:
            // Today also carries unfinished work forward from earlier dates.
            return task.date === today || (!task.done && task.date < today);
        }
      })
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.time.localeCompare(b.time) ||
          a.title.localeCompare(b.title)
      );
  }
  return { validate, put, list };
});
