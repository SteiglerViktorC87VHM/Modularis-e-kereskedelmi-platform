import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';


@Injectable()
export class OrderService {

constructor(
@InjectRepository(Order)
private orderRepository: Repository<Order>

){}

   async create(createOrderDto: CreateOrderDto) {
    return  await this.orderRepository.save(createOrderDto);
  }

  async findAll() {
    return await this.orderRepository.find({
      relations: ['items']
    });
  }

async findOne(id: string) {
    return await this.orderRepository.findOne({
      where: { id },
      relations: ['items']
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return await this.orderRepository.update(id, updateOrderDto);
  }

  async remove(id: string) {
    return await this.orderRepository.delete(id);
  }
}
