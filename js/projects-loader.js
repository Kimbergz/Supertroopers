/* Supertroopers — automatic project list.
   Drop projects/project3.html (copy of an existing project page) and it
   appears on the Projects page automatically. Numbering: project1, project2... */

(() => {
  'use strict';

  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const MAX_PROJECTS = 24;

  const buildCard = (n, doc) => {
    const text = (sel) => {
      const el = doc.querySelector(sel);
      return el ? el.textContent.trim() : '';
    };
    const title = text('main h1');
    if (!title) return null;
    const status = text('main .kicker').toLowerCase().includes('upcoming') ? 'upcoming' : 'completed';

    const card = document.createElement('article');
    card.className = 'project-card reveal in';
    card.dataset.status = status;

    const media = document.createElement('div');
    media.className = 'card-media';
    const photo = doc.querySelector('.detail-photo');
    const src = photo ? (photo.getAttribute('src') || '') : '';
    if (src) {
      const img = document.createElement('img');
      img.src = src.replace(/^\.\.\//, '');
      img.alt = photo.getAttribute('alt') || title;
      img.loading = 'lazy';
      media.appendChild(img);
    }
    const chip = document.createElement('span');
    chip.className = status === 'upcoming' ? 'chip chip-accent chip-dot' : 'chip';
    chip.textContent = status === 'upcoming' ? 'Upcoming' : 'Completed';
    media.appendChild(chip);
    card.appendChild(media);

    const body = document.createElement('div');
    body.className = 'card-body';
    const meta = document.createElement('p');
    meta.className = 'card-meta';
    meta.textContent = text('main .card-meta');
    body.appendChild(meta);
    const heading = document.createElement('h3');
    heading.textContent = title;
    body.appendChild(heading);
    const desc = document.createElement('p');
    const firstPara = text('.detail-body p');
    desc.textContent = firstPara.length > 150 ? firstPara.slice(0, 147) + '…' : firstPara;
    body.appendChild(desc);
    const pills = doc.querySelectorAll('.impact-list li');
    if (pills.length) {
      const list = document.createElement('ul');
      list.className = 'impact-list';
      pills.forEach((pill) => {
        const item = document.createElement('li');
        item.textContent = pill.textContent.trim();
        list.appendChild(item);
      });
      body.appendChild(list);
    }
    const cta = document.createElement('p');
    cta.className = 'card-cta';
    const link = document.createElement('a');
    link.className = 'text-link';
    link.href = 'projects/project' + n + '.html';
    link.textContent = status === 'upcoming' ? 'See what we will do' : 'Read what we did';
    cta.appendChild(link);
    body.appendChild(cta);
    card.appendChild(body);
    return card;
  };

  const parser = new DOMParser();
  const numbers = Array.from({ length: MAX_PROJECTS }, (_, i) => i + 1);
  Promise.all(
    numbers.map((n) =>
      fetch('projects/project' + n + '.html')
        .then((response) => (response.ok ? response.text() : null))
        .then((html) => (html ? { n, doc: parser.parseFromString(html, 'text/html') } : null))
        .catch(() => null)
    )
  ).then((results) => {
    const cards = results
      .filter(Boolean)
      .map(({ n, doc }) => buildCard(n, doc))
      .filter(Boolean);
    if (!cards.length) {
      const empty = document.getElementById('projectsEmpty');
      if (empty) empty.hidden = false;
      return;
    }
    cards.forEach((card) => grid.appendChild(card));
  });
})();
