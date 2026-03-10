import { Store } from "src/modules/store/entities/store.entity";
import { Entity,PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany ,JoinColumn  } from"typeorm";
import { Product } from "src/modules/product/entities/product.entity";

@Entity('categories')
export class Category {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    name: string;

    @Column({unique: true})
    slug: string;

    @Column({ type: 'uuid' })
    storeId: string;


    @CreateDateColumn()
    createdAt: Date;

// Kapcsolat a bolttal
@ManyToOne(() => Store, (store) => store.categories, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'storeId' }) 
store: Store;

// Kapcsolat a termékekkel (A termék "gazdája" a kategória)
@OneToMany(() => Product, (product) => product.category)
products: Product[];


}