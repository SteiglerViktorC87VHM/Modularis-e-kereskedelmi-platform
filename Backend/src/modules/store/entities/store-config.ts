import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';

@Entity('store_configs')
export class StoreConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '#3b82f6' })
  primaryColor: string;

  @Column({ default: '#001529' })
  secondaryColor: string;

  @Column({ default: '#0a0f1a' })
  backgroundColor: string;

  @Column({ nullable: true })
  logoUrl: string;

  // Ezt hagytam le véletlenül az előbb!
  @Column({ default: 'Üdvözöljük boltunkban!' })
  bannerText: string;

  // Ez pedig az új mező a blokkok mentéséhez
  @Column({ type: 'json', nullable: true })
  blocks: any;

  @OneToOne(() => Store, (store) => store.config, { onDelete: 'CASCADE' })
  @JoinColumn()
  store: Store;
}