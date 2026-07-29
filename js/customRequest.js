// customRequest.js
// Logic for the public "Design Your Own" / Make Your Own request page.
// Submits into the `custom_requests` table — always manually quoted,
// never auto-priced. The reference-photo uploader is a preview-only
// placeholder for this demo: it is not persisted anywhere.

import { getSupabaseClient, isUsingLocalMode } from './supabaseClient.js';

let selectedCategory = '';
let selectedMaterials = [];
let uploadedFileName = null;
let uploadedFileDataUrl = null;

const form = document.getElementById('custom-request-form');
const feedback = document.getElementById('custom-request-feedback');
const successBlock = document.getElementById('custom-request-success');
const categoryList = document.getElementById('custom-category-list');
const materialsChips = document.getElementById('custom-materials-chips');
const uploadZone = document.getElementById('custom-upload-zone');
const fileInput = document.getElementById('custom-file-input');
const uploadPreview = document.getElementById('custom-upload-preview');
const submitBtn = document.getElementById('custom-request-submit');
const whatsappBtn = document.getElementById('custom-whatsapp-submit');

document.addEventListener('DOMContentLoaded', () => {
  if (isUsingLocalMode()) {
    const badge = document.getElementById('local-mode-badge');
    if (badge) badge.style.display = 'inline-block';
  }

  loadCategories();
  setupMaterialChips();
  setupUpload();
  form.addEventListener('submit', handleSubmit);
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', handleCustomWhatsApp);
  }
});

// --- Load real catalog categories so the "starting point" chips match the store ---
async function loadCategories() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error) throw error;

    (data || []).forEach(cat => {
      const li = document.createElement('li');
      li.className = 'category-filter-item';
      li.dataset.category = cat.name;
      li.innerHTML = `<span>${escapeHTML(cat.name)}</span>`;
      categoryList.appendChild(li);
    });

    categoryList.querySelectorAll('.category-filter-item').forEach(item => {
      item.addEventListener('click', () => {
        categoryList.querySelectorAll('.category-filter-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        selectedCategory = item.dataset.category || '';
      });
    });
  } catch (error) {
    console.error('Could not load categories:', error.message);
  }
}

// --- Material preference chips (multi-select, not priced) ---
function setupMaterialChips() {
  materialsChips.querySelectorAll('.option-value-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const material = btn.dataset.material;
      const idx = selectedMaterials.indexOf(material);
      if (idx >= 0) {
        selectedMaterials.splice(idx, 1);
        btn.classList.remove('selected');
      } else {
        selectedMaterials.push(material);
        btn.classList.add('selected');
      }
    });
  });
}

// --- Reference photo — stored as Data URL ---
function setupUpload() {
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
  });
}

function handleFile(file) {
  uploadedFileName = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedFileDataUrl = e.target.result;
    uploadPreview.innerHTML = `
      <div style="position: relative; display:inline-block; margin-top:10px;">
        <img src="${uploadedFileDataUrl}" alt="Reference preview" style="width: 110px; height: 110px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px; max-width: 110px;">${escapeHTML(file.name)}</p>
      </div>
    `;
  };
  reader.readAsDataURL(file);
}

// --- Send via WhatsApp ---
function handleCustomWhatsApp() {
  const name = document.getElementById('custom-name').value.trim() || '';
  const phone = document.getElementById('custom-phone').value.trim() || '';
  const description = document.getElementById('custom-description').value.trim();
  const dimensionsNote = document.getElementById('custom-dimensions').value.trim();

  if (!description) {
    showFeedback('Please describe what you are picturing before sending via WhatsApp.', 'error');
    return;
  }

  let message = `Hello! 👋\nI have a custom furniture request:\n\n` +
    `📌 *Category:* ${selectedCategory || 'Custom Design'}\n` +
    `📝 *Description:* ${description}\n`;

  if (dimensionsNote) message += `📐 *Dimensions:* ${dimensionsNote}\n`;
  if (selectedMaterials.length) message += `🪵 *Materials:* ${selectedMaterials.join(', ')}\n`;
  if (uploadedFileName) message += `🖼️ *Photo:* ${uploadedFileName}\n`;
  if (name) message += `\n👤 *Name:* ${name}`;
  if (phone) message += `\n📞 *Phone:* ${phone}`;

  const encodedMsg = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
}

// --- Submit Web Request ---
async function handleSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('custom-name').value.trim();
  const phone = document.getElementById('custom-phone').value.trim();
  const description = document.getElementById('custom-description').value.trim();
  const dimensionsNote = document.getElementById('custom-dimensions').value.trim();

  if (!name || !phone || !description) {
    showFeedback('Please fill in your name, phone, and a description of what you want.', 'error');
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  const referenceNote = uploadedFileDataUrl
    ? `Reference Photo (${uploadedFileName}): ${uploadedFileDataUrl}`
    : (uploadedFileName ? `Reference Photo: ${uploadedFileName}` : '');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const { error } = await supabase.from('custom_requests').insert({
      customer_name: name,
      phone: phone,
      category: selectedCategory || null,
      description: description,
      dimensions_note: dimensionsNote || null,
      materials_note: selectedMaterials.length ? selectedMaterials.join(', ') : null,
      reference_note: referenceNote || null,
      status: 'new',
    });

    if (error) throw error;

    form.style.display = 'none';
    successBlock.style.display = 'block';

  } catch (error) {
    console.error('Failed to submit custom request:', error.message);
    showFeedback('Could not send your request: ' + error.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Web Request';
  }
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = 'feedback-message';
  if (type === 'error') feedback.classList.add('feedback-error');
  else if (type === 'success') feedback.classList.add('feedback-success');
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
