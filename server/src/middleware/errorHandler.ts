import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../configs/constants';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // AppError (duck typing - verifica propriedades)
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Erros do Prisma
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(HTTP_STATUS.CONFLICT).json({
          status: 'error',
          message: 'Já existe um registo com esses dados únicos',
          field: err.meta?.target,
        });

      case 'P2025':
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: 'error',
          message: 'Registo não encontrado',
        });

      case 'P2003':
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: 'error',
          message: 'Violação de chave estrangeira',
        });

      default:
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: 'error',
          message: 'Erro na operação da base de dados',
          ...(process.env.NODE_ENV === 'development' && { code: err.code }),
        });
    }
  }

  // Erros de validação (Express)
  if (err.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: 'error',
      message: 'Erro de validação',
      errors: err.errors,
    });
  }

  // Erro genérico (500)
  return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
    status: 'error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Algo correu mal no servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};