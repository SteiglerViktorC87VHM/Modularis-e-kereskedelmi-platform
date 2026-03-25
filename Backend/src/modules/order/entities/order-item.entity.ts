import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity'; // Ügyelj a pontos elérési útra!

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string; // PK - UUID azonosító

  @Column({ type: 'uuid' })
  order_id: string; // FK - A szülő rendelés azonosítója

  @Column({ type: 'uuid' })
  product_id: string; // FK - A megrendelt termék azonosítója

  @Column({ type: 'int' })
  quantity: number; // A rendelt mennyiség

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number; // Az egységár a vásárlás pillanatában

  // KAPCSOLATOK DEFINIÁLÁSA

  // Sok tétel tartozhat egyetlen rendeléshez (Many-to-One)
  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Sok rendelési tétel mutathat ugyanarra a termékre (Many-to-One)
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}