    import { Entity ,PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';
    import { Category } from 'src/modules/category/entities/category.entity';

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

    @ManyToOne(() => Category, category => category.products)
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column({ type: 'uuid' })
    categoryId: string;

    }

