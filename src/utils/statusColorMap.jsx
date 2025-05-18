const statusColorMap = {
  new: 'bg-sky-100 text-sky-800',           // Soft blue, welcoming
  picking: 'bg-amber-100 text-amber-800',   // Friendly amber/yellow
  picked: 'bg-cyan-100 text-cyan-800',      // Calm cyan
  packing: 'bg-pink-100 text-pink-800',     // Playful pink
  packed: 'bg-violet-100 text-violet-800',  // Distinct violet
  delivered: 'bg-green-100 text-green-800', // Success green
  cancelled: 'bg-red-100 text-red-800',     // (Optional) Clear red for cancelled
};

export default statusColorMap;