/* Shared browser storage for the separate HTML pages.
 * File URLs use index.html in a hidden frame as a common storage location.
 * HTTP/HTTPS pages already share one localStorage origin.
 */
(function () {
  'use strict';
  const KEY = 'studysprint.workspace.v1';
  const REQUEST = 'studysprint:storage-request';
  const RESPONSE = 'studysprint:storage-response';
  const CHANGED = 'studysprint:storage-changed';
  const FRAME_HASH = '#studysprint-storage';

  if (window.parent !== window && location.hash === FRAME_HASH) {
    window.studySprintStorageFrame = true;
    window.addEventListener('message', event => {
      if (event.source !== window.parent || event.data?.type !== REQUEST) return;
      const {id, action, value} = event.data;
      let reply = {type:RESPONSE, id};
      try {
        if (action === 'read') reply.value = localStorage.getItem(KEY);
        else if (action === 'write' && typeof value === 'string') localStorage.setItem(KEY,value);
        else throw new Error('Unsupported storage request.');
      } catch { reply.error = true; }
      event.source.postMessage(reply,'*');
    });
    window.addEventListener('storage', event => {
      if (event.key === KEY) window.parent.postMessage({type:CHANGED,value:event.newValue},'*');
    });
    return;
  }

  const notify = value => window.dispatchEvent(new CustomEvent('studysprint-storage-change',{detail:value}));
  if (location.protocol !== 'file:') {
    window.studySprintStorage = {
      async read() { return localStorage.getItem(KEY); },
      async write(value) { localStorage.setItem(KEY,value); }
    };
    window.addEventListener('storage', event => { if(event.key === KEY) notify(event.newValue); });
    return;
  }

  const frame = document.createElement('iframe');
  frame.hidden = true;
  frame.tabIndex = -1;
  frame.title = 'StudySprint local data storage';
  frame.setAttribute('aria-hidden','true');
  const ready = new Promise((resolve,reject) => {
    const timeout = setTimeout(() => reject(new Error('Storage frame unavailable.')),8000);
    frame.addEventListener('load',() => { clearTimeout(timeout); resolve(); },{once:true});
    frame.addEventListener('error',() => { clearTimeout(timeout); reject(new Error('Storage frame unavailable.')); },{once:true});
  });
  const pending = new Map();
  let sequence = 0;
  let writeQueue = Promise.resolve();
  window.addEventListener('message',event => {
    if(event.source !== frame.contentWindow) return;
    if(event.data?.type === CHANGED) { notify(event.data.value); return; }
    if(event.data?.type !== RESPONSE) return;
    const request = pending.get(event.data.id);
    if(!request) return;
    pending.delete(event.data.id); clearTimeout(request.timeout);
    if(event.data.error) request.reject(new Error('Browser storage unavailable.'));
    else request.resolve(event.data.value ?? null);
  });
  async function request(action,value) {
    await ready;
    return new Promise((resolve,reject) => {
      const id = ++sequence;
      const timeout = setTimeout(() => { pending.delete(id); reject(new Error('Storage request timed out.')); },5000);
      pending.set(id,{resolve,reject,timeout});
      frame.contentWindow.postMessage({type:REQUEST,id,action,value},'*');
    });
  }
  window.studySprintStorage = {
    read() { return request('read'); },
    write(value) {
      const next = writeQueue.catch(() => {}).then(() => request('write',value));
      writeQueue = next;
      return next;
    }
  };
  frame.src = new URL('index.html' + FRAME_HASH,location.href).href;
  document.body.append(frame);
})();
