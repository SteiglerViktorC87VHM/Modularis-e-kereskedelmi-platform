 import { Entity ,PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';
 import { Category } from 'src/modules/category/entities/category.entity';
 import { Store } from 'src/modules/store/entities/store.entity';

   // src/modules/product/entities/product.entity.ts
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  // Közvetlen kapcsolat a bolttal
  @Column({ type: 'uuid' })
  storeId: string;

 @ManyToOne(() => Store, (store) => store.products, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  
  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}