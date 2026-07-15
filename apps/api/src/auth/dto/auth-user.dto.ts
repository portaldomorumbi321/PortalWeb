import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;

  @ApiProperty({ example: 'Consultor(a)' })
  role!: string;

  @ApiProperty({ example: 'Comercial' })
  department!: string;

  @ApiProperty({ example: 'Ativo' })
  status!: string;

  @ApiProperty({ example: 'MS' })
  initials!: string;

  @ApiProperty({ example: 'Administrador' })
  accessLevel!: string;

  @ApiProperty({ example: 'maria@empresa.com' })
  email!: string;

  @ApiProperty({ example: 'https://cdn.exemplo.com/foto.jpg', required: false })
  photo?: string;
}
