// attendees Worker (SKELETON) — aggregate event RSVPs into the R2 CSV source of
// truth (attendees/<event-id>.csv). Not implemented yet. Runs on a schedule.
// NOTE: LinkedIn data is collected locally (off-CI, TOS) and merged here by email.
export default {
  async scheduled(event, env) {
    // TODO: pull Eventbrite + OCG RSVPs, dedupe by email, write to R2.
    console.log("attendees worker: not implemented");
  },
};
