import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class LikeDto {
  @ApiProperty()
  @IsBoolean()
  like: boolean;
}
