/* Demears Dachshunds — shared behaviour across all pages */

const contactInfo = {
  whatsappNumber: '61437437650',
  phone: '+61437437650',
  email: 'Meisha@demearsdachshunds.com'
};

document.addEventListener('DOMContentLoaded', function(){
  const t = document.getElementById('menuToggle');
  const l = document.getElementById('navLinks');
  if(t && l) t.addEventListener('click', () => l.classList.toggle('open'));
  injectModals();
});

/* Shared photo/video gallery builder (used by puppy + family modals) */
function buildGallery(mainPhotoEl, thumbsEl, item, altText){
  const media = item.media || (item.photoUrls ? item.photoUrls.map(u => ({type:'image', url:u})) : null);
  const count = media ? media.length : (item.photos || 1);
  let current = 0;

  const render = (i) => {
    current = i;
    if(media && media[i]){
      const m = media[i];
      if(m.type === 'youtube' || m.type === 'drive'){
        mainPhotoEl.innerHTML = '<iframe src="' + m.url + '" style="width:100%;height:100%;border:0;border-radius:6px;" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';
        mainPhotoEl.style.cursor = 'default';
        mainPhotoEl.onclick = null;
      } else if(m.type === 'video'){
        mainPhotoEl.innerHTML = '<video src="' + m.url + '" controls style="width:100%;height:100%;object-fit:contain;border-radius:6px;"></video>';
        mainPhotoEl.style.cursor = 'default';
        mainPhotoEl.onclick = null;
      } else {
        mainPhotoEl.innerHTML = '<img src="' + m.url + '" alt="' + altText + '">';
        // Al hacer clic en la foto grande, pasar a la siguiente (si hay más de una)
        if(count > 1){
          mainPhotoEl.style.cursor = 'pointer';
          mainPhotoEl.onclick = () => selectThumb((current + 1) % count);
        } else {
          mainPhotoEl.style.cursor = 'default';
          mainPhotoEl.onclick = null;
        }
      }
    } else {
      mainPhotoEl.innerHTML = 'Photo ' + (i + 1);
      mainPhotoEl.onclick = null;
    }
  };

  const selectThumb = (i) => {
    render(i);
    thumbsEl.querySelectorAll('.thumb').forEach((el, idx) => el.classList.toggle('active', idx === i));
  };

  render(0);
  thumbsEl.innerHTML = '';
  for(let i = 0; i < count; i++){
    const t = document.createElement('div');
    t.className = 'thumb' + (i === 0 ? ' active' : '');
    if(media && media[i] && media[i].type === 'image'){
      t.innerHTML = '<img src="' + media[i].url + '" alt="">';
    } else if(media && media[i] && (media[i].type === 'video' || media[i].type === 'youtube' || media[i].type === 'drive')){
      t.textContent = '▶';
    } else {
      t.textContent = i + 1;
    }
    t.onclick = () => selectThumb(i);
    thumbsEl.appendChild(t);
  }
}

/* Inject the enquiry + waitlist modals into every page */
function injectModals(){
  const html = `
  <div class="modal-overlay" id="consultModal" onclick="if(event.target===this) closeConsult()">
    <div class="modal-box"><button class="modal-close" onclick="closeConsult()" aria-label="Close">✕</button>
    <div class="modal-content" style="padding-top:34px">
      <p class="eyebrow">Enquiry</p>
      <h2 id="consultName">Make an enquiry</h2>
      <p>Leave your details and we'll get back to you. Fields marked * are required.</p>
      <form class="inquiry" id="enquiryForm" novalidate onsubmit="return submitEnquiry(event)">
        <div><label for="eName">Your name *</label><input id="eName" type="text"><span class="err" id="eName-err"></span></div>
        <div><label for="eEmail">Email *</label><input id="eEmail" type="email"><span class="err" id="eEmail-err"></span></div>
        <div><label for="ePhone">Phone (optional)</label><input id="ePhone" type="tel"></div>
        <div><label for="eMsg">Message *</label><textarea id="eMsg"></textarea><span class="err" id="eMsg-err"></span></div>
        <button type="submit">Send enquiry</button>
      </form>
    </div></div>
  </div>
  <div class="modal-overlay" id="waitlistModal" onclick="if(event.target===this) closeWaitlist()">
    <div class="modal-box"><button class="modal-close" onclick="closeWaitlist()" aria-label="Close">✕</button>
    <div class="modal-content" style="padding-top:34px">
      <p class="eyebrow">Waitlist</p>
      <h2>Join the waitlist</h2>
      <p>We'll let you know when a new litter arrives. You choose how often we message you, so nothing gets lost.</p>
      <form class="inquiry" id="waitlistForm" novalidate onsubmit="return submitWaitlist(event)">
        <div><label for="wName">Your name *</label><input id="wName" type="text"><span class="err" id="wName-err"></span></div>
        <div><label for="wEmail">Email *</label><input id="wEmail" type="email"><span class="err" id="wEmail-err"></span></div>
        <div><label for="wPhone">Phone (optional)</label><input id="wPhone" type="tel"></div>
        <div><label>How many upcoming litters to hear about?</label>
          <div class="counter"><button type="button" onclick="stepCount('litters',-1)" aria-label="fewer">−</button><span id="litters-val">1</span><button type="button" onclick="stepCount('litters',1)" aria-label="more">+</button></div>
        </div>
        <div><label>Max messages per litter</label>
          <div class="counter"><button type="button" onclick="stepCount('msgs',-1)" aria-label="fewer">−</button><span id="msgs-val">2</span><button type="button" onclick="stepCount('msgs',1)" aria-label="more">+</button></div>
          <p class="hint">So the puppy you're waiting for doesn't get lost among too many messages.</p>
        </div>
        <button type="submit">Join the waitlist</button>
      </form>
    </div></div>
  </div>`;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
}

