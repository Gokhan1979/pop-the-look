const supabaseClient=supabase.createClient("https://pslsuittihsaeeyrihgr.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbHN1aXR0aWhzYWVleXJpaGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDE4MjYsImV4cCI6MjEwNTQxNzgyNn0.dZEAEHzbOgaPHzQWWzk1whjPFmmME8G2kuvAc4b72mI");

function toggleBurger(e){ if(e) e.stopPropagation(); document.getElementById('burgerDrawer').classList.toggle('show'); document.getElementById('overlay').classList.toggle('show'); }
function toggleProfile(e){ if(e) e.stopPropagation(); document.getElementById('profileDropdown').classList.toggle('show'); }

async function openPI(){
  document.getElementById('profileDropdown').classList.remove('show');
  const s=JSON.parse(localStorage.getItem('personalInfo')||'{}');
  let supaFirst='', supaLast='', supaEmail='';
  try{
    const {data:{session}} = await supabaseClient.auth.getSession();
    if(session && session.user){
      supaEmail = session.user.email || '';
      const meta = session.user.user_metadata || {};
      supaFirst = meta.first_name || meta.firstName || '';
      supaLast = meta.last_name || meta.lastName || '';
      if(!supaFirst && meta.full_name){ const p=meta.full_name.trim().split(' '); supaFirst=p[0]||''; supaLast=p.slice(1).join(' ')||''; }
    }
  }catch(err){}
  document.getElementById('firstName').value = s.firstName || supaFirst || '';
  document.getElementById('lastName').value = s.lastName || supaLast || '';
  document.getElementById('street').value = s.street || '';
  document.getElementById('city').value = s.city || '';
  document.getElementById('country').value = s.country || 'United Kingdom';
  document.getElementById('postcode').value = s.postcode || '';
  document.getElementById('email').value = s.email || supaEmail || '';
  document.getElementById('phone').value = s.phone || '';
  document.getElementById('piModal').classList.add('show');
}
function closePI(){ document.getElementById('piModal').classList.remove('show'); }
async function savePI(){
  const data={firstName:document.getElementById('firstName').value,lastName:document.getElementById('lastName').value,street:document.getElementById('street').value,city:document.getElementById('city').value,country:document.getElementById('country').value,postcode:document.getElementById('postcode').value,email:document.getElementById('email').value,phone:document.getElementById('phone').value};
  const old = JSON.parse(localStorage.getItem('personalInfo')||'{}');
  if(old.profilePhoto) data.profilePhoto = old.profilePhoto;
  localStorage.setItem('personalInfo',JSON.stringify(data));
  try{ await supabaseClient.auth.updateUser({ data:{ first_name:data.firstName, last_name:data.lastName, full_name:data.firstName+' '+data.lastName } }); }catch(e){}
  updateHeaderUI();
  alert('Saved! UK Address updated');
  closePI();
}
function uploadPhoto(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    const base64 = ev.target.result;
    const s = JSON.parse(localStorage.getItem('personalInfo')||'{}');
    s.profilePhoto = base64;
    localStorage.setItem('personalInfo', JSON.stringify(s));
    updateHeaderUI();
  };
  reader.readAsDataURL(file);
}
function updateHeaderUI(){
  const s = JSON.parse(localStorage.getItem('personalInfo')||'{}');
  const nameEl = document.getElementById('profileName');
  const headIcon = document.getElementById('headIcon');
  const headAvatar = document.getElementById('headAvatar');
  const dropAvatar = document.getElementById('dropdownAvatar');
  if(s.profilePhoto){
    dropAvatar.src = s.profilePhoto;
    headAvatar.src = s.profilePhoto;
    headAvatar.style.display='block';
    headIcon.style.display='none';
  } else {
    headAvatar.style.display='none';
    headIcon.style.display='block';
  }
  if(s.firstName){
    nameEl.textContent = s.firstName;
    nameEl.style.display='block';
  } else {
    supabaseClient.auth.getSession().then(({data})=>{
      const meta = data.session?.user?.user_metadata || {};
      const fn = s.firstName || meta.first_name || meta.full_name?.split(' ')[0] || '';
      if(fn){ nameEl.textContent=fn; nameEl.style.display='block'; }
    });
  }
}
document.addEventListener('click',function(e){ if(!e.target.closest('#burgerDrawer') &&!e.target.closest('.burger-btn')){ document.getElementById('burgerDrawer').classList.remove('show'); document.getElementById('overlay').classList.remove('show'); } if(!e.target.closest('.profile-wrap')){ document.getElementById('profileDropdown').classList.remove('show'); } });
async function checkUser(){ const{data}=await supabaseClient.auth.getSession(); const isLoggedIn=!!data.session; document.getElementById('signinLink').style.display=isLoggedIn?'none':'block'; document.getElementById('signupLink').style.display=isLoggedIn?'none':'block'; document.getElementById('signoutTop').style.display=isLoggedIn?'block':'none'; if(isLoggedIn){ document.getElementById('profileName').style.display='block'; } updateHeaderUI(); }
async function handleSignout(){await supabaseClient.auth.signOut(); localStorage.removeItem('personalInfo'); location.href='signin.html'} checkUser();
