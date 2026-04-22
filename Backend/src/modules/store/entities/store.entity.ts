import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, OneToOne } from 'typeorm';
import { Category } from 'src/modules/category/entities/category.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Page } from 'src/modules/page/entities/page.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { InstalledPlugin } from 'src/modules/installed-plugin/entities/installed-plugin.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { StoreConfig } from './store-config';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Category, (category) => category.store)
  categories: Category[];

  @ManyToOne(() => User, (user) => user.stores, { nullable: false })
  owner: User;

  @OneToMany(() => Page, (page) => page.store)
  pages: Page[];

  @OneToMany(() => Order, (order) => order.store)
  orders: Order[];

  @OneToMany(() => InstalledPlugin, (installedPlugin) => installedPlugin.store)
  installedPlugins: InstalledPlugin[];

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToOne(() => StoreConfig, (config) => config.store, { cascade: true })
  config: StoreConfig;
  store: StoreConfig[];
}
