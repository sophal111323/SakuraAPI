import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { ResellerApiGuard } from './guards/reseller-api.guard';

import { Admin2faService } from './admin-2fa.service';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'sakura_dev_secret_key_minimum_32_characters_long_12345',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, Admin2faService, JwtStrategy, RolesGuard, ResellerApiGuard],
  exports: [AuthService, Admin2faService, JwtStrategy, PassportModule, JwtModule, RolesGuard, ResellerApiGuard],
})
export class AuthModule {}
