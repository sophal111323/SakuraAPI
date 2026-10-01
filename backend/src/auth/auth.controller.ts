import { Controller, Post, Get, Body, Req, UseGuards, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2faDto, Resend2faDto } from './dto/verify-2fa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new reseller account' })
  @ApiResponse({ status: 201, description: 'Reseller registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login as Reseller or Admin (triggers 2FA for Admin)' })
  @ApiResponse({ status: 200, description: 'Logged in successfully or 2FA required' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or inactive account' })
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || 'Unknown';
    return this.authService.login(dto, ip, userAgent);
  }

  @Post('admin/verify-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Admin 2FA code or 256-character Secret Key' })
  @ApiResponse({ status: 200, description: '2FA verified, admin session granted' })
  @ApiResponse({ status: 401, description: 'Invalid or expired 2FA code' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async verifyAdmin2fa(@Body() dto: Verify2faDto, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.authService.verifyAdmin2fa(dto, ip);
  }

  @Post('admin/resend-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend fresh 2FA code and 256-character Secret Key to Telegram' })
  @ApiResponse({ status: 200, description: 'New 2FA code sent' })
  async resendAdmin2fa(@Body() dto: Resend2faDto, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.authService.resendAdmin2fa(dto, ip);
  }

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login or Register directly with Telegram OAuth Widget' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully with Telegram' })
  @ApiResponse({ status: 401, description: 'Invalid Telegram signature' })
  async telegramAuth(@Body() dto: any) {
    return this.authService.telegramLogin(dto);
  }

  @Post('telegram/oidc')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login or Register with Telegram OpenID Connect (OIDC)' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully via Telegram OIDC' })
  @ApiResponse({ status: 401, description: 'Invalid authorization code or exchange failure' })
  async telegramOidcAuth(@Body() body: { code?: string; redirectUri?: string }) {
    if (!body || !body.code) {
      throw new BadRequestException('Authorization code is required');
    }
    return this.authService.telegramOidcLogin(body.code, body.redirectUri || '');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('api-key')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}
