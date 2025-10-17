import { FastifyReply, FastifyRequest } from 'fastify';
import RootFelixHubServiceBase from '../utility/RootFelixHubServiceBase';

const endDate = new Date(2026, 4, 28, 15, 0, 0, 0);


export default class TimeLeft extends RootFelixHubServiceBase {
    async callBack(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        reply.send(endDate.getTime());

    }
}
