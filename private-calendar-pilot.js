import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/+esm';
const host='https://rnqhltkpocodvybovlss.supabase.co';
const key='sb_publishable_UDefNmZZ9P48SBI4yFYBCg_LQOMr44a';
const client=createClient(host,key,{auth:{persistSession:true,autoRefreshToken:true}});
const status=document.getElementById('status');
const output=document.getElementById('results');
try {
 const {data:{session}}=await client.auth.getSession();
 if(!session){status.textContent='No saved sign-in. Open Member sign-in first.';}
 else {
  const response=await fetch(host+'/functions/v1/bpe-private-portal-data',{cache:'no-store',headers:{Authorization:'Bearer '+session.access_token,apikey:key}});
  const data=await response.json();
  if(!response.ok){status.textContent='Access denied: '+(data.error||response.status);}
  else {
   status.textContent='Verified '+data.current_member.display_name+' — '+data.gigs.length+' gigs loaded securely.';
   for(const gig of data.gigs.filter(g=>g.event_date>=new Date().toISOString().slice(0,10))){
    const item=document.createElement('p');
    item.textContent=gig.event_date+' — '+gig.venue+' — '+gig.start_time;
    output.append(item);
   }
  }
 }
} catch(error){status.textContent='Calendar request failed: '+error.message;}