/* ================================================================
   THE PROGRAM

   The season decides which program a week runs — Prep, the camp, the
   transition — and Optimal 8 Fighter is the classic, picked in
   Settings when no fight is booked. These are their names.
   ================================================================ */

export const PROGRAM_NAME = {
  prep: "OPTIMAL 8 · PREP",
  camp: "CAMP",
  fighter: "OPTIMAL 8 FIGHTER",
  transition: "TRANSITION",
};

/* "[PROGRAM NAME] · WEEK n · [BLOCK]". The Fighter's weeks run inside a
   macrocycle, so its line is the name and the week. */
export function programTitle(program, week, block) {
  const parts = [PROGRAM_NAME[program] || PROGRAM_NAME.fighter, "WEEK " + week];
  if (block && program !== "fighter") parts.push(block);
  return parts.join(" · ");
}
