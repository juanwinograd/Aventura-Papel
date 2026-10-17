import { ILLUSTRATION_FILES } from './illustration-files.js';

// The optional compile-time replacement embeds the same drawings in the
// downloadable HTML. In development and Pages, paths stay relative to index.
const sources=typeof __PAPER_ASSETS__==='undefined'?ILLUSTRATION_FILES:__PAPER_ASSETS__;
export const illustrations=new Map();
export const illustrationsReady=Promise.all(Object.entries(sources).map(async([theme,src])=>{
  const image=new Image();image.src=src;
  try{await image.decode();illustrations.set(theme,image);}catch{/* Keep the pencil scenery usable if an image is unavailable. */}
}));
