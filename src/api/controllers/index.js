import { ROLES } from '../../auth/roles.js';
import { resources } from '../resources.js';

export function apiIndex(req, res) {
  const role = req.user?.role || ROLES.GUEST;
  res.json({
    name: 'Podiya REST API',
    version: '1.0.0',
    authenticated: Boolean(req.user),
    role,
    resources: Object.values(resources).map((resource) => ({
      key: resource.key,
      href: `/api/${resource.key}`,
      filters: resource.filters
    })),
    endpoints: [
      'GET /api/:resource',
      'GET /api/:resource/:id',
      'POST /api/:resource',
      'PUT /api/:resource/:id',
      'PATCH /api/:resource/:id',
      'DELETE /api/:resource/:id'
    ]
  });
}
