const header=document.querySelector('.site-header');const menuButton=document.querySelector('.menu-toggle');const mobileMenu=document.querySelector('.mobile-nav');const backToTop=document.querySelector('.back-to-top');const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const handleScroll=()=>{header.classList.toggle('scrolled',window.scrollY>60);backToTop.classList.toggle('visible',window.scrollY>400)};window.addEventListener('scroll',handleScroll,{passive:true});handleScroll();menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menuButton.setAttribute('aria-label',open?'Open navigation':'Close navigation');menuButton.querySelector('i').className=open?'bi bi-list':'bi bi-x-lg';mobileMenu.classList.toggle('open',!open)});mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');menuButton.querySelector('i').className='bi bi-list';mobileMenu.classList.remove('open')}));backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'}));const sections=document.querySelectorAll('.reveal');if(reduceMotion){sections.forEach(section=>section.classList.add('is-visible'))}else{const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.2});sections.forEach(section=>observer.observe(section))}document.querySelectorAll('.faq-item button').forEach(button=>{button.addEventListener('click',()=>{const expanded=button.getAttribute('aria-expanded')==='true';document.querySelectorAll('.faq-item button').forEach(item=>item.setAttribute('aria-expanded','false'));if(!expanded)button.setAttribute('aria-expanded','true')})});document.getElementById('search-form').addEventListener('submit',event=>{event.preventDefault();const destination=document.getElementById('destination').value.trim()||'Paris';window.open(`https://www.airbnb.co.uk/s/${encodeURIComponent(destination)}/homes`,'_blank','noopener')});

document.addEventListener('DOMContentLoaded', function(){
  const NAMESPACE = "Airbnb";
  const WEBHOOK_URL = "https://barista-confined-headset.ngrok-free.dev/webhook/chat";
  const launcher = document.getElementById('ai-chat-launcher');
  const panel = document.getElementById('ai-chat-panel');
  const closeBtn = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  if(!launcher || !panel || !form || !input || !messages){ return; }

  let sessionId = localStorage.getItem('ai_chat_session');
  if(!sessionId){ sessionId='sess_'+Math.random().toString(36).slice(2); localStorage.setItem('ai_chat_session', sessionId); }

  let greeted = false;

  function setOpen(open){
    panel.hidden = !open;
    launcher.classList.toggle('open', open);
    launcher.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if(open){
      if(!greeted){
        addBotMessage("Hi! I'm your AI assistant. Ask me anything about our products, services, or how we can help.");
        greeted = true;
      }
      setTimeout(()=>input.focus(), 150);
    }
  }

  function toggle(){ setOpen(panel.hidden); }

  launcher.addEventListener('click', toggle);
  launcher.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); } });
  if(closeBtn){ closeBtn.addEventListener('click', function(){ setOpen(false); }); }

  function addMsg(text, who){
    const el = document.createElement('div');
    el.className = 'ai-chat-msg ' + who;
    if(who === 'bot'){
      const icon = document.createElement('span');
      icon.className = 'ai-chat-bot-icon';
      icon.innerHTML = '<i class="bi bi-stars"></i>';
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      el.appendChild(icon);
      el.appendChild(textSpan);
    } else {
      el.textContent = text;
    }
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function addBotMessage(text){ addMsg(text, 'bot'); }

  function showTyping(){
    const el = document.createElement('div');
    el.className = 'ai-chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    addMsg(text, 'user');
    input.value = '';
    const typing = showTyping();
    try{
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ message: text, namespace: NAMESPACE, sessionId })
      });
      const data = await res.json();
      typing.remove();
      addBotMessage(data.reply || "Sorry, I didn't get a response. Please try again.");
    }catch(err){
      typing.remove();
      addBotMessage("I'm having trouble connecting right now. Please try again in a moment.");
    }
  });
});
