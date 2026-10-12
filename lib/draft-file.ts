// A selected private document stays on the owner's device across an OAuth redirect.
// It is sent to R2 only when the owner submits the completed profile.
export async function draftFile(action:'get'|'put'|'delete',file?:File):Promise<File|null>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('rodnya-local-draft',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('files');
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{
      const db=request.result,transaction=db.transaction('files',action==='get'?'readonly':'readwrite'),store=transaction.objectStore('files');
      const operation=action==='get'?store.get('pedigree'):action==='put'?store.put(file,'pedigree'):store.delete('pedigree');
      let result:File|null=null;
      operation.onsuccess=()=>{if(action==='get'&&operation.result instanceof File)result=operation.result;};
      transaction.oncomplete=()=>{db.close();resolve(result);};
      transaction.onerror=()=>{db.close();reject(transaction.error);};
    };
  });
}
