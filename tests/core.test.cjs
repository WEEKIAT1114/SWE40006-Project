const { test } = require('node:test');
const assert = require('node:assert/strict');
const utils = require('../js/utils.js'),
  workspaceModel = require('../js/model.js'),
  assignmentModel = require('../js/assignments.js'),
  taskModel = require('../js/tasks.js'),
  timerModel = require('../js/timer.js'),
  progressModel = require('../js/progress.js'),
  reminderModel = require('../js/reminders.js');
const NOW = new Date(2026, 9, 27, 12).getTime();
const assignment = (extra = {}) => ({
  id: utils.id(),
  title: 'Software project',
  subject: 'Computer Science',
  dueDate: '2026-11-03',
  dueTime: '17:00',
  priority: 'High',
  status: 'Not Started',
  estimatedHours: 6,
  notes: '',
  checklist: [],
  ...extra,
});
const task = (extra = {}) => ({
  id: utils.id(),
  title: 'Research requirements',
  subject: 'Computer Science',
  date: '2026-10-27',
  time: '10:00',
  priority: 'Medium',
  done: false,
  ...extra,
});
const putA = (state, record = assignment(), expectedRevision = null) =>
  workspaceModel.apply(state, { type: 'assignment:put', record, expectedRevision }, NOW).state;
const putT = (state, record = task(), expectedRevision = null) =>
  workspaceModel.apply(state, { type: 'task:put', record, expectedRevision }, NOW).state;

