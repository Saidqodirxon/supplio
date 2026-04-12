import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // Distributor/Company endpoints
  @Post('ticket')
  @ApiOperation({ summary: 'Create a new support ticket (Distributor)' })
  createTicket(@Req() req: any, @Body() data: { subject: string; message: string }) {
    const companyId = req.user.companyId;
    return this.supportService.createTicket(companyId, data.subject, data.message);
  }

  @Get('company/tickets')
  @ApiOperation({ summary: 'Get all tickets for current company (Distributor)' })
  getTicketsByCompany(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.supportService.getTicketsByCompany(companyId);
  }

  // Common message endpoint
  @Post('message/:id')
  @ApiOperation({ summary: 'Add a message to a ticket' })
  addMessage(@Req() req: any, @Param('id') ticketId: string, @Body() data: { message: string }) {
    const senderId = req.user.id;
    // Check if user is super admin or distributor
    const senderType = req.user.roleType === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'DISTRIBUTOR';
    return this.supportService.addMessage(ticketId, senderId, senderType, data.message);
  }

  @Get('ticket/:id')
  @ApiOperation({ summary: 'Get a specific ticket by ID' })
  getTicket(@Param('id') id: string) {
    return this.supportService.getTicketById(id);
  }

  // Super Admin endpoints (should be guarded by AdminGuard too)
  @Get('all')
  @ApiOperation({ summary: 'Get all tickets (SuperAdmin)' })
  getAllTickets(@Req() req: any) {
    if (req.user.roleType !== 'SUPER_ADMIN') throw new Error('Forbidden');
    return this.supportService.getAllTickets();
  }

  @Patch('status/:id')
  @ApiOperation({ summary: 'Update ticket status (SuperAdmin)' })
  updateStatus(@Req() req: any, @Param('id') id: string, @Body() data: { status: string }) {
    if (req.user.roleType !== 'SUPER_ADMIN') throw new Error('Forbidden');
    return this.supportService.updateTicketStatus(id, data.status);
  }
}
