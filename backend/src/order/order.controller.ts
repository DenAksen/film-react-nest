import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';
import { LoggerFactory } from '../logger/logger.factory';
import { getErrorMessage, getErrorStack } from '../utils/error.utils';

@Controller('order')
export class OrderController {
  private readonly logger = LoggerFactory.createLogger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log('Incoming request: POST /order');
    this.logger.debug('Request body:', {
      ticketsCount: createOrderDto.tickets?.length || 0,
    });

    try {
      const result = await this.orderService.createOrder(createOrderDto);
      this.logger.log(
        `Response: POST /order - success, created ${result.total} tickets`,
      );
      return result;
    } catch (error) {
      if (
        getErrorMessage(error)?.includes('already taken') ||
        getErrorMessage(error)?.includes('mismatch')
      ) {
        this.logger.warn(`POST /order conflict: ${getErrorMessage(error)}`);
        throw new HttpException(getErrorMessage(error), HttpStatus.CONFLICT);
      }

      this.logger.error('POST /order failed', getErrorStack(error));
      throw new HttpException(
        'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
