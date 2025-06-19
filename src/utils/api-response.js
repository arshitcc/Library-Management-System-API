export class ApiResponse {
  constructor(statusCode, success, message = "Success", data = null) {
    this.statusCode = statusCode;
    this.success = success || statusCode < 400;
    this.message = message;
    this.data = data;
  }
}
