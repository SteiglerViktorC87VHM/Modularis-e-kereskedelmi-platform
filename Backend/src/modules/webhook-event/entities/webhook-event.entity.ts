import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from 'src/modules/order/entities/order.entity'; 
import { Plugin } from 'src/modules/plugin/entities/plugin.entity'; // Figyelj az elérési útra!

@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Kapcsolat a Plugin táblával (logs)
  @ManyToOne(() => Plugin, (plugin) => plugin.webhookEvents, { nullable: true })
  @JoinColumn({ name: 'plugin_id' })
  plugin: Plugin;

  @Column({ nullable: true })
  plugin_id: string;

  // Kapcsolat az Order táblával (triggers)
  @ManyToOne(() => Order, (order) => order.webhookEvents, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ nullable: true })
  order_id: string;

  @Column()
  event_type: string; // A diagramod alapján: event_type

  @Column({ type: 'jsonb' })
  payload: any;

  @CreateDateColumn()
  created_at: Date;
}
