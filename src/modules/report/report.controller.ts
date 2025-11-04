import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN)
  async create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user: any,
  ) {
    const report = await this.reportService.create(createReportDto, user.id);
    return {
      success: true,
      message: 'Reporte creado exitosamente',
      data: report,
    };
  }

  @Get()
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN)
  async findAll(@CurrentUser() user: any, @Query('all') all?: string) {
    const userId = user.role === UserRole.ADMIN || all === 'true' ? undefined : user.id;
    const reports = await this.reportService.findAll(userId);
    return {
      success: true,
      data: reports,
    };
  }

  @Get('stats')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  async getStats() {
    const stats = await this.reportService.getStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Get('station/:stationId')
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN)
  async findByStation(@Param('stationId') stationId: string) {
    const reports = await this.reportService.findByStation(stationId);
    return {
      success: true,
      data: reports,
    };
  }

  @Get('date-range')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  async getByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const reports = await this.reportService.getReportsByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
    return {
      success: true,
      data: reports,
    };
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    const report = await this.reportService.findOne(id);
    return {
      success: true,
      data: report,
    };
  }

  @Patch(':id')
  @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    const report = await this.reportService.update(id, updateReportDto);
    return {
      success: true,
      message: 'Reporte actualizado exitosamente',
      data: report,
    };
  }

  @Delete(':id')
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.reportService.remove(id);
    return {
      success: true,
      message: 'Reporte eliminado exitosamente',
    };
  }
}
