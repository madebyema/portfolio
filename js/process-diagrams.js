'use strict';
(() => {
  const flows = [...document.querySelectorAll('.tsumugi-page .flow, .aurelia-page .flow')];
  if (!flows.length) return;
  const route = document.querySelector('.tsumugi-page .direct-route');
  const eventPage = document.querySelector('.tsumugi-page .sitemap .map-page:last-child');
  let connector, routeLine, arrowhead;
  if (route && eventPage) {
    const ns = 'http://www.w3.org/2000/svg';
    connector = document.createElementNS(ns, 'svg');
    connector.classList.add('direct-route__connector');
    connector.setAttribute('aria-hidden', 'true');
    connector.setAttribute('focusable', 'false');
    routeLine = document.createElementNS(ns, 'path');
    routeLine.setAttribute('fill', 'none');
    routeLine.setAttribute('stroke', 'currentColor');
    routeLine.setAttribute('stroke-width', '3');
    arrowhead = document.createElementNS(ns, 'polygon');
    arrowhead.setAttribute('fill', 'currentColor');
    connector.append(routeLine, arrowhead);
    route.append(connector);
  }
  const gapConnectors = new Map(flows.map(flow => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('flow-gap-connectors');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svg.append(path);
    flow.append(svg);
    return [flow, { svg, path }];
  }));
  let frame;
  const update = () => {
    frame = null;
    if (connector && matchMedia('(min-width:768px)').matches) {
      const label = route.getBoundingClientRect();
      const target = eventPage.getBoundingClientRect();
      const x = target.left + target.width / 2 - label.left;
      const y = target.top - label.top;
      connector.setAttribute('width', label.width);
      connector.setAttribute('height', y);
      routeLine.setAttribute('d', `M 1.5 1.5 H ${x} V ${y - 10}`);
      arrowhead.setAttribute('points', `${x - 7},${y - 10} ${x},${y} ${x + 7},${y - 10}`);
      route.classList.add('direct-route--aligned');
    }
    for (const flow of flows) {
      const sections = [...flow.querySelectorAll('li > .flow-section')];
      const bounds = sections.map(section => section.getBoundingClientRect());
      sections.forEach((section, index) => {
        const next = bounds[index + 1];
        const origin = bounds[index].bottom;
        const length = next ? Math.max(0, next.top - origin) : 0;
        section.style.setProperty('--section-connection', `${length}px`);
        // On stacked layouts the other cards lie in this column. Keep the line
        // behind those cards, including the action card's transparent interior.
        const stops = ['#000 0px'];
        [...section.parentElement.querySelectorAll('.flow-mind, .flow-action')]
          .map(element => element.getBoundingClientRect())
          .filter(rect => rect.top >= origin && rect.bottom <= origin + length)
          .sort((a, b) => a.top - b.top)
          .forEach(rect => {
            const top = rect.top - origin, bottom = rect.bottom - origin;
            stops.push(`#000 ${top}px`, `transparent ${top}px`, `transparent ${bottom}px`, `#000 ${bottom}px`);
          });
        stops.push(`#000 ${length}px`);
        section.style.setProperty('--section-connection-mask', `linear-gradient(to bottom, ${stops.join(', ')})`);
      });
      flow.classList.add('flow--connected');
      if (matchMedia('(max-width:767px)').matches) {
        const { svg, path } = gapConnectors.get(flow);
        const origin = flow.getBoundingClientRect();
        const cards = [...flow.querySelectorAll('.flow-section, .flow-mind, .flow-action')]
          .map(card => card.getBoundingClientRect());
        svg.setAttribute('viewBox', `0 0 ${origin.width} ${origin.height}`);
        // Separate subpaths end at the next card's top edge. No stroke passes
        // behind a transparent card, and the final card has no outgoing line.
        path.setAttribute('d', cards.slice(0, -1).map((card, index) => {
          const next = cards[index + 1];
          if (next.top <= card.bottom) return '';
          const x = card.left + card.width / 2 - origin.left;
          return `M ${x} ${card.bottom - origin.top} V ${next.top - origin.top}`;
        }).join(' '));
      }
    }
  };
  const schedule = () => { if (frame == null) frame = requestAnimationFrame(update); };
  const observer = new ResizeObserver(schedule);
  flows.forEach(flow => {
    observer.observe(flow);
    flow.querySelectorAll('li, .flow-section').forEach(element => observer.observe(element));
  });
  if (route && eventPage) {
    observer.observe(route);
    observer.observe(eventPage);
    observer.observe(eventPage.parentElement);
  }
  window.addEventListener('resize', schedule, { passive:true });
  document.fonts?.ready.then(schedule);
  schedule();
})();