/* Counters for the waitlist */
const counts = { litters: 1, msgs: 2 };
function stepCount(key, d){
  counts[key] = Math.min(10, Math.max(1, counts[key] + d));
  document.getElementById(key + '-val').textContent = counts[key];
}

/* Enquiry modal */
function openConsult(id){
  let msg = '';
  const title = document.getElementById('consultName');
  if(typeof puppyProfiles !== 'undefined' && id && puppyProfiles[id]){
    if(title) title.textContent = 'Enquiry about ' + puppyProfiles[id].name;
    msg = "Hi! I'm interested in enquiring about " + puppyProfiles[id].name + ".";
  } else if(title){
    title.textContent = 'Make an enquiry';
  }
  const m = document.getElementById('eMsg'); if(m) m.value = msg;
  clearErrors('enquiryForm');
  document.getElementById('consultModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeConsult(){
  const el = document.getElementById('consultModal');
  if(el){ el.classList.remove('open'); document.body.style.overflow = ''; }
}

/* Waitlist modal */
function openWaitlist(){
  clearErrors('waitlistForm');
  document.getElementById('waitlistModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeWaitlist(){
  const el = document.getElementById('waitlistModal');
  if(el){ el.classList.remove('open'); document.body.style.overflow = ''; }
}

/* Validation helpers */
function setErr(id, ok, message){
  const field = document.getElementById(id);
  const errEl = document.getElementById(id + '-err');
  if(!field) return true;
  if(ok){ field.classList.remove('bad'); if(errEl) errEl.textContent = ''; }
  else { field.classList.add('bad'); if(errEl) errEl.textContent = message || 'Required'; }
  return ok;
}
function clearErrors(formId){
  document.querySelectorAll('#' + formId + ' .bad').forEach(x => x.classList.remove('bad'));
  document.querySelectorAll('#' + formId + ' .err').forEach(x => x.textContent = '');
}
function validEmail(v){ return /.+@.+\..+/.test(v); }

/* Submit handlers — for now they open a pre-filled WhatsApp message.
   Later, n8n can replace window.open(...) with a fetch() to a webhook. */
function submitEnquiry(e){
  e.preventDefault();
  const name = document.getElementById('eName').value.trim();
  const email = document.getElementById('eEmail').value.trim();
  const phone = document.getElementById('ePhone').value.trim();
  const msg = document.getElementById('eMsg').value.trim();
  let ok = true;
  ok = setErr('eName', name !== '') && ok;
  ok = setErr('eEmail', validEmail(email), 'Enter a valid email') && ok;
  ok = setErr('eMsg', msg !== '') && ok;
  if(!ok) return false;
  const text = 'New enquiry\nName: ' + name + '\nEmail: ' + email + (phone ? ('\nPhone: ' + phone) : '') + '\n\n' + msg;
  window.open('https://wa.me/' + contactInfo.whatsappNumber + '?text=' + encodeURIComponent(text), '_blank');
  closeConsult();
  return false;
}

function submitWaitlist(e){
  e.preventDefault();
  const name = document.getElementById('wName').value.trim();
  const email = document.getElementById('wEmail').value.trim();
  const phone = document.getElementById('wPhone').value.trim();
  let ok = true;
  ok = setErr('wName', name !== '') && ok;
  ok = setErr('wEmail', validEmail(email), 'Enter a valid email') && ok;
  if(!ok) return false;
  const text = 'Waitlist request\nName: ' + name + '\nEmail: ' + email + (phone ? ('\nPhone: ' + phone) : '') +
    '\nLitters to hear about: ' + counts.litters + '\nMax messages per litter: ' + counts.msgs;
  window.open('https://wa.me/' + contactInfo.whatsappNumber + '?text=' + encodeURIComponent(text), '_blank');
  closeWaitlist();
  return false;
}

/* Close any open modal with Escape */
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){
    closeConsult();
    closeWaitlist();
    if(typeof closeProfile === 'function') closeProfile();
    if(typeof closeFamily === 'function') closeFamily();
  }
});
