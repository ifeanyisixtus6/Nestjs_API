import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlogModule } from './blog/blog.module';
import { Blog } from './blog/entities/blog.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        entities: [User, Blog],
         synchronize: true,
    ssl: { rejectUnauthorized: false }, 
      }
    },
      inject: [ConfigService],
      imports: [ConfigModule]
    }),
    UsersModule,
    BlogModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
