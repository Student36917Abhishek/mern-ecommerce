const AuditLog = require("../models/AuditLog");

const logAudit = async ({ actor, actorRole, action, targetType, targetId, details = {} }) => {
  try {
    if (!actor || !action || !targetType || !targetId) {
      return;
    }

    await AuditLog.create({
      actor,
      actorRole: actorRole || "user",
      action,
      targetType,
      targetId: String(targetId),
      details,
    });
  } catch (_error) {
    // Keep business operations non-blocking if audit insert fails.
  }
};

module.exports = { logAudit };