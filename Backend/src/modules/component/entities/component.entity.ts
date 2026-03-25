// src/modules/component/entities/component.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Page } from 'src/modules/page/entities/page.entity';

@Entity('components')
export class Component {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // pl. 'hero', 'navbar', 'footer', 'product-grid'

  @Column({ type: 'jsonb' })
  config: any; // A komponens egyedi beállításai

  @Column({ default: 0 })
  order: number; // A megjelenítési sorrend az oldalon belül

  @Column({ type: 'uuid' })
  pageId: string;

  @ManyToOne(() => Page, (page) => page.components, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pageId' })
  page: Page;
}
