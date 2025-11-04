import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async create(createReportDto: CreateReportDto, userId: string): Promise<Report> {
    const report = this.reportRepository.create({
      ...createReportDto,
      userId,
    });
    return await this.reportRepository.save(report);
  }

  async findAll(userId?: string): Promise<Report[]> {
    const query = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .orderBy('report.visitDate', 'DESC');

    if (userId) {
      query.where('report.userId = :userId', { userId });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!report) {
      throw new NotFoundException(`Reporte con ID ${id} no encontrado`);
    }

    return report;
  }

  async findByStation(stationId: string): Promise<Report[]> {
    return await this.reportRepository.find({
      where: { stationId },
      relations: ['user'],
      order: { visitDate: 'DESC' },
    });
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    const report = await this.findOne(id);
    Object.assign(report, updateReportDto);
    return await this.reportRepository.save(report);
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
  }

  async getReportsByDateRange(startDate: Date, endDate: Date): Promise<Report[]> {
    return await this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .where('report.visitDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('report.visitDate', 'DESC')
      .getMany();
  }

  async getStats() {
    const totalReports = await this.reportRepository.count();
    const reportsByStatus = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.status')
      .getRawMany();

    const recentReports = await this.reportRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['user'],
    });

    return {
      totalReports,
      reportsByStatus,
      recentReports,
    };
  }
}
