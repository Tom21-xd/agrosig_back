import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  stationId: string;

  @IsString()
  @IsOptional()
  stationName?: string;

  @IsDateString()
  @IsNotEmpty()
  visitDate: Date;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  activities?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}
