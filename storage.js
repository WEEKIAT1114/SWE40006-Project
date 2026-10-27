/* Atomic IndexedDB persistence. A restricted file-only bridge shares direct-file pages. */
(function(root,factory){
  const node=typeof module==='object' && module.exports;
  const create=factory(node ? require('./js/model.js') : root.StudySprint.model);
  if(node){module.exports=create;return;}
  const FRAME='#studysprint-storage';
  const REQUEST='studysprint:v2:request';const RESPONSE='studysprint:v2:response';
  const isFrame=location.protocol==='file:' && window.parent!==window && location.hash===FRAME;
  if(isFrame){
    window.studySprintStorageFrame=true;
    const repository=create({indexedDB:root.indexedDB,localStorage:root.localStorage,BroadcastChannel:root.BroadcastChannel});
    window.addEventListener('message',async event=>{
      if(event.source!==window.parent || event.origin!=='null' || event.data?.type!==REQUEST || typeof event.data.token!=='string')return;
      const {id,token,action,value}=event.data;let response={type:RESPONSE,id,token};
      try{
        if(!['read','commit','backup','recover','raw'].includes(action))throw new Error('Unsupported storage request.');
        response.value=await repository[action](value);
      }catch(error){response.error={name:error.name,message:error.message};}
      event.source.postMessage(response,'*'); // Opaque file origins require a wildcard; source, origin, protocol, and token are checked.
    });
    return;
  }
  if(location.protocol!=='file:'){
    window.studySprintStorage=create({indexedDB:root.indexedDB,localStorage:root.localStorage,BroadcastChannel:root.BroadcastChannel});
    return;
  }
  const frame=document.createElement('iframe');frame.hidden=true;frame.tabIndex=-1;frame.title='StudySprint local storage';frame.setAttribute('aria-hidden','true');
  const token=root.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;const pending=new Map();let sequence=0;
  const ready=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Local-file storage is blocked. Run npm start and open http://127.0.0.1:8000.')),8000);frame.addEventListener('load',()=>{clearTimeout(timeout);resolve();},{once:true});});
  window.addEventListener('message',event=>{
    if(event.source!==frame.contentWindow || event.origin!=='null' || event.data?.type!==RESPONSE || event.data.token!==token)return;
    const request=pending.get(event.data.id);if(!request)return;pending.delete(event.data.id);clearTimeout(request.timeout);
    if(event.data.error){const error=new Error(event.data.error.message);error.name=event.data.error.name;request.reject(error);}else request.resolve(event.data.value);
  });
  async function request(action,value){await ready;return new Promise((resolve,reject)=>{const id=++sequence;const timeout=setTimeout(()=>{pending.delete(id);reject(new Error('Storage did not respond. Use the local server.'));},7000);pending.set(id,{resolve,reject,timeout});frame.contentWindow.postMessage({type:REQUEST,id,token,action,value},'*');});}
  window.studySprintStorage={read:()=>request('read'),commit:op=>request('commit',op),backup:()=>request('backup'),recover:()=>request('recover'),raw:()=>request('raw'),subscribe(){return ()=>{};}};
  frame.src=new URL('index.html'+FRAME,location.href).href;document.body.append(frame);
})(globalThis,function(model){
  'use strict';
  return function createRepository(options={}){
    const factory=options.indexedDB;const legacy=options.localStorage;const name=options.name || 'studysprint-workspace-v2';
    const listeners=new Set();let connection;
    const channel=options.BroadcastChannel ? new options.BroadcastChannel(`${name}:changes`) : null;
    function open(){
      if(!connection)connection=new Promise((resolve,reject)=>{
        if(!factory){reject(new Error('Safe browser storage is unavailable. Use Chrome or Edge with the local server.'));return;}
        const request=factory.open(name,1);
        request.onupgradeneeded=()=>request.result.createObjectStore('workspace');
        request.onerror=()=>reject(request.error || new Error('Browser storage is blocked.'));
        request.onblocked=()=>reject(new Error('Close older StudySprint tabs and try again.'));
        request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);};
      });
      return connection;
    }
    async function transaction(action,operation){
      const db=await open();
      return new Promise((resolve,reject)=>{
        const tx=db.transaction('workspace','readwrite');const store=tx.objectStore('workspace');let output;let failure;
        tx.oncomplete=()=>resolve(output);
        tx.onabort=()=>reject(failure || tx.error || new Error('Saving failed. Your previous data is intact.'));
        tx.onerror=()=>{};
        const request=store.get(action==='backup' || action==='recover' ? 'backup' : 'current');
        request.onsuccess=()=>{
          try{
            const stored=request.result;
            if(action==='raw'){output=stored || legacy?.getItem('studysprint.workspace.v1') || null;return;}
            if(action==='backup'){output=stored || null;return;}
            if(action==='recover'){
              if(!stored)throw new Error('No automatic recovery snapshot is available. Import an exported backup instead.');
              const restored=model.normalize(stored.workspace);const current=store.get('current');
              current.onsuccess=()=>{restored.revision=Math.max(restored.revision,Number(current.result?.revision) || 0)+1;store.put(restored,'current');output=restored;};return;
            }
            let state,unreadable=false;
            try{state=stored ? model.normalize(stored) : model.decode(legacy?.getItem('studysprint.workspace.v1') ?? null);}
            catch(error){
              if(action==='commit' && operation?.type==='data:import' && operation.mode==='replace'){
                unreadable=true;store.put({savedAt:new Date().toISOString(),raw:stored || legacy?.getItem('studysprint.workspace.v1')},'unreadable');state=model.empty();
              }else throw error;
            }
            if(action==='read'){
              if(!stored)store.put(state,'current');
              output=state;return;
            }
            const result=model.apply(state,operation,options.now ? options.now() : Date.now());
            if(result.changed){if(!unreadable)store.put({savedAt:new Date().toISOString(),sourceRevision:state.revision,workspace:state},'backup');store.put(result.state,'current');}
            output=result;
          }catch(error){failure=error;tx.abort();}
        };
      });
    }
    async function publish(state){for(const listener of listeners)listener(state);channel?.postMessage({revision:state.revision});}
    const repository={
      read:()=>transaction('read'),
      async commit(operation){const result=await transaction('commit',operation);if(result.changed)await publish(result.state);return result;},
      backup:()=>transaction('backup'),raw:()=>transaction('raw'),
      async recover(){const state=await transaction('recover');await publish(state);return state;},
      subscribe(callback){listeners.add(callback);return ()=>listeners.delete(callback);},
      async close(){channel?.close();if(connection)(await connection).close();}
    };
    if(channel)channel.onmessage=async()=>{try{const state=await repository.read();for(const listener of listeners)listener(state);}catch{/* Surface storage errors on the next user save. */}};
    return repository;
  };
});
