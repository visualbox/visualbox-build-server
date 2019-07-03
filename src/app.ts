import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';

import * as buildController from './controllers/build';

dotenv.config();

const app = express();
app.set('port', process.env.SERVER_PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', buildController.build);

export default app;
