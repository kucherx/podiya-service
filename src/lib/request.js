export function wantsJson(req) {
  return req.get('X-Requested-With') === 'fetch';
}
