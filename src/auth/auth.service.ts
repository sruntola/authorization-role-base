import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { constants } from './constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async signIn(createAuthDto: CreateAuthDto) {
    try {
      const result = await this.prisma.user.findUnique({
        where: {
          email: createAuthDto.email,
        },
      });

      if (!result) {
        throw new NotFoundException('User is not found...');
      }
      const isMatch = bcrypt.compareSync(
        createAuthDto.password,
        result.password,
      );
      if (isMatch) {
        const payload = {
          email: result.email,
          id: result.id,
          roles: result.roles,
        };
        const token = await this.jwtService.sign(payload, {
          secret: constants.secret,
        });
        return {
          access_token: token,
        };
      }
    } catch (ex) {
      throw new ForbiddenException(ex.message);
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  async getProfile(id: number) {
    console.log({ userID: id });
    try {
      if (!id) {
        throw new ForbiddenException('User ID is required...');
      }
      const result = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      if (!result) {
        throw new NotFoundException('User is not exist...');
      }
      return result;
    } catch (ex) {
      throw new ForbiddenException(ex.message);
    }
  }

  async signUp(createAuthDto: CreateAuthDto) {
    try {
      const existEmail = await this.prisma.user.findUnique({
        where: {
          email: createAuthDto.email,
        },
      });
      if (existEmail) {
        throw new ForbiddenException('User is already exist, please sign in');
      }

      const salt = bcrypt.genSaltSync(15);
      const hash = bcrypt.hashSync(createAuthDto.password, salt);
      return await this.prisma.user.create({
        data: {
          email: createAuthDto.email,
          name: createAuthDto.name,
          password: hash,
        },
      });
    } catch (ex) {
      throw new ForbiddenException(ex.message);
    }
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
