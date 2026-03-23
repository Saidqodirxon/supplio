import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      name: "Supplio API",
      status: "running",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      health: "/health",
    };
  }
  
}
