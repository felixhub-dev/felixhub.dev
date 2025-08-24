import { FastifyReply, FastifyRequest } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import RootFelixHubServiceBase from '../utility/RootFelixHubServiceBase';

export default class FelixHubServeQueryService extends RootFelixHubServiceBase {
    // Override the callback method to implement the service logic
    public async callBack(
        req: FastifyRequest<{ Params: { projectName: string } }>,
        reply: FastifyReply
    ): Promise<void> {
        if (!this.params || !this.params.folder) {
            reply.status(500).send({ error: 'Service parameters are missing or incomplete.' });
            return;
        }

        const folder: string = this.params.folder;
        const queryName = req.params.projectName;

        try {
            // Resolve and normalize paths
            const staticDir = path.resolve(__dirname, "..", "..", "static", folder);
            const safePath = path.normalize(path.join(staticDir, `${queryName.slice(1)}.html`));

            // Ensure the path is inside the intended folder
            if (!safePath.startsWith(staticDir)) {
                reply.status(400).send({ error: 'Invalid file path' });
                return;
            }

            // Optional: allow only .html files
            if (path.extname(safePath) !== '.html') {
                reply.status(400).send({ error: 'Forbidden file type' });
                return;
            }

            // Check if file exists
            if (await this.utils.fileExists(safePath)) {
                const data: string = await fs.readFile(safePath, 'utf-8');
                reply.type('text/html').send(data);
            } else {
                console.log(`File not found at: ${safePath}`);
                reply.status(404).send({ error: 'File not found' });
            }
        } catch (error) {
            console.error(`Error while serving query: ${error}`);
            reply.status(500).send({ error: 'Internal server error' });
        }
    }
}
