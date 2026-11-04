import * as functions from './lib/rekenregels.mjs';
const form=document.querySelector('form[data-module]');
if(form){
 const input=form.querySelector('textarea'), output=document.querySelector('#result'), status=document.querySelector('#status'), download=document.querySelector('#download');
 let saved=null;
 input.addEventListener('input',()=>{saved=null;download.disabled=true;output.textContent='Invoer gewijzigd. Bereken opnieuw.';status.textContent='Vorige resultaat ongeldig.';});
 form.addEventListener('submit',event=>{event.preventDefault();saved=null;download.disabled=true;
  try{const data=JSON.parse(input.value); const fn=functions[form.dataset.module];if(typeof fn!=='function')throw new Error('Onbekende module.');saved=JSON.stringify(fn(data),null,2);output.textContent=saved;status.textContent='Berekening voltooid. Controleer de beperkingen hieronder.';download.disabled=false;}
  catch(error){output.textContent='Geen geldig resultaat.';status.textContent=error instanceof SyntaxError?'De JSON-invoer is niet geldig. Controleer komma’s, aanhalingstekens en haakjes.':error.message;}
 });
 download.addEventListener('click',()=>{if(saved===null)return;const url=URL.createObjectURL(new Blob([saved+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=form.dataset.module+'-resultaat.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
