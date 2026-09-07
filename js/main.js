document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (toggle && header) toggle.addEventListener('click', () => {
    const open = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 10), {passive:true});

  const revealItems = document.querySelectorAll('.section,.page-hero,.food-card,.flavour-card,.contact-card,.menu-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('reveal','visible'); observer.unobserve(e.target); }
    }), {threshold:.08});
    revealItems.forEach(el => { if (!el.classList.contains('page-hero')) el.classList.add('reveal'); observer.observe(el); });
  }

  const steps = [...document.querySelectorAll('.checkout-step')];
  const progress = [...document.querySelectorAll('.progress-step')];
  let state = {box:'The Club Box', price:18, limit:2, qty:1, method:'Collection', fee:0};

  const money = n => `£${n.toFixed(2).replace('.00','')}`;
  const selectedFlavours = () => [...document.querySelectorAll('.flavour.selected')].map(x => x.childNodes[0].textContent.trim());

  const updateSummary = () => {
    const fs = selectedFlavours();
    document.getElementById('summary-box')?.replaceChildren(document.createTextNode(state.box));
    document.getElementById('summary-price')?.replaceChildren(document.createTextNode(money(state.price)));
    document.getElementById('summary-flavours')?.replaceChildren(document.createTextNode(`${fs.length} selected`));
    document.getElementById('summary-qty')?.replaceChildren(document.createTextNode(state.qty));
    document.getElementById('summary-delivery')?.replaceChildren(document.createTextNode(state.fee ? money(state.fee) : 'FREE'));
    document.getElementById('summary-total')?.replaceChildren(document.createTextNode(money(state.price * state.qty + state.fee)));
    const qty = document.getElementById('qty'); if (qty) qty.textContent = state.qty;
  };

  const showStep = n => {
    steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === n));
    progress.forEach((p,i) => p.classList.toggle('active', i < n));
    window.scrollTo({top:document.querySelector('.checkout-shell')?.offsetTop - 100 || 0, behavior:'smooth'});
    if (n === 4) updateReview();
  };

  const updateReview = () => {
    const fs = selectedFlavours();
    const date = document.getElementById('date')?.value || 'Not selected';
    const time = document.getElementById('time')?.value || 'Not selected';
    const name = document.getElementById('name')?.value || 'Not entered';
    document.getElementById('review-box').textContent = `${state.box} × ${state.qty}`;
    document.getElementById('review-flavours').textContent = fs.length ? fs.join(', ') : 'None selected';
    document.getElementById('review-qty').textContent = `${state.qty}`;
    document.getElementById('review-method').textContent = state.method + (state.fee ? ` (${money(state.fee)})` : ' (free)');
    document.getElementById('review-slot').textContent = `${date} · ${time}`;
    document.getElementById('review-customer').textContent = name;
  };

  const toast = message => {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className='toast'; document.body.appendChild(el); }
    el.textContent = message; el.classList.add('show');
    clearTimeout(window.__toast); window.__toast = setTimeout(() => el.classList.remove('show'), 2600);
  };

  const choices = [...document.querySelectorAll('.choice')];
  if (choices.length) {
    const flavours = [...document.querySelectorAll('.flavour')];
    choices.forEach(c => c.addEventListener('click', () => {
      choices.forEach(x => x.classList.remove('selected')); c.classList.add('selected');
      state.box = c.dataset.box; state.price = Number(c.dataset.price); state.limit = Number(c.dataset.limit);
      flavours.forEach(f => f.classList.remove('selected')); updateSummary();
      const note=document.getElementById('selection-note'); if(note) note.textContent=`Choose up to ${state.limit} flavours for this box.`;
    }));
    flavours.forEach(f => f.addEventListener('click', () => {
      if (f.classList.contains('selected')) f.classList.remove('selected');
      else if (document.querySelectorAll('.flavour.selected').length < state.limit) f.classList.add('selected');
      else toast(`You can choose up to ${state.limit} flavours for this box.`);
      updateSummary();
    }));
    document.getElementById('minus')?.addEventListener('click',()=>{state.qty=Math.max(1,state.qty-1);updateSummary()});
    document.getElementById('plus')?.addEventListener('click',()=>{state.qty=Math.min(20,state.qty+1);updateSummary()});
    document.querySelectorAll('.fulfil').forEach(f=>f.addEventListener('click',()=>{
      document.querySelectorAll('.fulfil').forEach(x=>x.classList.remove('selected'));f.classList.add('selected');
      state.method=f.dataset.method;state.fee=Number(f.dataset.fee);updateSummary();
    }));
    document.querySelectorAll('.next-step').forEach(btn=>btn.addEventListener('click',()=>{
      if(btn.dataset.next==='2' && !selectedFlavours().length){toast('Choose at least one flavour to continue.');return;}
      if(btn.dataset.next==='3' && state.method==='Delivery' && !document.getElementById('postcode').value.trim()){ /* postcode is collected on next step */ }
      showStep(Number(btn.dataset.next));
    }));
    document.querySelectorAll('.prev-step').forEach(btn=>btn.addEventListener('click',()=>showStep(Number(btn.dataset.prev))));
    document.getElementById('checkout')?.addEventListener('click',()=>toast('Secure payment will be connected here next.'));
    updateSummary();
  }
});
