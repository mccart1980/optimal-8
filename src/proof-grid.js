/* ================================================================
   THE PROOF'S GRID — one plan for every fitness level, emphasis and
   format, at every camp length from one week to a fitted Prep: the
   seasons proof 6 scans, prescriptions and pages.
   ================================================================ */
export const FITS = ["low", "moderate", "good"];
export const EMS = ["none", "power", "strength", "durability"];
export const FORMATS = [[3, 2, 60], [4, 2, 60], [3, 3, 60], [5, 3, 60], [6, 3, 60], [8, 3, 60], [10, 3, 60], [12, 3, 90]];
export const LENGTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 16, 24];
export const GRID = (() => {
  const out = [];
  FITS.forEach((fitness) => EMS.forEach((emphasis) => FORMATS.forEach(([rounds, mins, rest]) => LENGTHS.forEach((weeks) => {
    const from = "2027-01-04", fight = new Date(Date.UTC(2027, 0, 4 + 7 * (weeks - 1) + 5)).toISOString().slice(0, 10);
    out.push({ fitness, emphasis, rounds, mins, weeks, today: "2027-01-01",
      plans: [{ from, made: "2027-01-01", inputs: { booked: true, fight, rounds, mins, rest, fitness, emphasis, weighIn: "before" } }] });
  }))));
  return out;
})();
