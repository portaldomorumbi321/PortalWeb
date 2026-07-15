import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthUserDto } from './dto/auth-user.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(payload: LoginDto): Promise<LoginResponseDto>;
    validateFuncionario(email: string, password: string): Promise<AuthUserDto>;
    validateJwtPayload(payload: JwtPayloadDto): Promise<AuthUserDto>;
    private findFuncionarioByEmail;
    private verifyPassword;
    private mapFuncionario;
    private getInitials;
    private resolveDatabaseError;
}
