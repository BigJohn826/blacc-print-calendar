import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/+esm';
const url='https://rnqhltkpocodvybovlss.supabase.co';
const key='sb_publishable_UDefNmZZ9P48SBI4yFYBCg_LQOMr44a';
const client=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const endpoint=url+'/functions/v1/bpe-private-portal-data';
let busy=false,approved=false;
function lock(message){
 approved=false;
 document.body.classList.add('private-locked');
 $('privateGate').hidden=false;
 $('gateStatus').textContent=message;
 // Remove previously rendered private schedule immediately when authorization ends.
 for(const id of ['schedule','nextGig','thisWeek','currentFlyers','recentUpdates','archive']){
  const node=$(id);if(node)node.replaceChildren();
 }
}
function showLogin(message){lock(message);$('gateLogin').hidden=false;}
window.privatePortalFetch=async()=>{
 const {data:{session}}=await client.auth.getSession();
 if(!session){showLogin('Sign in to view the protected BPE portal.');throw Error('Login required');}
 const response=await fetch(endpoint,{method:'GET',cache:'no-store',headers:{Authorization:'Bearer '+session.access_token,apikey:key,Accept:'application/json'}});
 if(!response.ok){
  const data=await response.json().catch(()=>({}));
  lock('Access denied: '+(data.error||response.status));
  $('gateLogin').hidden=response.status===403;
  throw Error('Protected portal access denied');
 }
 return response;
};
async function openPrivatePortal(){
 if(busy)return;busy=true;
 try{
  const {data:{session}}=await client.auth.getSession();
  if(!session){showLogin('Sign in to view the private BPE calendar.');return;}
  // Keep the authorized portal visible during periodic membership rechecks.
  // The protected request still runs; revoked membership immediately triggers lock().
  if(!approved){
   lock('Verifying active BPE membership…');
   $('gateLogin').hidden=true;
  }
  const response=await window.privatePortalFetch();
  const data=await response.json();
  applyPortalData(data);
  approved=true;
  document.body.classList.remove('private-locked');
  $('privateGate').hidden=true;
 }catch(error){
  if(!($('gateStatus').textContent||'').startsWith('Access denied:'))lock('Unable to verify protected calendar access. Please reload to retry.');
 }finally{busy=false;}
}
$('gateSignIn').addEventListener('click',async()=>{
 const email=$('gateEmail').value.trim(),password=$('gatePassword').value;
 if(!email||!password){$('gateStatus').textContent='Enter your email and password.';return;}
 $('gateSignIn').disabled=true;$('gateStatus').textContent='Signing in…';
 try{
  const {error}=await client.auth.signInWithPassword({email,password});
  $('gatePassword').value='';
  if(error)showLogin('Sign in failed: '+error.message);else await openPrivatePortal();
 }finally{$('gateSignIn').disabled=false;}
});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')openPrivatePortal()});
window.addEventListener('focus',()=>{if(approved)openPrivatePortal()});
setInterval(()=>{if(approved&&document.visibilityState==='visible')openPrivatePortal()},30000);
openPrivatePortal();