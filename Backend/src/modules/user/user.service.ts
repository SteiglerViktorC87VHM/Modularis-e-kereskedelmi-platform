import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {

constructor(
    @InjectRepository(User) 
    private userRepository: Repository<User>,
  ) {}

// Ez a metódus keresi meg a felhasználót az email címe alapján
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      // Ha a jövőben több kapcsolódó adatot is le akarsz kérni (pl. boltokat), 
      // ide írhatod majd a relations-t is.
    });
  }

  // A regisztrációhoz szükséges metódus (ezt már korábban beszéltük, de legyen itt egyben)
 async create(userData: CreateUserDto): Promise<User> {
  // Ellenőrizzük, hogy van-e jelszó az érkező adatok között
  if (!userData.password) {   
    throw new Error('Jelszó megadása kötelező!');
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  const newUser = this.userRepository.create({
    ...userData,
    password: hashedPassword,
  });
  
  return this.userRepository.save(newUser);
}


  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({ where: { id }, 
    relations: ['stores']
  });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    return await this.userRepository.delete(id);
  }
}
