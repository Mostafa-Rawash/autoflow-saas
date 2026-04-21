const { withClient, setTenant } = require('../db');

async function runWithTenant(organizationId, fn) {
  return withClient(async (client) => {
    await setTenant(client, organizationId);
    return fn(client);
  });
}

module.exports = {
  runWithTenant
};
