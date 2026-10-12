/* ------------------------------------------------------------------ */
/*  The 24 official waves of the OL-in-One Compass, in the order of    */
/*  the official list: 7 Principles, 7 Perspectives, 10 Dimensions.    */
/*                                                                     */
/*  "id" follows the codes already used in the app (P1..P7, Pe1..Pe7,  */
/*  D1..D10). "label" is what is printed on the physical wave, and     */
/*  "aliases" are other spellings seen in the documents and photos.    */
/*  This file is independent of the app's own label files, so changing */
/*  it cannot affect the other pages.                                  */
/* ------------------------------------------------------------------ */

export const TYPES = ['Principle', 'Perspective', 'Dimension'];

export const WAVES = [
  // Principles (green)
  { id: 'P1', type: 'Principle', name: 'One big ocean', label: 'ONE BIG OCEAN', aliases: [] },
  { id: 'P2', type: 'Principle', name: 'Earth-shaper', label: 'EARTH-SHAPER', aliases: ['EARTH SHAPER'] },
  { id: 'P3', type: 'Principle', name: 'Climate regulator', label: 'CLIMATE-REGULATOR', aliases: ['CLIMATE REGULATOR'] },
  { id: 'P4', type: 'Principle', name: 'Life-enabler', label: 'LIFE-ENABLER', aliases: ['LIFE ENABLER'] },
  { id: 'P5', type: 'Principle', name: 'Greatly diverse', label: 'GREATLY DIVERSE', aliases: [] },
  { id: 'P6', type: 'Principle', name: 'Interconnected with humans', label: 'INTERCONNECTED WITH HUMANS', aliases: ['INTERCONNECTED'] },
  { id: 'P7', type: 'Principle', name: 'Largely unknown', label: 'LARGELY UNKNOWN', aliases: [] },

  // Perspectives (light blue)
  { id: 'Pe1', type: 'Perspective', name: 'Science', label: 'SCIENCE', aliases: [] },
  { id: 'Pe2', type: 'Perspective', name: 'History', label: 'HISTORY', aliases: [] },
  { id: 'Pe3', type: 'Perspective', name: 'Geography', label: 'GEOGRAPHY', aliases: [] },
  { id: 'Pe4', type: 'Perspective', name: 'Gender equality', label: 'GENDER EQUALITY', aliases: ['GENDER EQUITY'] },
  { id: 'Pe5', type: 'Perspective', name: 'Value', label: 'VALUE', aliases: [] },
  { id: 'Pe6', type: 'Perspective', name: 'Culture', label: 'CULTURE', aliases: [] },
  { id: 'Pe7', type: 'Perspective', name: 'Sustainability', label: 'SUSTAINABILITY', aliases: [] },

  // Dimensions (dark blue)
  { id: 'D1', type: 'Dimension', name: 'Knowledge', label: 'KNOWLEDGE', aliases: [] },
  { id: 'D2', type: 'Dimension', name: 'Communication', label: 'COMMUNICATION', aliases: [] },
  { id: 'D3', type: 'Dimension', name: 'Behaviour', label: 'BEHAVIOUR', aliases: ['BEHAVIOR'] },
  { id: 'D4', type: 'Dimension', name: 'Attitude', label: 'ATTITUDE', aliases: [] },
  { id: 'D5', type: 'Dimension', name: 'Awareness', label: 'AWARENESS', aliases: [] },
  { id: 'D6', type: 'Dimension', name: 'Activism', label: 'ACTIVISM', aliases: [] },
  { id: 'D7', type: 'Dimension', name: 'Emocean', label: 'EMOCEAN', aliases: ['EMOCEANS'] },
  { id: 'D8', type: 'Dimension', name: 'Experience', label: 'EXPERIENCE', aliases: [] },
  { id: 'D9', type: 'Dimension', name: 'Adaptive capacity', label: 'ADAPTIVE CAPACITY', aliases: [] },
  { id: 'D10', type: 'Dimension', name: 'Trust & transparency', label: 'TRUST & TRANSPARENCY', aliases: ['TRUST AND TRANSPARENCY'] },
];

export const WAVE_IDS = WAVES.map((w) => w.id);

/* ------------------------------------------------------------------ */
/*  Reference answers for the six example maps (checked by hand        */
/*  against the original, unprocessed photos). Used only by the        */
/*  detection test page to measure accuracy.                           */
/* ------------------------------------------------------------------ */
export const REFERENCE_MAPS = {
  '01': ['P6', 'Pe3', 'P3', 'P1', 'Pe1', 'P4', 'Pe7', 'Pe5', 'D5', 'D1', 'D3', 'D8', 'D2', 'D4'],
  '02': ['Pe6', 'D3', 'D8', 'Pe2', 'P6', 'D5', 'Pe1', 'Pe7', 'D1'],
  '03': ['D2', 'Pe7', 'P5', 'P6', 'Pe3', 'Pe1', 'D1', 'Pe5', 'D5'],
  '04': ['Pe7', 'Pe6', 'Pe5', 'P6', 'D1', 'D5', 'D4', 'D3', 'D7'],
  '05': [...WAVE_IDS],
  '06': ['D10', 'Pe1', 'Pe7', 'P1', 'Pe4', 'D6', 'D2', 'D1', 'D5', 'D3', 'D8', 'P6', 'D7', 'Pe6', 'Pe3'],
};

// "map-04.jpg", "04.HEIC", "04 - Posidonia.png" -> "04" (only if it is one of the six references)
export const referenceKey = (fileName) => {
  const match = String(fileName).match(/(\d+)/);
  if (!match) return null;
  const key = String(parseInt(match[1], 10)).padStart(2, '0');
  return REFERENCE_MAPS[key] ? key : null;
};
