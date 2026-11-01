(async function () {
  const nameEl = document.getElementById('profile-name');
  if (!nameEl) return;

  const session = await requireAuth();
  if (!session) return;
  const user = session.user;

  // Personal info
  const { data: profile } = await db
    .from('profiles')
    .select('full_name, created_at')
    .eq('id', user.id)
    .single();

  const displayName = (profile && profile.full_name) || user.email.split('@')[0];
  nameEl.textContent = displayName;
  document.getElementById('profile-avatar').textContent = displayName.charAt(0).toUpperCase();
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-since').textContent = formatDate(
    (profile && profile.created_at) || user.created_at
  );

  // My pins
  const postsEl = document.getElementById('posts');
  const countEl = document.getElementById('profile-count');

  const { data: pins, error } = await db
    .from('pins')
    .select('id, title, description, location_name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    postsEl.textContent = 'Could not load your pins.';
    return;
  }

  let count = pins.length;
  countEl.textContent = count;

  if (count === 0) {
    postsEl.textContent = 'You haven’t shared any kindness yet.';
    return;
  }

  pins.forEach((pin) => {
    const card = document.createElement('article');
    card.className = 'post';

    const title = document.createElement('h3');
    title.textContent = pin.title;

    const desc = document.createElement('p');
    desc.textContent = pin.description;

    const meta = document.createElement('p');
    meta.className = 'post-date';
    const place = pin.location_name ? pin.location_name + ' · ' : '';
    meta.textContent = place + formatDate(pin.created_at);

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      if (!confirm('Delete this pin?')) return;
      const { error } = await db.from('pins').delete().eq('id', pin.id);
      if (error) { alert(error.message); return; }
      card.remove();
      count -= 1;
      countEl.textContent = count;
      if (count === 0) postsEl.textContent = 'You haven’t shared any kindness yet.';
    });

    card.append(title, desc, meta, del);
    postsEl.appendChild(card);
  });
})();