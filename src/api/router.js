import { Router } from 'express';
import { apiIndex } from './controllers/index.js';
import { list, read } from './controllers/read.js';
import { create } from './controllers/create.js';
import { update } from './controllers/update.js';
import { remove } from './controllers/remove.js';

const apiRouter = Router();

apiRouter.get('/', apiIndex);
apiRouter.get('/:resource', list);
apiRouter.post('/:resource', create);
apiRouter.get('/:resource/:id', read);
apiRouter.put('/:resource/:id', update);
apiRouter.patch('/:resource/:id', update);
apiRouter.delete('/:resource/:id', remove);

export default apiRouter;
