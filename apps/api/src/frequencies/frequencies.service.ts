import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFrequencyDto } from './dto/create-frequency.dto';
import { UpdateFrequencyDto } from './dto/update-frequency.dto';

@Injectable()
export class FrequenciesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.frequency.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { city: 'asc' }]
    });
  }

  findAll() {
    return this.prisma.frequency.findMany({ orderBy: [{ sortOrder: 'asc' }, { city: 'asc' }] });
  }

  create(dto: CreateFrequencyDto) {
    return this.prisma.frequency.create({ data: dto });
  }

  update(id: number, dto: UpdateFrequencyDto) {
    return this.prisma.frequency.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.frequency.delete({ where: { id } });
  }
}
