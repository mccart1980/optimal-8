/* ================================================================
   THE PROGRAM

   One selector decides which program is running, and every screen —
   the header, TODAY, WEEK, TRACK, PLAN, the timers — reads it from
   here. `st.program` is the switch; `st.camp` is the old Camp Mode
   flag, still honoured for settings saved before the switch existed.
   ================================================================ */

export const PROGRAM_NAME = {
  prep: "OPTIMAL 8 · PREP",
  camp: "CAMP",
  fighter: "OPTIMAL 8 FIGHTER",
  transition: "TRANSITION",
};

export function programOf(st) {
  const p = st && st.program;
  if (p === "prep" || p === "camp" || p === "transition") return p;
  return st && st.camp ? "camp" : "fighter";
}

/* The settings patch that switches programs, so the old flag never
   disagrees with the new one. */
export const programPatch = (program) => ({ program, camp: program === "camp" });

/* "[PROGRAM NAME] · WEEK n · [BLOCK]". The Fighter's weeks run inside a
   macrocycle, so its line is the name and the week. */
export function programTitle(program, week, block) {
  const parts = [PROGRAM_NAME[program] || PROGRAM_NAME.fighter, "WEEK " + week];
  if (block && program !== "fighter") parts.push(block);
  return parts.join(" · ");
}
