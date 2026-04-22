import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Store } from '../../store/entities/store.entity';
import { Product } from '../../product/entities/product.entity';

@Entity()
@Unique(['slug', 'store']) 
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  // category.entity.ts

@ManyToOne(() => Store, (store) => store.categories, { 
  onDelete: 'CASCADE'
})
store: Store;

  // Ez a mező kell a Product entitás visszaigazolásához
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}