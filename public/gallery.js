async function load() {
  const res = await fetch('/api/images');
  if (!res.ok) throw new Error('Failed to load images');
  const imgs = await res.json();
  const small = document.getElementById('small');
  const medium = document.getElementById('medium');
  const large = document.getElementById('large');
  const count = document.getElementById('imageCount');
  count.textContent = `${imgs.length} ${imgs.length === 1 ? 'image' : 'images'}`;

  if (!imgs.length) {
    document.getElementById('emptyState').hidden = false;
    return;
  }

  imgs.forEach(img => {
    // classify by size (bytes) or dimensions if available
    let place = 'small';
    if (img.size >= 300 * 1024) place = 'large';
    else if (img.size >= 80 * 1024) place = 'medium';

    const el = document.createElement('article');
    el.className = 'image-card';
    const image = document.createElement('img');
    image.src = `/images/${img.id}`;
    image.alt = img.filename || 'image';
    image.loading = 'lazy';

    const details = document.createElement('div');
    details.className = 'image-details';
    const name = document.createElement('strong');
    name.textContent = img.filename || 'Untitled image';
    const meta = document.createElement('span');
    meta.textContent = [img.width && img.height ? `${img.width} x ${img.height}` : '', formatSize(img.size)].filter(Boolean).join('  |  ');

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteImage(img.id, el));
    details.append(name, meta, deleteButton);
    el.append(image, details);

    if (place === 'small') small.appendChild(el);
    else if (place === 'medium') medium.appendChild(el);
    else large.appendChild(el);
  });
}

function formatSize(bytes) {
  if (!bytes) return '0 KB';
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

async function deleteImage(id, card) {
  if (!window.confirm('Delete this image permanently?')) return;
  const button = card.querySelector('.delete-button');
  button.disabled = true;
  try {
    const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    card.remove();
    const count = document.getElementById('imageCount');
    const remaining = document.querySelectorAll('.image-card').length;
    count.textContent = `${remaining} ${remaining === 1 ? 'image' : 'images'}`;
    if (!remaining) document.getElementById('emptyState').hidden = false;
  } catch (err) {
    button.disabled = false;
    window.alert('Could not delete the image. Please try again.');
  }
}

window.addEventListener('DOMContentLoaded', () => load().catch(() => {
  document.getElementById('emptyState').textContent = 'Unable to load the gallery right now.';
  document.getElementById('emptyState').hidden = false;
}));
