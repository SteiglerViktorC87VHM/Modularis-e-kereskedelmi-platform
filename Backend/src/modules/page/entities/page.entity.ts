
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Store } from 'src/modules/store/entities/store.entity';
import { Component } from 'src/modules/component/entities/component.entity';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string; // Az oldal címe (pl. "Főoldal")

  @Column()
  slug: string; // Az URL (pl. "home" vagy "rolunk")

  @Column({ type: 'jsonb', nullable: true })
  content: any; // Itt tárolod majd a builder konkrét elemeit (widgetek, sorrend stb.)

  @Column({ default: false })
  isHome: boolean; // Jelzi, hogy ez-e a bolt kezdőlapja

  @Column({ type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Store, (store) => store.pages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @OneToMany(() => Component, (component) => component.page)
  components: Component[];

  @CreateDateColumn()
  createdAt: Date;
}
