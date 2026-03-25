import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { WebhookEvent } from '../../webhook-event/entities/webhook-event.entity';
import { InstalledPlugin } from 'src/modules/installed-plugin/entities/installed-plugin.entity';

@Entity('plugins')
export class Plugin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // pl. 'Stripe Payment Gateway'

  @Column()
  version: string; // pl. 'v1.0.0'

  @Column({ type: 'text', nullable: true })
  description: string; // "Ez a plugin teszi lehetővé a bankkártyás fizetést."

  @Column({ name: 'sdk_version' })
  sdk_version: string; // Kompatibilitás ellenőrzéséhez

  @CreateDateColumn()
  created_at: Date;

  // KAPCSOLAT: Egy plugin sok webhook eseményt generálhat
  @OneToMany(() => WebhookEvent, (event) => event.plugin)
  webhookEvents: WebhookEvent[];

  @OneToMany(() => InstalledPlugin, (installedPlugin) => installedPlugin.plugin)
  installedPlugins: InstalledPlugin[];

}
