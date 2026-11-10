// Focus-session rules: countdown state, linked work, breaks, and completion records.
(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./utils.js') : root.StudySprint.utils
  );
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.StudySprint.timer = api;
  }
})(globalThis, function (utils) {
  'use strict';
  // New session: keep the linked task or assignment when switching session type.
  function fresh(minutes = 25, kind = 'focus', context = {}) {
    return {
      id: utils.id(),
      minutes,
      kind,
      remaining: minutes * 60,
      running: false,
      endAt: null,
      assignmentId: context.assignmentId || null,
      taskId: context.taskId || null,
      subject: context.subject || 'Other',
    };
  }
  // Use the saved end time so background tabs do not slow down the countdown.
  const remaining = (timer, now = Date.now()) =>
    timer.running ? Math.max(0, Math.ceil((timer.endAt - now) / 1000)) : timer.remaining;
  // Session context: resolve the linked records and reject deleted selections.
  function contextFor(state, input) {
    const task = state.tasks.find((item) => item.id === input.taskId);
    const assignment = state.assignments.find(
      (item) => item.id === (task?.assignmentId || input.assignmentId)
    );
    if (input.taskId && !task) {
      throw new utils.ValidationError('This study task no longer exists.');
    }
    if (input.assignmentId && !assignment) {
      throw new utils.ValidationError('This assignment no longer exists.');
    }
    return {
      taskId: task?.id || null,
      assignmentId: assignment?.id || null,
      subject: task?.subject || assignment?.subject || 'Other',
    };
  }

  // Timer controls: start, pause, reset, or configure the current session.
  function control(state, operation, now) {
    const timer = state.timer;
    if (operation.timerId && timer.id !== operation.timerId) {
      throw new utils.ConflictError('The focus timer changed in another tab. Please review it.');
    }
    if (operation.action === 'start') {
      if (!timer.running) {
        if (timer.remaining <= 0) {
          timer.remaining = timer.minutes * 60;
        }
        timer.running = true;
        timer.endAt = now + timer.remaining * 1000;
      }
    } else if (operation.action === 'pause') {
      timer.remaining = remaining(timer, now);
      timer.running = false;
      timer.endAt = null;
    } else if (operation.action === 'reset') {
      state.timer = fresh(timer.minutes, timer.kind, timer);
    } else if (operation.action === 'configure') {
      if (timer.running) {
        throw new utils.ValidationError('Pause the timer before changing the session.');
      }
      const kind = utils.choice(
        operation.kind || timer.kind,
        ['focus', 'short-break', 'long-break'],
        'session type'
      );
      const minutes = utils.number(
        operation.minutes ||
          (kind === 'focus'
            ? state.settings.focusMinutes
            : kind === 'short-break'
              ? state.settings.shortBreak
              : state.settings.longBreak),
        'Session length',
        1,
        120
      );
      state.timer = fresh(minutes, kind, contextFor(state, operation));
    } else {
      throw new utils.ValidationError('Unknown timer action.');
    }
  }

  // Session completion: record focus time once, then prepare the next break or focus.
  function finish(state, timerId, now) {
    const timer = state.timer;
    if (timer.id !== timerId || !timer.running || timer.endAt > now) {
      return false;
    }
    const wasFocus = timer.kind === 'focus';
    if (wasFocus && !state.focusSessions.some((session) => session.id === timer.id)) {
      const assignment = state.assignments.find((item) => item.id === timer.assignmentId);
      const task = state.tasks.find((item) => item.id === timer.taskId);
      state.focusSessions.push({
        id: timer.id,
        date: utils.today(timer.endAt),
        minutes: timer.minutes,
        completedAt: new Date(timer.endAt).toISOString(),
        assignmentId: timer.assignmentId,
        taskId: timer.taskId,
        subject: timer.subject || assignment?.subject || task?.subject || 'Other',
        assignmentTitle: assignment?.title || '',
        taskTitle: task?.title || '',
      });
    }
    // The daily session count decides when a longer break is offered.
    const daily = state.focusSessions.filter((session) => session.date === utils.today(now)).length;
    const kind = wasFocus
      ? daily > 0 && daily % state.settings.longBreakEvery === 0
        ? 'long-break'
        : 'short-break'
      : 'focus';
    state.timer = fresh(
      kind === 'focus'
        ? state.settings.focusMinutes
        : kind === 'short-break'
          ? state.settings.shortBreak
          : state.settings.longBreak,
      kind,
      timer
    );
    return true;
  }
  return { fresh, remaining, contextFor, control, finish };
});
