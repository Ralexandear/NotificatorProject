import { Request, Response } from "express";

class ApiError extends Error {
  status: number;
  message: string;

  constructor (status: number, message: string){
    super();
    this.status = status;
    this.message = message;
  }
  static badRequest (message: string = 'BAD REQUEST'){
    return new ApiError(400, message)
  }
  static notFound (message: string = 'NOT FOUND'){
    return new ApiError(404, message)
  }
  static internal (message: string = 'INTERNAL SERVER ERROR'){
    return new ApiError(500, message)
  }
  static forbidden (message: string = 'NO ACCESS'){
    return new ApiError(403, message)
  }
  static conflict (message: string){
    return new ApiError(409, message)
  }
  static unauthorized (message: string = 'NOT AUTHORIZED'){
    return new ApiError(401, message)
  }
  
}

export default ApiError