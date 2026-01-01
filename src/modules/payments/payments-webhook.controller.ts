// Payments Webhook Controller

import {
    Controller,
    Post,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { opayWebhookSchema } from './schemas';
import type { OPayWebhookDto } from './schemas';
import { Public } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/pipes';

@Controller('webhooks/payments')
@Public()
export class PaymentsWebhookController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * OPay webhook callback
     * POST /api/v1/webhooks/payments/opay
     */
    @Post('opay')
    @HttpCode(HttpStatus.OK)
    async handleOPayWebhook(
        @Body(new ZodValidationPipe(opayWebhookSchema)) dto: OPayWebhookDto,
        @Headers('x-opay-signature') signature?: string,
    ) {
        // In production, verify the webhook signature
        // For now, we'll process the webhook directly
        return this.paymentsService.handleWebhook({
            ...dto,
            signature,
        });
    }
}
