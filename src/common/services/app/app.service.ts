import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export abstract class AppService {
  protected page = 1;
  protected saltOrRounds = 10;

  constructor() {}

  protected async hashPassword(password: string) {
    return await bcrypt.hash(password, this.saltOrRounds);
  }

  protected async checkPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  protected getSearchQueryPattern(query?: string) {
    return query
      ? {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { text: { $regex: query, $options: 'i' } },
            { comments: { $regex: query, $options: 'i' } },
          ],
        }
      : {};
  }

  protected getSortingPattern(key: string, sort: 'desc' | 'asc' = 'desc') {
    return { [key]: sort };
  }

  protected getSkipPattern(page: string | number = this.page, limit: number) {
    return +page > 0 ? (+page - 1) * limit : 0;
  }

  protected response(host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return function (type: string, message: string, status: HttpStatus) {
      return response.status(status).json({
        statusCode: status,
        path: request.url,
        errorType: type,
        errorMessage: message,
      });
    };
  }
}