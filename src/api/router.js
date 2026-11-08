import { Router } from 'express';
import { apiIndex } from './controllers/index.js';
import { list, read } from './controllers/read.js';
import { create } from './controllers/create.js';
import { update } from './controllers/update.js';
import { remove } from './controllers/remove.js';
import { login, logout, me, register } from './controllers/auth.js';
import { getProfile, updatePassword, updateProfile } from './controllers/profile.js';
import { cancel, checkIn, pay } from './controllers/tickets.js';
import {
  createUser,
  deleteUser,
  listUsers,
  readUser,
  resetPassword,
  updateUser
} from './controllers/users.js';
import { eventFormReference } from './controllers/reference.js';

const apiRouter = Router();

apiRouter.get('/', apiIndex);
apiRouter.get('/reference/event-form', eventFormReference);

apiRouter.post('/auth/login', login);
apiRouter.post('/auth/register', register);
apiRouter.post('/auth/logout', logout);
apiRouter.get('/auth/me', me);

apiRouter.get('/profile', getProfile);
apiRouter.put('/profile', updateProfile);
apiRouter.patch('/profile', updateProfile);
apiRouter.post('/profile/password', updatePassword);

apiRouter.get('/users', listUsers);
apiRouter.post('/users', createUser);
apiRouter.get('/users/:id', readUser);
apiRouter.put('/users/:id', updateUser);
apiRouter.patch('/users/:id', updateUser);
apiRouter.delete('/users/:id', deleteUser);
apiRouter.post('/users/:id/password', resetPassword);

apiRouter.post('/tickets/:id/pay', pay);
apiRouter.post('/tickets/:id/check-in', checkIn);
apiRouter.post('/tickets/:id/cancel', cancel);

apiRouter.get('/:resource', list);
apiRouter.post('/:resource', create);
apiRouter.get('/:resource/:id', read);
apiRouter.put('/:resource/:id', update);
apiRouter.patch('/:resource/:id', update);
apiRouter.delete('/:resource/:id', remove);

export default apiRouter;
