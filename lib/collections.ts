import source from './portfolio.json';

// Keep original IDs and media URLs for playback and historical analytics.
// AI work originally embedded on the editing page belongs in the AI collection.
const aiAssets = new Set(source.filter(v => v.collection === 'ai').map(v => v.src.split('/').pop()));
export const portfolio = source
  .filter(v => !(v.collection === 'general' && v.category === 'AI Cinema' && aiAssets.has(v.src.split('/').pop())))
  .map(v => v.category === 'AI Cinema' ? {...v, collection: 'ai'} : v);
