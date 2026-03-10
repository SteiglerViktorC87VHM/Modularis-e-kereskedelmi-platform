import { Store } from 'src/modules/store/entities/store.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true }) 
  username: string;

  @Column()
  password: string;

  @Column({ default: 'customer' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

@ManyToMany(() => Store, (store) => store.users)
@JoinTable()
stores: Store[];

}
