// Workspace model: defaults, migration, backup validation, and data operations.
(function (root, factory) {
  const node = typeof module === 'object' && module.exports;
  const get = (name) => (node ? require(`./${name}.js`) : root.StudySprint[name]);
  const api = factory(get('utils'), get('assignments'), get('tasks'), get('timer'));
  if (node) {
    module.exports = api;
  } else {
    root.StudySprint.model = api;
  }
})(globalThis, function (utils, assignments, tasks, timer) {
  'use strict';
  const VERSION = 2;
  const DEFAULT_SUBJECTS = [
    'Computer Science',
    'Business Management',
    'Physics',
    'English Literature',
    'Calculus',
    'Psychology',
    'Other',
  ];
  // Workspace defaults: settings for new users and fields absent from older data.
  const defaults = () => ({
    remindersEnabled: true,
    reminderDays: [7, 3, 1, 0],
    focusMinutes: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakEvery: 4,
  });
  // New workspace: start with no coursework or sample records.
  function empty() {
    return {
      version: VERSION,
      revision: 0,
      profile: { name: 'Student', course: 'Computer Science', goal: 4 },
      subjects: [...DEFAULT_SUBJECTS],
      settings: defaults(),
      assignments: [],
      tasks: [],
      focusSessions: [],
      dismissedAlerts: {},
      timer: timer.fresh(),
    };
  }

  // Preferences validation: keep timer lengths and reminder intervals within limits.
  function settings(input = {}) {
    const values = { ...defaults(), ...input };
    if (
      !Array.isArray(values.reminderDays) ||
      values.reminderDays.some((day) => ![0, 1, 3, 7].includes(day))
    ) {
      throw new utils.ValidationError('Choose supported reminder intervals.');
    }
    return {
      remindersEnabled: Boolean(values.remindersEnabled),
      reminderDays: [...new Set(values.reminderDays)],
      focusMinutes: utils.number(values.focusMinutes, 'Focus length', 1, 120),
      shortBreak: utils.number(values.shortBreak, 'Short break', 1, 30),
      longBreak: utils.number(values.longBreak, 'Long break', 1, 60),
      longBreakEvery: utils.number(values.longBreakEvery, 'Long break interval', 2, 10),
    };
  }

  // Legacy migration: convert version-1 AM/PM times to the current 24-hour format.
  function legacyTime(value = '') {
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value);
    if (!match) {
      return value;
    }
    const hour = (Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
    return `${String(hour).padStart(2, '0')}:${match[2]}`;
  }

  function meta(item) {
    return {
      id: utils.recordId(item.id, 'Record ID'),
      revision: Number.isSafeInteger(item.revision) && item.revision >= 0 ? item.revision : 0,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : '',
      isDemo: Boolean(item.isDemo),
    };
  }

  function unique(items, label) {
    if (new Set(items.map((item) => item.id)).size !== items.length) {
      throw new utils.ValidationError(`${label} contain duplicate IDs.`);
    }
  }

  // Workspace validation: rebuild a consistent state before saving or importing it.
  function normalize(input) {
    if (
      !input ||
      typeof input !== 'object' ||
      ![1, VERSION].includes(input.version) ||
      !Array.isArray(input.assignments) ||
      !Array.isArray(input.tasks) ||
      !Array.isArray(input.focusSessions)
    ) {
      throw new utils.ValidationError(
        'This is not a supported StudySprint backup. Your existing data has not been changed.'
      );
    }
    if (
      input.assignments.length > 10000 ||
      input.tasks.length > 20000 ||
      input.focusSessions.length > 30000
    ) {
      throw new utils.ValidationError('This workspace exceeds the supported record limit.');
    }
    const state = empty();
    state.revision =
      Number.isSafeInteger(input.revision) && input.revision >= 0 ? input.revision : 0;
    state.profile = {
      name: utils.text(
        input.profile?.name === 'Sarah Chen' ? 'Student' : input.profile?.name || 'Student',
        'Name',
        50
      ),
      course: utils.text(input.profile?.course || 'My studies', 'Course', 60),
      goal: utils.number(input.profile?.goal || 4, 'Daily focus goal', 1, 20),
    };
    state.settings = settings(input.settings);
    if (input.subjects !== undefined && !Array.isArray(input.subjects)) {
      throw new utils.ValidationError('Subjects must be a list.');
    }
    const subjects = input.subjects || [
      ...DEFAULT_SUBJECTS,
      ...input.assignments.map((item) => item.subject),
      ...input.tasks.map((item) => item.subject),
    ];
    state.subjects = [...new Set(subjects.map((subject) => utils.text(subject, 'Subject', 50)))];
    if (!state.subjects.length || state.subjects.length > 100) {
      throw new utils.ValidationError('Keep between 1 and 100 subjects.');
    }
    state.assignments = input.assignments.map((item) => ({
      ...assignments.validate(item, state.subjects),
      ...meta(item),
      completedAt:
        item.status === 'Completed' && utils.validDate(item.completedAt) ? item.completedAt : null,
    }));
    unique(state.assignments, 'Assignments');
    state.tasks = input.tasks.map((item) => ({
      ...tasks.validate(
        {
          ...item,
          time: input.version === 1 ? legacyTime(item.time) : item.time,
          assignmentId: state.assignments.some((a) => a.id === item.assignmentId)
            ? item.assignmentId
            : null,
        },
        state
      ),
      ...meta(item),
      completedAt: item.done && utils.validDate(item.completedAt) ? item.completedAt : null,
    }));
    unique(state.tasks, 'Tasks');
    state.focusSessions = input.focusSessions.map((item) => ({
      id: utils.text(item.id, 'Session ID', 100),
      date: utils.date(item.date, 'Session date'),
      minutes: utils.number(item.minutes, 'Focus minutes', 1, 120),
      completedAt: typeof item.completedAt === 'string' ? item.completedAt : '',
      subject: utils.text(item.subject || 'Other', 'Session subject', 50),
      assignmentId: typeof item.assignmentId === 'string' ? item.assignmentId : null,
      taskId: typeof item.taskId === 'string' ? item.taskId : null,
      assignmentTitle: utils.text(item.assignmentTitle || '', 'Assignment title', 120, true),
      taskTitle: utils.text(item.taskTitle || '', 'Task title', 100, true),
      isDemo: Boolean(item.isDemo),
    }));
    unique(state.focusSessions, 'Sessions');
    state.dismissedAlerts = {};
    if (input.dismissedAlerts && typeof input.dismissedAlerts === 'object') {
      for (const [key, value] of Object.entries(input.dismissedAlerts).slice(-5000)) {
        if (key.length < 250 && value === true) {
          state.dismissedAlerts[key] = true;
        }
      }
    }
    const saved = input.timer || input.focusTimer;
    if (saved) {
      const minutes = utils.number(saved.minutes, 'Timer duration', 1, 120);
      const kind = utils.choice(
        saved.kind || 'focus',
        ['focus', 'short-break', 'long-break'],
        'timer type'
      );
      state.timer = {
        ...timer.fresh(minutes, kind),
        id: typeof saved.id === 'string' ? utils.text(saved.id, 'Timer ID', 100) : utils.id(),
        remaining: utils.number(saved.remaining, 'Time remaining', 0, minutes * 60),
        running: Boolean(saved.running),
        endAt: saved.running
          ? utils.number(saved.endAt, 'Timer end time', 0, 8640000000000000)
          : null,
        assignmentId: state.assignments.some((a) => a.id === saved.assignmentId)
          ? saved.assignmentId
          : null,
        taskId: state.tasks.some((t) => t.id === saved.taskId) ? saved.taskId : null,
        subject:
          typeof saved.subject === 'string'
            ? utils.text(saved.subject, 'Focus subject', 50)
            : 'Other',
      };
    }
    return state;
  }

  // Stored-data loading: unreadable records remain available for recovery or export.
  function decode(raw) {
    if (raw === null || raw === undefined) {
      return empty();
    }
    try {
      return normalize(typeof raw === 'string' ? JSON.parse(raw) : raw);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new utils.ValidationError(
          'Saved data is unreadable. Use recovery or export the original data; it has not been overwritten.'
        );
      }
      throw error;
    }
  }

  // Backup import: accept the exported wrapper or a plain workspace object.
  function parseBackup(raw) {
    let value;
    try {
      value = JSON.parse(raw);
    } catch {
      throw new utils.ValidationError('Choose a valid JSON backup.');
    }
    return normalize(value.workspace || value);
  }

  // Backup export: include the format version and a validated workspace snapshot.
  function exportBackup(state) {
    return JSON.stringify(
      {
        application: 'StudySprint',
        backupVersion: 1,
        exportedAt: new Date().toISOString(),
        workspace: normalize(state),
      },
      null,
      2
    );
  }

  function addSubject(state, value) {
    const subject = utils.text(value, 'Subject', 50);
    const match = state.subjects.find((s) => s.toLowerCase() === subject.toLowerCase());
    if (match) {
      return match;
    }
    if (state.subjects.length >= 100) {
      throw new utils.ValidationError('You can keep up to 100 subjects.');
    }
    state.subjects.push(subject);
    return subject;
  }

  // Workspace operations: apply changes to a copy, then validate the whole result.
  function apply(state, operation, now = Date.now()) {
    let next = utils.clone(state);
    let changed = true;
    let result = null;
    const ops = operation.type === 'batch' ? operation.operations : [operation];
    if (!Array.isArray(ops) || ops.length > 100) {
      throw new utils.ValidationError('Invalid update.');
    }
    for (const op of ops) {
      if (op.type === 'subject:add') {
        result = addSubject(next, op.name);
      } else if (op.type === 'subject:remove') {
        if (
          next.assignments.some((a) => a.subject === op.name) ||
          next.tasks.some((t) => t.subject === op.name)
        ) {
          throw new utils.ValidationError(
            'This subject is used by assignments or tasks. Update those records first.'
          );
        }
        if (next.subjects.length <= 1) {
          throw new utils.ValidationError('Keep at least one subject.');
        }
        next.subjects = next.subjects.filter((name) => name !== op.name);
      } else if (op.type === 'assignment:put') {
        result = assignments.put(next, op, now);
      } else if (op.type === 'task:put') {
        result = tasks.put(next, op, now);
      } else if (op.type === 'assignment:restore' || op.type === 'task:restore') {
        const key = op.type === 'assignment:restore' ? 'assignments' : 'tasks';
        if (next[key].some((item) => item.id === op.record.id)) {
          throw new utils.ConflictError(
            'This record already exists. Your current data has been kept.'
          );
        }
        next[key].push({ ...op.record, ...utils.stamp(op.record, now) });
        next = normalize(next);
        result = op.record;
      } else if (op.type === 'assignment:delete' || op.type === 'task:delete') {
        // Deleting an assignment keeps its study tasks and removes their assignment link.
        const key = op.type === 'assignment:delete' ? 'assignments' : 'tasks';
        const item = next[key].find((value) => value.id === op.id);
        utils.version(item, op.expectedRevision);
        if (!item) {
          throw new utils.ConflictError('This item has already been deleted.');
        }
        result = utils.clone(item);
        next[key] = next[key].filter((value) => value.id !== op.id);
        if (key === 'assignments') {
          next.tasks = next.tasks.map((task) =>
            task.assignmentId === op.id
              ? { ...task, assignmentId: null, ...utils.stamp(task, now) }
              : task
          );
        }
        if (next.timer.assignmentId === op.id) {
          next.timer.assignmentId = null;
        }
        if (next.timer.taskId === op.id) {
          next.timer.taskId = null;
        }
      } else if (op.type === 'profile:update') {
        next.profile = {
          name: utils.text(op.profile.name, 'Name', 50),
          course: utils.text(op.profile.course, 'Course', 60),
          goal: utils.number(op.profile.goal, 'Daily focus goal', 1, 20),
        };
      } else if (op.type === 'settings:update') {
        next.settings = settings({ ...next.settings, ...op.settings });
      } else if (op.type === 'timer:control') {
        timer.control(next, op, now);
      } else if (op.type === 'timer:finish') {
        result = timer.finish(next, op.timerId, now);
        if (ops.length === 1) {
          changed = result;
        }
      } else if (op.type === 'alerts:read') {
        for (const key of op.keys || []) {
          if (typeof key === 'string' && key.length < 250) {
            next.dismissedAlerts[key] = true;
          }
        }
      } else if (op.type === 'data:import') {
        // Replace restores the imported workspace; merge keeps existing records with matching IDs.
        const imported = normalize(op.workspace);
        if (op.mode === 'replace') {
          next = imported;
          next.timer = timer.fresh(next.settings.focusMinutes);
        } else if (op.mode === 'merge') {
          next.subjects = [...new Set([...next.subjects, ...imported.subjects])];
          for (const key of ['assignments', 'tasks', 'focusSessions']) {
            for (const item of imported[key]) {
              if (!next[key].some((existing) => existing.id === item.id)) {
                next[key].push(item);
              }
            }
          }
          next = normalize(next);
        } else {
          throw new utils.ValidationError('Choose merge or replace.');
        }
      } else if (op.type === 'data:clear-demo') {
        // Only records explicitly marked as samples are removed here.
        const ids = new Set(next.assignments.filter((a) => a.isDemo).map((a) => a.id));
        next.assignments = next.assignments.filter((a) => !a.isDemo);
        next.tasks = next.tasks
          .filter((t) => !t.isDemo)
          .map((t) =>
            ids.has(t.assignmentId) ? { ...t, assignmentId: null, ...utils.stamp(t, now) } : t
          );
        next.focusSessions = next.focusSessions.filter((s) => !s.isDemo);
      } else if (op.type === 'data:demo') {
        if (next.assignments.some((a) => a.isDemo) || next.tasks.some((t) => t.isDemo)) {
          throw new utils.ValidationError('Sample records are already loaded.');
        }
        const assignmentId = utils.id();
        const subject = addSubject(next, 'Computer Science');
        assignments.put(
          next,
          {
            record: {
              id: assignmentId,
              title: 'Sample: Software Engineering project',
              subject,
              dueDate: utils.shift(utils.today(now), 7),
              dueTime: '17:00',
              priority: 'High',
              status: 'In Progress',
              estimatedHours: 6,
              notes: 'Sample workspace. Plan, focus, and track the linked study tasks.',
              checklist: [
                { id: utils.id(), title: 'Review requirements', done: true },
                { id: utils.id(), title: 'Implement and test', done: false },
              ],
              isDemo: true,
            },
            expectedRevision: null,
          },
          now
        );
        for (const [index, title] of [
          'Research and outline',
          'Implement the first feature',
          'Test and write the report',
        ].entries()) {
          tasks.put(
            next,
            {
              record: {
                id: utils.id(),
                title: `Sample: ${title}`,
                subject,
                date: utils.shift(utils.today(now), index),
                time: '10:00',
                priority: 'Medium',
                assignmentId,
                done: false,
                isDemo: true,
              },
              expectedRevision: null,
            },
            now
          );
        }
      } else {
        throw new utils.ValidationError('Unsupported update.');
      }
    }
    if (!changed) {
      return { state, changed: false, result };
    }
    next.revision = state.revision + 1;
    return { state: normalize(next), changed: true, result };
  }
  return {
    VERSION,
    DEFAULT_SUBJECTS,
    empty,
    normalize,
    decode,
    parseBackup,
    exportBackup,
    settings,
    apply,
  };
});