test('fresh workspaces are empty and use Student', () => {
  const s = workspaceModel.empty();
  assert.equal(s.profile.name, 'Student');
  assert.equal(s.assignments.length, 0);
  assert.equal(s.tasks.length, 0);
});
test('dates validate leap years and reject invalid dates', () => {
  assert.equal(utils.validDate('2028-02-29'), true);
  for (const date of ['2026-02-29', '2026-04-31', 'bad', '2026-13-01']) {
    assert.equal(utils.validDate(date), false);
  }
});
test('calendar day calculations cross month and year boundaries', () => {
  assert.equal(utils.daysBetween('2026-12-31', '2027-01-01'), 1);
  assert.equal(utils.shift('2026-10-31', 1), '2026-11-01');
});
test('assignment validation rejects whitespace, bad times, subjects, hours, and statuses', () => {
  for (const record of [
    assignment({ title: '   ' }),
    assignment({ dueTime: '25:00' }),
    assignment({ subject: 'Unknown' }),
    assignment({ estimatedHours: -1 }),
    assignment({ status: 'Invalid' }),
  ]) {
    assert.throws(() => putA(workspaceModel.empty(), record), utils.ValidationError);
  }
});
test('assignment creation, deadline change, checklist, and completion counts', () => {
  let s = putA(
    workspaceModel.empty(),
    assignment({ checklist: [{ id: 'step-1', title: 'Research', done: true }] })
  );
  const a = s.assignments[0];
  s = putA(s, { ...a, dueDate: '2026-11-12', status: 'Completed' }, a.revision);
  assert.equal(s.assignments[0].dueDate, '2026-11-12');
  assert.equal(s.assignments[0].completedAt, '2026-10-27');
  assert.equal(progressModel.summary(s, NOW).completed, 1);
  assert.equal(progressModel.summary(s, NOW).percent, 100);
});
test('reopening an assignment clears its completion date', () => {
  let s = putA(workspaceModel.empty(), assignment({ status: 'Completed' }));
  const a = s.assignments[0];
  s = putA(s, { ...a, status: 'In Progress' }, a.revision);
  assert.equal(s.assignments[0].completedAt, null);
});
test('overdue is derived without changing the saved status', () => {
  const a = assignment({ dueDate: '2026-10-26', status: 'In Progress' });
  assert.equal(assignmentModel.overdue(a, NOW), true);
  assert.equal(a.status, 'In Progress');
});
test('due time controls overdue warnings on the due day', () => {
  assert.equal(
    assignmentModel.overdue(assignment({ dueDate: '2026-10-27', dueTime: '11:00' }), NOW),
    true
  );
  assert.equal(
    assignmentModel.overdue(assignment({ dueDate: '2026-10-27', dueTime: '13:00' }), NOW),
    false
  );
});
test('same-record stale edits are rejected', () => {
  const s = putA(workspaceModel.empty());
  assert.throws(() => putA(s, { ...s.assignments[0], title: 'Stale' }, 0), utils.ConflictError);
});
test('incomplete past tasks stay visible and completed history is retained', () => {
  let s = putT(workspaceModel.empty(), task({ date: '2026-10-26' }));
  assert.equal(taskModel.list(s, 'today', NOW).length, 1);
  assert.equal(taskModel.list(s, 'overdue', NOW).length, 1);
  const t = s.tasks[0];
  s = putT(s, { ...t, done: true }, t.revision);
  assert.equal(taskModel.list(s, 'today', NOW).length, 0);
  assert.equal(taskModel.list(s, 'completed', NOW).length, 1);
});
test('future tasks can be edited, rescheduled, linked, and completed', () => {
  let s = putA(workspaceModel.empty(), assignment({ subject: 'Physics' }));
  s = putT(s, task({ assignmentId: s.assignments[0].id, date: '2026-11-01' }));
  const t = s.tasks[0];
  assert.equal(t.subject, 'Physics');
  assert.equal(taskModel.list(s, 'upcoming', NOW).length, 1);
  s = putT(s, { ...t, title: 'Updated step', date: '2026-10-27', done: true }, t.revision);
  assert.equal(s.tasks[0].title, 'Updated step');
  assert.equal(s.tasks[0].completedAt, '2026-10-27');
  assert.equal(progressModel.forAssignment(s, s.assignments[0].id).done, 1);
});
test('task validation rejects empty titles and missing related assignments', () => {
  assert.throws(() => putT(workspaceModel.empty(), task({ title: '' })), utils.ValidationError);
  assert.throws(
    () => putT(workspaceModel.empty(), task({ assignmentId: 'missing' })),
    utils.ValidationError
  );
});
test('deleting an assignment preserves and unlinks study tasks', () => {
  let s = putA(workspaceModel.empty());
  s = putT(s, task({ assignmentId: s.assignments[0].id }));
  const a = s.assignments[0];
  s = workspaceModel.apply(
    s,
    { type: 'assignment:delete', id: a.id, expectedRevision: a.revision },
    NOW
  ).state;
  assert.equal(s.assignments.length, 0);
  assert.equal(s.tasks.length, 1);
  assert.equal(s.tasks[0].assignmentId, null);
});
test('custom subjects can be added once and used in a batch', () => {
  const record = assignment({ subject: 'Software Engineering' });
  const s = workspaceModel.apply(
    workspaceModel.empty(),
    {
      type: 'batch',
      operations: [
        { type: 'subject:add', name: record.subject },
        { type: 'assignment:put', record, expectedRevision: null },
      ],
    },
    NOW
  ).state;
  assert.equal(s.assignments[0].subject, 'Software Engineering');
  assert.throws(
    () => workspaceModel.apply(s, { type: 'subject:remove', name: 'Software Engineering' }, NOW),
    utils.ValidationError
  );
});
test('linked focus sessions are recorded once and progress includes their time', () => {
  let s = putA(workspaceModel.empty());
  s = putT(s, task({ assignmentId: s.assignments[0].id }));
  s = workspaceModel.apply(
    s,
    {
      type: 'timer:control',
      action: 'configure',
      kind: 'focus',
      minutes: 25,
      taskId: s.tasks[0].id,
    },
    NOW
  ).state;
  s = workspaceModel.apply(
    s,
    { type: 'timer:control', action: 'start', timerId: s.timer.id },
    NOW
  ).state;
  const id = s.timer.id;
  s = workspaceModel.apply(s, { type: 'timer:finish', timerId: id }, NOW + 25 * 60000).state;
  assert.equal(s.focusSessions.length, 1);
  assert.equal(s.focusSessions[0].assignmentId, s.assignments[0].id);
  assert.equal(progressModel.forAssignment(s, s.assignments[0].id).minutes, 25);
  assert.equal(s.timer.kind, 'short-break');
  assert.equal(
    workspaceModel.apply(s, { type: 'timer:finish', timerId: id }, NOW + 26 * 60000).changed,
    false
  );
});
test('break sessions do not count as study time and return to focus', () => {
  let s = workspaceModel.empty();
  s = workspaceModel.apply(
    s,
    { type: 'timer:control', action: 'configure', kind: 'short-break', minutes: 5 },
    NOW
  ).state;
  s = workspaceModel.apply(s, { type: 'timer:control', action: 'start' }, NOW).state;
  s = workspaceModel.apply(s, { type: 'timer:finish', timerId: s.timer.id }, NOW + 5 * 60000).state;
  assert.equal(s.focusSessions.length, 0);
  assert.equal(s.timer.kind, 'focus');
});
test('timer pause retains elapsed time and stale timer commands fail', () => {
  let s = workspaceModel.empty();
  s = workspaceModel.apply(s, { type: 'timer:control', action: 'start' }, NOW).state;
  s = workspaceModel.apply(
    s,
    { type: 'timer:control', action: 'pause', timerId: s.timer.id },
    NOW + 60000
  ).state;
  assert.equal(s.timer.remaining, 24 * 60);
  assert.throws(
    () => workspaceModel.apply(s, { type: 'timer:control', action: 'start', timerId: 'old' }, NOW),
    utils.ConflictError
  );
});
test('completion after reopening is attributed to the actual end date', () => {
  let s = workspaceModel.empty();
  const start = new Date(2026, 9, 27, 23, 0).getTime();
  s = workspaceModel.apply(s, { type: 'timer:control', action: 'start' }, start).state;
  s = workspaceModel.apply(
    s,
    { type: 'timer:finish', timerId: s.timer.id },
    start + 24 * 60 * 60000
  ).state;
  assert.equal(s.focusSessions[0].date, '2026-10-27');
});
test('7/3/1-day reminders advance and completed assignments stop alerting', () => {
  let s = putA(workspaceModel.empty(), assignment({ dueDate: '2026-11-03', dueTime: '' }));
  const initial = reminderModel.list(s, NOW);
  assert.equal(initial.length, 1);
  s = workspaceModel.apply(s, { type: 'alerts:read', keys: [initial[0].key] }, NOW).state;
  assert.equal(reminderModel.list(s, NOW)[0].read, true);
  const later = reminderModel.list(s, NOW + 4 * 86400000);
  assert.equal(later[0].read, false);
  assert.notEqual(later[0].key, initial[0].key);
  const a = s.assignments[0];
  s = putA(s, { ...a, status: 'Completed' }, a.revision);
  assert.equal(reminderModel.list(s, NOW).length, 0);
});
test('reminder settings disable alerts and retain overdue warnings when enabled', () => {
  let s = putA(workspaceModel.empty(), assignment({ dueDate: '2026-10-26' }));
  assert.equal(reminderModel.list(s, NOW)[0].overdue, true);
  s.settings.remindersEnabled = false;
  assert.equal(reminderModel.list(s, NOW).length, 0);
});
test('backup export/import round-trips linked records and focus data', () => {
  let s = putA(workspaceModel.empty());
  s = putT(s, task({ assignmentId: s.assignments[0].id }));
  const restored = workspaceModel.parseBackup(workspaceModel.exportBackup(s));
  assert.deepEqual(restored.assignments, s.assignments);
  assert.deepEqual(restored.tasks, s.tasks);
});
test('malformed and unsupported backups are rejected', () => {
  assert.throws(() => workspaceModel.parseBackup('{bad'), utils.ValidationError);
  assert.throws(() => workspaceModel.parseBackup('{"version":99}'), utils.ValidationError);
});
test('merge preserves current records on matching IDs; replace restores counts', () => {
  const a = assignment({ id: 'same-id' });
  const current = putA(workspaceModel.empty(), a);
  let incoming = putA(workspaceModel.empty(), { ...a, title: 'Imported older title' });
  incoming = putT(incoming);
  const merged = workspaceModel.apply(
    current,
    { type: 'data:import', mode: 'merge', workspace: incoming },
    NOW
  ).state;
  assert.equal(merged.assignments[0].title, a.title);
  assert.equal(merged.tasks.length, 1);
  const replaced = workspaceModel.apply(
    current,
    { type: 'data:import', mode: 'replace', workspace: incoming },
    NOW
  ).state;
  assert.equal(replaced.assignments[0].title, 'Imported older title');
  assert.equal(replaced.timer.running, false);
});
test('demo records are opt-in and clearing them preserves real data', () => {
  let s = putA(workspaceModel.empty(), assignment({ title: 'My real project' }));
  s = workspaceModel.apply(s, { type: 'data:demo' }, NOW).state;
  assert.equal(s.assignments.length, 2);
  assert.equal(s.tasks.length, 3);
  s = workspaceModel.apply(s, { type: 'data:clear-demo' }, NOW).state;
  assert.equal(s.assignments.length, 1);
  assert.equal(s.assignments[0].title, 'My real project');
  assert.equal(s.tasks.length, 0);
});
test('version 1 migration preserves coursework and converts old task times', () => {
  const s = {
    ...workspaceModel.empty(),
    version: 1,
    profile: { name: 'Sarah Chen', course: 'Computer Science', goal: 4 },
    assignments: [assignment()],
    tasks: [task({ time: '9:00 AM' })],
    focusSessions: [],
  };
  delete s.settings;
  delete s.timer;
  const migrated = workspaceModel.normalize(s);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.profile.name, 'Student');
  assert.equal(migrated.tasks[0].time, '09:00');
  assert.equal(migrated.assignments.length, 1);
});
test('rendered user values can be safely escaped', () => {
  assert.equal(utils.escape('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
});
test('record and checklist IDs reject ambiguous or duplicate values', () => {
  assert.throws(
    () => putA(workspaceModel.empty(), assignment({ id: 'bad:id' })),
    utils.ValidationError
  );
  assert.throws(
    () =>
      putA(
        workspaceModel.empty(),
        assignment({
          checklist: [
            { id: 'same', title: 'First' },
            { id: 'same', title: 'Second' },
          ],
        })
      ),
    utils.ValidationError
  );
});
test('Undo restoration preserves original completion history and rejects duplicate restores', () => {
  let s = putA(workspaceModel.empty(), assignment({ status: 'Completed' }));
  s.assignments[0].completedAt = '2026-10-20';
  const original = s.assignments[0];
  s = workspaceModel.apply(
    s,
    { type: 'assignment:delete', id: original.id, expectedRevision: original.revision },
    NOW
  ).state;
  s = workspaceModel.apply(s, { type: 'assignment:restore', record: original }, NOW).state;
  assert.equal(s.assignments[0].completedAt, '2026-10-20');
  assert.throws(
    () => workspaceModel.apply(s, { type: 'assignment:restore', record: original }, NOW),
    utils.ConflictError
  );
});
