function info(message, meta = {}) {
  console.log(JSON.stringify({ level: 'info', message, meta, ts: new Date().toISOString() }));
}

function error(message, meta = {}) {
  console.error(JSON.stringify({ level: 'error', message, meta, ts: new Date().toISOString() }));
}

module.exports = {
  info,
  error
};
