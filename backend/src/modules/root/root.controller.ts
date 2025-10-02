import { Request, Response } from 'express';

import { Get, Controller, Res, Req, Param, Logger, Query } from '@nestjs/common';

import {
    REQUEST_TEMPLATE_TYPE_VALUES,
    TRequestTemplateTypeKeys,
} from '@remnawave/backend-contract';

import { ClientIp } from '@common/decorators/get-ip';

import { RootService } from './root.service';

@Controller()
export class RootController {
    private readonly logger = new Logger(RootController.name);

    constructor(private readonly rootService: RootService) {}

    @Get('api/download')
    async proxyDownload(
        @Query('url') url: string,
        @Query('filename') filename: string,
        @Res() response: Response,
    ) {
        if (!url) {
            this.logger.error('Missing url parameter');
            response.status(400).send('Missing url parameter');
            return;
        }

        if (!filename) {
            this.logger.error('Missing filename parameter');
            response.status(400).send('Missing filename parameter');
            return;
        }

        // Строгая валидация filename - только безопасные символы
        const filenameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!filenameRegex.test(filename)) {
            this.logger.error(`Invalid filename format: ${filename}`);
            response.status(400).send('Invalid filename format');
            return;
        }

        // Проверка длины filename
        if (filename.length > 255) {
            this.logger.error(`Filename too long: ${filename.length} characters`);
            response.status(400).send('Filename too long (max 255 characters)');
            return;
        }

        return await this.rootService.proxyFileDownload(url, filename, response);
    }

    @Get([':shortUuid', ':shortUuid/:clientType'])
    async root(
        @ClientIp() clientIp: string,
        @Req() request: Request,
        @Res() response: Response,
        @Param('shortUuid') shortUuid: string,
        @Param('clientType') clientType: string,
    ) {
        if (request.path.startsWith('/assets') || request.path.startsWith('/locales')) {
            response.socket?.destroy();
            return;
        }

        if (clientType === undefined) {
            return await this.rootService.serveSubscriptionPage(
                clientIp,
                request,
                response,
                shortUuid,
            );
        }

        if (!REQUEST_TEMPLATE_TYPE_VALUES.includes(clientType as TRequestTemplateTypeKeys)) {
            this.logger.error(`Invalid client type: ${clientType}`);

            response.socket?.destroy();
            return;
        } else {
            return await this.rootService.serveSubscriptionPage(
                clientIp,
                request,
                response,
                shortUuid,
                clientType as TRequestTemplateTypeKeys,
            );
        }
    }
}
