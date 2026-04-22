
import { Column,PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Store } from "src/modules/store/entities/store.entity";
import { OrderItem } from "./order-item.entity";
import { WebhookEvent } from "src/modules/webhook-event/entities/webhook-event.entity";

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  store_id: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'shipped', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  created_at: Date;

  // Kapcsolatok
  @ManyToOne(() => Store, (store) => store.orders, { 
  onDelete: 'CASCADE' 
})
@JoinColumn({ name: 'store_id' })
store: Store;
  
 

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => WebhookEvent, (webhookEvent) => webhookEvent.order)
  webhookEvents: WebhookEvent[];

}
