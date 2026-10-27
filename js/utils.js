(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.StudySprint ||= {}).utils = api;
})(globalThis, function () {
  'use strict';
  class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; } }
  class ConflictError extends Error { constructor(message = 'This item changed in another tab. Close and reopen the form to review the latest version.') { super(message); this.name = 'ConflictError'; } }
  const clone = value => JSON.parse(JSON.stringify(value));
  const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const today = (now = Date.now()) => dateKey(new Date(now));
  const parseDate = value => new Date(`${value}T12:00:00`);
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(parseDate(value).getTime()) && dateKey(parseDate(value)) === value;
  const shift = (key, days) => { const date = parseDate(key); date.setDate(date.getDate()+days); return dateKey(date); };
  const daysBetween = (from, to) => {
    const utc = key => { const [y,m,d] = key.split('-').map(Number); return Date.UTC(y,m-1,d); };
    return Math.round((utc(to)-utc(from))/86400000);
  };
  const weekStart = (now = Date.now()) => { const date = new Date(now); return shift(dateKey(date),-(date.getDay()+6)%7); };
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function text(value, label, max, optional = false) {
    if (typeof value !== 'string') throw new ValidationError(`${label} must be text.`);
    const result = value.trim();
    if ((!optional && !result) || result.length > max) throw new ValidationError(`${label} must contain ${optional ? '0' : '1'}–${max} characters.`);
    return result;
  }
  function number(value, label, min, max) { const n = Number(value); if (!Number.isFinite(n) || n < min || n > max) throw new ValidationError(`${label} must be between ${min} and ${max}.`); return n; }
  function date(value, label = 'Date') { if (!validDate(value)) throw new ValidationError(`${label} must be a valid date.`); return value; }
  function time(value = '') { if (value && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new ValidationError('Enter a valid time.'); return value; }
  function recordId(value,label='Record ID'){const result=text(value,label,100);if(!/^[a-zA-Z0-9_-]+$/.test(result))throw new ValidationError(`${label} contains unsupported characters.`);return result;}
  function choice(value, allowed, label) { if (!allowed.includes(value)) throw new ValidationError(`Choose a valid ${label}.`); return value; }
  function version(existing, expected) { if (existing && existing.revision !== expected) throw new ConflictError(); if (!existing && expected !== null && expected !== undefined) throw new ConflictError('This item was deleted in another tab.'); }
  function stamp(existing, now) { return {revision:(existing?.revision || 0)+1,updatedAt:new Date(now).toISOString(),createdAt:existing?.createdAt || new Date(now).toISOString()}; }
  return {ValidationError,ConflictError,clone,id,dateKey,today,parseDate,validDate,shift,daysBetween,weekStart,escape,text,number,date,time,recordId,choice,version,stamp};
});
