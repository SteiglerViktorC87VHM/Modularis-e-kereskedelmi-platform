import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { Category } from 'src/modules/category/entities/category.entity'; // Ez a kapcsolat a kategóriákkal, ha szükséges
import { User } from 'src/modules/user/entities/user.entity';
import { Page } from 'src/modules/page/entities/page.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { InstalledPlugin } from 'src/modules/installed-plugin/entities/installed-plugin.entity';
import { Product } from 'src/modules/product/entities/product.entity';


@Entity('stores') // Ez mondja meg a Dockernek, hogy 'stores' legyen a tábla neve
export class Store {
  @PrimaryGeneratedColumn('uuid') // Automatikus, egyedi azonosító (pl: 550e8400-e29b...)
  id: string;

  @Column({ unique: true }) // A bolt neve (pl: "Pékség")
  name: string;

  @Column({ unique: true }) // Az URL barát név (pl: "pekseg-bolt")
  slug: string;

  @Column({ type: 'jsonb', nullable: true }) // Itt tároljuk majd a Builder látványtervét!
  config: any;

  @CreateDateColumn() // Automatikusan menti a létrehozás idejét
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

}
