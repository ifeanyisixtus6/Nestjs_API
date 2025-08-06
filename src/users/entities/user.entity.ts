import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { UserRole } from "../enums/enum";
import { Blog } from '../../blog/entities/blog.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({type: 'enum', enum: UserRole, default: UserRole.User})
    role: UserRole;

    @OneToMany(() => Blog, (blog) => blog.author)
  blogs: Blog[];

  @Column({ default: false })
isDeleted: boolean;
  static isDeleted: boolean;

}
