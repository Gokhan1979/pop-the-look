// js/supabase.js
const supabaseClient = supabase.createClient(
  "https://pslsuittihsaeeyrihgr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbHN1aXR0aWhzYWVleXJpaGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDE4MjYsImV4cCI6MjEwNTQxNzgyNn0.dZEAEHzbOgaPHzQWWzk1whjPFmmME8G2kuvAc4b72mI"
);

// Fix for email confirmation token loop
(async ()=>{
  if(window.location.hash && window.location.hash.includes('access_token')){
    console.log('Found access_token in URL, processing...');
    const { data } = await supabaseClient.auth.getSession();
    setTimeout(()=>{
      history.replaceState(null, null, window.location.pathname);
      if(data.session && typeof checkUser === 'function'){
        checkUser();
      }
    }, 800);
  }
})();
