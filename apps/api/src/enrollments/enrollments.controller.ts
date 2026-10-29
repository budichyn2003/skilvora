import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { EnrollmentsService } from './enrollments.service';
import type { PaymentProofUpload } from './payment-proof-storage.service';

const ALLOWED_PROOF_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

type AuthenticatedRequest = Request & { user: { id: string; role: Role } };

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('certificates/verify/:code')
  verifyCertificate(@Param('code') code: string) {
    return this.enrollmentsService.verifyCertificate(code);
  }

  @Get('certificates/me')
  @UseGuards(AuthGuard('jwt'))
  getMyCertificates(@Req() request: AuthenticatedRequest) {
    return this.enrollmentsService.getMyCertificates(request.user.id);
  }

  @Get('certificates')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  getCertificatesForAdmin() {
    return this.enrollmentsService.getCertificatesForAdmin();
  }

  @Post('certificates/:id/revoke')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  revokeCertificate(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.revokeCertificate(
      id,
      request.user.id,
      reason || '',
    );
  }

  @Get('certificates/:id/pdf')
  @UseGuards(AuthGuard('jwt'))
  async downloadCertificate(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const pdf = await this.enrollmentsService.getCertificatePdf(
      request.user.id,
      id,
    );
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="skilvora-certificate-${id}.pdf"`,
    );
    response.send(pdf);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  getMyEnrollments(@Req() request: AuthenticatedRequest) {
    return this.enrollmentsService.getMyEnrollments(request.user.id);
  }

  @Get('payments/me')
  @UseGuards(AuthGuard('jwt'))
  getMyPayments(@Req() request: AuthenticatedRequest) {
    return this.enrollmentsService.getMyPayments(request.user.id);
  }

  @Get('payments/admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  getPaymentsForAdmin() {
    return this.enrollmentsService.getPaymentsForAdmin();
  }

  @Get('payments/admin/:id/proof')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getPaymentProof(@Param('id') id: string, @Res() response: Response) {
    const proof = await this.enrollmentsService.getPaymentProof(id);
    response.setHeader('Content-Type', proof.contentType);
    response.setHeader(
      'Content-Disposition',
      'inline; filename="payment-proof"',
    );
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.send(proof.buffer);
  }

  @Patch('payments/admin/:id/review')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  reviewPayment(
    @Param('id') id: string,
    @Body() body: { approved: boolean; reason?: string },
    @Req() request: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.reviewPayment(
      id,
      request.user.id,
      body.approved,
      body.reason || '',
    );
  }

  @Patch('payments/:id/proof')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
      fileFilter: (_request, file, callback) => {
        if (!ALLOWED_PROOF_MIME_TYPES.has(file.mimetype)) {
          callback(
            new BadRequestException('Bukti harus berupa gambar PNG atau JPEG'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadProof(
    @Param('id') id: string,
    @UploadedFile() file: PaymentProofUpload | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.uploadPaymentProof(
      request.user.id,
      id,
      file,
    );
  }

  @Get('my/:classId')
  @UseGuards(AuthGuard('jwt'))
  getEnrollmentDetails(
    @Param('classId') classId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.getEnrollmentDetails(
      request.user.id,
      classId,
    );
  }

  @Post(':classId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  enroll(
    @Param('classId') classId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.enroll(request.user.id, classId);
  }

  @Patch(':enrollmentId/modules/:moduleId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  updateProgress(
    @Param('enrollmentId') enrollmentId: string,
    @Param('moduleId') moduleId: string,
    @Body('status') status: 'IN_PROGRESS' | 'COMPLETED',
    @Req() request: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.updateProgress(
      request.user.id,
      enrollmentId,
      moduleId,
      status,
    );
  }
}
