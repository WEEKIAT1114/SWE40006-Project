// Assignment rules: validate records, calculate deadlines, and save revisions.
(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./utils.js') : root.StudySprint.utils
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.StudySprint.assignments = api;
  }
})(globalThis, function (utils) {
  'use strict';
  const statuses = ['Not Started', 'In Progress', 'Completed'];
  const priorities = ['High', 'Medium', 'Low'];

  // Assignment validation: check the form data before it enters the workspace.
  function validate(input, subjects) {
    const subject = utils.text(input.subject, 'Subject', 50);

    if (!subjects.includes(subject)) {
      throw new utils.ValidationError('Add this subject before using it.');
    }
    const checklist = input.checklist || [];

    if (!Array.isArray(checklist) || checklist.length > 50) {
      throw new utils.ValidationError('Use at most 50 checklist steps.');
    }

    const steps = checklist.map((item) => ({
      id: utils.recordId(item.id || utils.id(), 'Checklist ID'),
      title: utils.text(item.title, 'Checklist step', 120),
      done: Boolean(item.done),
    }));

    if (new Set(steps.map((item) => item.id)).size !== steps.length) {
      throw new utils.ValidationError('Checklist step IDs must be unique.');
    }

    return {
      title: utils.text(input.title, 'Assignment title', 120),
      subject,
      dueDate: utils.date(input.dueDate, 'Due date'),
      dueTime: utils.time(input.dueTime || ''),
      priority: utils.choice(input.priority, priorities, 'priority'),
      status: utils.choice(input.status, statuses, 'status'),
      notes: utils.text(input.notes || '', 'Notes', 500, true),
      estimatedHours: utils.number(input.estimatedHours || 0, 'Estimated hours', 0, 1000),
      checklist: steps,
    };
  }

  // Deadline calculation: a date without a time stays due until 23:59 that day.
  function dueAt(item) {
    return new Date(`${item.dueDate}T${item.dueTime || '23:59'}:00`).getTime();
  }

  function overdue(item, now = Date.now()) {
    return item.status !== 'Completed' && dueAt(item) < now;
  }

  // Assignment save: reject stale edits and track when completion changes.
  function put(state, operation, now) {
    const index = state.assignments.findIndex((item) => item.id === operation.record.id);
    const existing = state.assignments[index];
    utils.version(existing, operation.expectedRevision);
    const data = validate(operation.record, state.subjects);
    const record = {
      ...data,
      id: utils.recordId(operation.record.id || utils.id(), 'Assignment ID'),
      ...utils.stamp(existing, now),
      isDemo: Boolean(existing?.isDemo || operation.record.isDemo),
      completedAt: data.status === 'Completed' ? existing?.completedAt || utils.today(now) : null,
    };
    if (existing) {
      state.assignments[index] = record;
    } else {
      state.assignments.push(record);
    }
    return record;
  }
  return { statuses, priorities, validate, dueAt, overdue, put };
});
