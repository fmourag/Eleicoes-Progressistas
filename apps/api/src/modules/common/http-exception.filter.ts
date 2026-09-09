import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Erro interno no servidor. Tente novamente mais tarde.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || res;
      } else {
        message = res;
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      ('status' in exception || 'statusCode' in exception)
    ) {
      const expressErr = exception as Record<string, any>;
      status = Number(expressErr.status || expressErr.statusCode) || HttpStatus.BAD_REQUEST;
      message = expressErr.type === 'entity.too.large' ? 'Payload da requisição excede o limite máximo permitido (512KB)' : (expressErr.message || 'Requisição inválida');
    } else {
      // Erros inesperados / banco de dados / exceções não capturadas
      const err = exception as Error;
      this.logger.error(
        `[500 UNHANDLED] ${request.method} ${request.url} - ${err?.message || 'Unknown error'}`,
        err?.stack,
      );
      message = 'Ocorreu um erro ao processar a requisição. Detalhes foram registrados de forma segura.';
    }

    // Registra avisos de erros 4xx no log para auditoria de acessos suspeitos
    if (status >= 400 && status < 500) {
      const clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
      this.logger.warn(
        `[${status} CLIENT_ERROR] ${request.method} ${request.url} - IP: ${clientIp} - Info: ${JSON.stringify(message)}`,
      );
    }

    const payload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    response.status(status).json(payload);
  }
}
