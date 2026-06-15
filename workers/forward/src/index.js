// Email Worker for cloudnative.lv — forwards inbound mail (hello@, info@) to the
// organizers. Destinations come from the FORWARD_TO secret (comma-separated) so
// personal addresses stay out of the repo:  npx wrangler secret put FORWARD_TO
// The trigger addresses are configured as Email Routing rules in the dashboard.
export default {
  async email(message, env) {
    const recipients = (env.FORWARD_TO || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const to of recipients) {
      try {
        await message.forward(to);
        console.log(`forwarded to ${to}`);
      } catch (err) {
        console.error(`forward to ${to} failed:`, err);
      }
    }
  },
};
