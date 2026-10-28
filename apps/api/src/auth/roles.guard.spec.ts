import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  const reflector = { getAllAndOverride: jest.fn() };
  const handler = () => undefined;
  const controller = class {};

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: reflector }],
    }).compile();
    guard = moduleRef.get(RolesGuard);
  });

  function contextFor(role?: Role): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
    } as ExecutionContext;
  }

  it('allows requests when an endpoint has no role requirement', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextFor())).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      handler,
      controller,
    ]);
  });

  it('allows a user whose role is explicitly permitted', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.INSTRUCTOR]);

    expect(guard.canActivate(contextFor(Role.INSTRUCTOR))).toBe(true);
  });

  it('denies a user with no role or an unpermitted role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(contextFor())).toThrow(ForbiddenException);
    expect(() => guard.canActivate(contextFor(Role.STUDENT))).toThrow(
      ForbiddenException,
    );
  });
});
