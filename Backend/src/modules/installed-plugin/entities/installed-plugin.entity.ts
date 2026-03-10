import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Store } from '../../store/entities/store.entity';
import { Plugin } from '../../plugin/entities/plugin.entity';

@Entity('installed_plugins')
export class InstalledPlugin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  store_id: string;

  @Column({ type: 'uuid' })
  plugin_id: string;

  // Itt tároljuk a plugin egyedi beállításait (pl. Stripe titkos kulcs)
  @Column({ type: 'jsonb', nullable: true })
  config: any;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  // KAPCSOLATOK
  @ManyToOne(() => Store, (store) => store.installedPlugins)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => Plugin, (plugin) => plugin.installedPlugins)
  @JoinColumn({ name: 'plugin_id' })
  plugin: Plugin;
}