import { FastifyReply, FastifyRequest } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import RootFelixHubServiceBase from '../utility/RootFelixHubServiceBase';

export default class ServePageService extends RootFelixHubServiceBase {
    async callBack(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const fileName = this.params?.fileName;
        const code = this.params?.code ?? 200;

        if (!fileName) {
            reply.status(400).send("File name is required");
            return;
        }

        try {
            const staticDir = path.resolve(__dirname, "..", "..", "static");
            const safePath = path.normalize(path.join(staticDir, fileName));


            if (!safePath.startsWith(staticDir)) {
                reply.status(400).send("Invalid file path");
                return;
            }


            const allowedExtensions = [".html", ".css", ".js"];
            if (!allowedExtensions.includes(path.extname(safePath))) {
                reply.status(400).send("Forbidden file type");
                return;
            }

            const data: string = await fs.readFile(safePath, "utf-8");

            reply
                .type("text/html")
                .status(code)
                .send(data);
        } catch (err) {
            reply.status(500).send("Error reading the HTML file");
        }
    }
}
