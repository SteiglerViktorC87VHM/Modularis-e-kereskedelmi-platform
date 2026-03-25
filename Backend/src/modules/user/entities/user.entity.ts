import { Store } from 'src/modules/store/entities/store.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Role } from '../enum/role.enum';

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

  @Column({
  type: 'enum',
  enum: Role,
  default: Role.USER,
})
role: Role;

  @CreateDateColumn()
  createdAt: Date;

@OneToMany(() => Store, (store) => store.owner)
stores: Store[];

}
