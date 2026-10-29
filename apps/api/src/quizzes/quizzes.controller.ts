import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuizType, Role } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { QuizzesService } from './quizzes.service';

type AuthenticatedRequest = Request & { user: { id: string; role: Role } };

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post(':quizId/submit')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  submitAttempt(
    @Param('quizId') quizId: string,
    @Req() request: AuthenticatedRequest,
    @Body('answers') answers: { questionId: string; answer: string }[],
  ) {
    return this.quizzesService.submitQuiz(request.user.id, quizId, answers);
  }

  @Post('instructor/class/:classId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  createClassQuiz(
    @Param('classId') classId: string,
    @Req() request: AuthenticatedRequest,
    @Body()
    data: {
      type?: QuizType;
      moduleId?: string;
      passingGrade?: number;
      maxAttempts?: number;
      questions?: {
        question: string;
        options: { id: string; text: string }[];
        correctAnswer: string;
      }[];
    },
  ) {
    return this.quizzesService.createQuiz(
      request.user.id,
      request.user.role,
      classId,
      data,
    );
  }

  @Get('instructor/class/:classId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  getInstructorQuiz(
    @Param('classId') classId: string,
    @Req() request: AuthenticatedRequest,
    @Query('type') type: QuizType = QuizType.FINAL,
    @Query('moduleId') moduleId?: string,
  ) {
    return this.quizzesService.getQuizForInstructor(
      request.user.id,
      request.user.role,
      classId,
      type,
      moduleId,
    );
  }

  @Get('module/:moduleId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  getModuleQuiz(
    @Param('moduleId') moduleId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quizzesService.getModuleQuizForStudent(
      request.user.id,
      moduleId,
    );
  }

  @Get('class/:classId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  getStudentQuiz(
    @Param('classId') classId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quizzesService.getQuizForStudent(
      request.user.id,
      classId,
      QuizType.FINAL,
    );
  }
}
