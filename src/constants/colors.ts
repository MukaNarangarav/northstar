// NorthStar "copper" theme: warm charcoal, brushed copper, soft light.
export const Colors = {
  background: '#13110F', // warm near-black
  card: '#1D1A17', // raised surface
  cardLight: '#2A2521', // pressed / secondary surface
  border: 'rgba(230, 180, 144, 0.10)', // hairline copper border
  star: '#D9A67D', // main copper accent (kept as `star` so old code still works)
  copperLight: '#E6B490',
  copper: '#B27E5A',
  copperDeep: '#6B422D',
  onCopper: '#1A1210', // text on copper buttons
  text: '#F5EEE6', // warm off-white
  textMuted: '#A0968C',
  done: '#9DBB8E', // soft sage
  locked: '#4A423B',
  danger: '#E2775F', // warm red
};

// CSS gradients (React Native supports `backgroundImage` natively).
export const Gradients = {
  copper: 'linear-gradient(135deg, #E6B490 0%, #B27E5A 100%)',
  copperSoft: 'linear-gradient(152deg, rgba(229,194,169,0.16) 0%, rgba(107,66,45,0.10) 100%)',
  screenGlow:
    'radial-gradient(circle at 15% 0%, rgba(178,126,90,0.22) 0%, transparent 55%), radial-gradient(circle at 100% 100%, rgba(107,66,45,0.18) 0%, transparent 60%)',
  // A lit metal sphere: highlight top-left, deep bronze edge bottom-right.
  orb: 'radial-gradient(circle at 32% 28%, #FBE3CF 0%, #E6B490 22%, #C08B5E 48%, #8A5634 75%, #4E2F1F 100%)',
};

export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const Radius = { sm: 12, md: 20, lg: 28, pill: 999 };
