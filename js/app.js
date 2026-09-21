// js/app.js

function toggleBurger(e){
  if(e) e.stopPropagation();
  document.getElementById('burgerDrawer')?.classList.toggle('show');
  document.getElementById('overlay')?.classList.toggle('show');
}
function toggleProfile(e){
  if(e) e.stopPropagation();
  document.getElementById('profileDropdown')?.classList.toggle('show');
}

const countryCodeMap = {
  "united kingdom":"+44","uk":"+44","england":"+44","turkey":"+90","türkiye":"+90",
  "germany":"+49","deutschland":"+49","france":"+33","spain":"+34","españa":"+34",
  "italy":"+39","italia":"+39","netherlands":"+31","holland":"+31","greece":"+30",
  "poland":"+48","portugal":"+351","indonesia":"+62","china":"+86","usa":"+1",
  "united states":"+1","canada":"+1","australia":"+61","india":"+91","japan":"+81"
};

function autoPhoneCode(){
  const c=document.getElementById('country')?.value.toLowerCase().trim();
  if(c && countryCodeMap[c]) document.getElementById('phoneCode').value=countryCodeMap[c];
}

async function openPI(){
  document.getElementById('profileDropdown')?.classList.remove('show');
  const s=JSON.parse(localStorage.getItem('personalInfo')||'{}');
  let supaFirst='', supaLast='', supaEmail='', supaPhone='', supaStreet='', supaCity='', supaCountry='', supaPostcode='', supaCode='+44';
  try{
    const {data:{session}} = await supabaseClient.auth.getSession();
    if(session && session.user){
      supaEmail = session.user.email || '';
      const meta = session.user.user_metadata || {};
      supaFirst = meta.first_name || meta.firstName || '';
      supaLast = meta.last_name || meta.lastName || '';
      supaPhone = meta.phone || '';
      supaStreet = meta.street || '';
      supaCity = meta.city || '';
      supaCountry = meta.country || '';
      supaPostcode = meta.postcode || '';
      if(meta.phone_code) supaCode = meta.phone_code;
      if(!supaFirst && meta.full_name){
        const p=meta.full_name.trim().split(' ');
        supaFirst=p[0]||''; supaLast=p.slice(1).join(' ')||'';
      }
    }
  }catch(err){}

  document.getElementById('firstName').value = s.firstName || supaFirst || '';
  document.getElementById('lastName').value = s.lastName || supaLast || '';
  document.getElementById('street').value = s.street || supaStreet || '';
  document.getElementById('city').value = s.city || supaCity || '';
  document.getElementById('country').value = s.country || supaCountry || 'United Kingdom';
  document.getElementById('postcode').value = s.postcode || supaPostcode || '';
  document.getElementById('email').value = s.email || supaEmail || '';
  document.getElementById('phoneCode').value = s.phoneCode || supaCode || '+44';
  let ph = s.phone || supaPhone || '';
  if(ph.startsWith('+')){
    const m=ph.match(/^(\+\d{1,4})\s*(.*)$/);
    if(m){ document.getElementById('phoneCode').value=m[1]; ph=m[2]; }
  }
  document.getElementById('phone').value = ph;
  document.getElementById('piModal')?.classList.add('show');
}

function closePI(){
  document.getElementById('piModal')?.classList.remove('show');
}

async function savePI(){
  const phoneCode = document.getElementById('phoneCode').value;
  const phoneNum = document.getElementById('phone').value.trim();
  const fullPhone = phoneCode + ' ' + phoneNum;
  const data={
    firstName:document.getElementById('firstName').value,
    lastName:document.getElementById('lastName').value,
    street:document.getElementById('street').value,
    city:document.getElementById('city').value,
    country:document.getElementById('country').value,
    postcode:document.getElementById('postcode').value,
    email:document.getElementById('email').value,
    phone:fullPhone,phoneCode:phoneCode,phoneNumber:phoneNum
  };
  const old = JSON.parse(localStorage.getItem('personalInfo')||'{}');
  if(old.profilePhoto) data.profilePhoto = old.profilePhoto;
  localStorage.setItem('personalInfo',JSON.stringify(data));
  try{
    await supabaseClient.auth.updateUser({
      data:{
        first_name:data.firstName, last_name:data.lastName,
        full_name:data.firstName+' '+data.lastName,
        phone:fullPhone, phone_code:phoneCode,
        street:data.street, city:data.city, country:data.country, postcode:data.postcode
      }
    });
  }catch(e){ console.log(e); }
  updateHeaderUI();
  alert('Saved!');
  closePI();
}

function uploadPhoto(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    const base64 = ev.target.result;
    const s = JSON.parse(localStorage.getItem('personalInfo')||'{}');
    s.profilePhoto = base64;
    localStorage.setItem('personalInfo', JSON.stringify(s));
    try{ supabaseClient.auth.updateUser({ data:{ avatar_base64: base64 } }); }catch(err){}
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
  if(!nameEl) return;
  const photo = s.profilePhoto;
  if(photo){
    if(dropAvatar) dropAvatar.src = photo;
    if(headAvatar){ headAvatar.src = photo; headAvatar.style.display='block'; }
    if(headIcon) headIcon.style.display='none';
  } else {
    supabaseClient.auth.getSession().then(({data})=>{
      const meta = data.session?.user?.user_metadata || {};
      if(meta.avatar_base64){
        if(dropAvatar) dropAvatar.src = meta.avatar_base64;
        if(headAvatar){ headAvatar.src = meta.avatar_base64; headAvatar.style.display='block'; }
        if(headIcon) headIcon.style.display='none';
        s.profilePhoto = meta.avatar_base64;
        localStorage.setItem('personalInfo', JSON.stringify(s));
      } else {
        if(headAvatar) headAvatar.style.display='none';
        if(headIcon) headIcon.style.display='block';
      }
    });
  }
  if(s.firstName){ nameEl.textContent = s.firstName; nameEl.style.display='block'; }
  else{
    supabaseClient.auth.getSession().then(({data})=>{
      const meta = data.session?.user?.user_metadata || {};
      const fn = s.firstName || meta.first_name || meta.full_name?.split(' ')[0] || '';
      if(fn){ nameEl.textContent=fn; nameEl.style.display='block'; }
    });
  }
}

document.addEventListener('click',function(e){
  if(!e.target.closest('#burgerDrawer') &&!e.target.closest('.burger-btn')){
    document.getElementById('burgerDrawer')?.classList.remove('show');
    document.getElementById('overlay')?.classList.remove('show');
  }
  if(!e.target.closest('.profile-wrap')){
    document.getElementById('profileDropdown')?.classList.remove('show');
  }
});

async function checkUser(){
  const{data}=await supabaseClient.auth.getSession();
  const isLoggedIn=!!data.session;
  const signin = document.getElementById('signinLink');
  const signup = document.getElementById('signupLink');
  if(signin) signin.style.display='none';
  if(signup) signup.style.display='none';
  const so = document.getElementById('signoutDropdown');
  if(so) so.style.display = isLoggedIn? 'block' : 'none';
  if(isLoggedIn){
    const pn=document.getElementById('profileName');
    if(pn) pn.style.display='block';
  }
  updateHeaderUI();
}

async function handleSignout(){
  await supabaseClient.auth.signOut();
  location.href='signin.html';
}

document.addEventListener('DOMContentLoaded', ()=>{
  checkUser();
});
