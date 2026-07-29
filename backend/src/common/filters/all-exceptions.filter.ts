import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

// 统一异常过滤器：把业务异常与 Prisma 异常映射为统一的 HTTP 响应体
// 对齐现有 Nuxt 行为：参数错误 400、未授权 401、未找到 404
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message ?? exception.message;
      // class-validator 返回数组，取首条或拼接
      if (Array.isArray(message)) {
        message = message.join('; ');
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma 已知错误映射
      if (exception.code === 'P2002') {
        // 唯一约束冲突
        status = HttpStatus.BAD_REQUEST;
        message = '唯一字段冲突：该记录已存在';
      } else if (exception.code === 'P2025') {
        // 记录未找到
        status = HttpStatus.NOT_FOUND;
        message = '记录不存在';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 5xx 错误打日志便于排查
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
