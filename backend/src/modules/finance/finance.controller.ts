import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { StudentAccessService } from '../../common/policies/student-access.service';
import { UserRole, FeeFrequency, InvoiceStatus, PaymentMethod, Term } from '@prisma/client';
import { Prisma } from '@prisma/client';

@ApiTags('finance')
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(
    private financeService: FinanceService,
    private studentAccess: StudentAccessService,
  ) {}

  // ============================================
  // FEE STRUCTURE OPERATIONS
  // ============================================

  @Post('fee-structures')
  @Roles(UserRole.ADMIN)
  @Permissions('finance.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create fee structure' })
  async createFeeStructure(@Body() data: {
    name: string;
    description?: string;
    amount: number;
    frequency: FeeFrequency;
    gradeLevelId?: string;
    academicYearId: string;
    schoolId: string;
    dueDay?: number;
    isActive?: boolean;
    isOptional?: boolean;
  }) {
    return this.financeService.createFeeStructure(data);
  }

  @Get('fee-structures')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get all fee structures with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'gradeLevelId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getFeeStructures(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('schoolId') schoolId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('gradeLevelId') gradeLevelId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.financeService.getFeeStructures({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      schoolId,
      academicYearId,
      gradeLevelId,
      isActive,
    });
  }

  @Get('fee-structures/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get fee structure by ID' })
  async getFeeStructureById(@Param('id') id: string) {
    return this.financeService.getFeeStructureById(id);
  }

  @Put('fee-structures/:id')
  @Roles(UserRole.ADMIN)
  @Permissions('finance.manage')
  @ApiOperation({ summary: 'Update fee structure' })
  async updateFeeStructure(
    @Param('id') id: string,
    @Body() data: Prisma.FeeStructureUpdateInput,
  ) {
    return this.financeService.updateFeeStructure(id, data);
  }

  @Delete('fee-structures/:id')
  @Roles(UserRole.ADMIN)
  @Permissions('finance.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete fee structure' })
  async deleteFeeStructure(@Param('id') id: string) {
    return this.financeService.deleteFeeStructure(id);
  }

  // ============================================
  // INVOICE OPERATIONS
  // ============================================

  @Post('invoices')
  @Roles(UserRole.ADMIN)
  @Permissions('finance.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create invoice' })
  async createInvoice(@Body() data: {
    studentId: string;
    parentId?: string;
    feeStructureId: string;
    academicYearId: string;
    amount: number;
    discount?: number;
    tax?: number;
    dueDate: string;
    description?: string;
  }) {
    return this.financeService.createInvoice({
      ...data,
      dueDate: new Date(data.dueDate),
    });
  }

  @Post('invoices/bulk')
  @Roles(UserRole.ADMIN)
  @Permissions('finance.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk generate invoices for multiple students' })
  async bulkGenerateInvoices(@Body() data: {
    feeStructureId: string;
    academicYearId: string;
    studentIds: string[];
    dueDate: string;
  }) {
    return this.financeService.bulkGenerateInvoices({
      ...data,
      dueDate: new Date(data.dueDate),
    });
  }

  @Post('invoices/generate')
  @Roles(UserRole.ADMIN)
  @Permissions('finance.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate invoices for a class or selected students' })
  async generateInvoices(@Body() data: {
    feeStructureId: string;
    classId?: string;
    studentIds?: string[];
    academicYearId?: string;
    dueDate?: string;
  }) {
    return this.financeService.generateInvoices(data);
  }

  @Get('invoices')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT)
  @ApiOperation({ summary: 'Get invoices with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'studentId', required: false, type: String })
  @ApiQuery({ name: 'parentId', required: false, type: String })
  @ApiQuery({ name: 'feeStructureId', required: false, type: String })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'dueDateFrom', required: false, type: String })
  @ApiQuery({ name: 'dueDateTo', required: false, type: String })
  async getInvoices(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('studentId') studentId?: string,
    @Query('parentId') parentId?: string,
    @Query('feeStructureId') feeStructureId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,
  ) {
    return this.financeService.getInvoices({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      studentId,
      parentId,
      feeStructureId,
      academicYearId,
      status,
      dueDateFrom: dueDateFrom ? new Date(dueDateFrom) : undefined,
      dueDateTo: dueDateTo ? new Date(dueDateTo) : undefined,
    });
  }

  @Get('invoices/overdue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get overdue invoices' })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  async getOverdueInvoices(@Query('schoolId') schoolId?: string) {
    return this.financeService.getOverdueInvoices({ schoolId });
  }

  @Get('invoices/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get invoice by ID with payments' })
  async getInvoiceById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    await this.studentAccess.assertCanAccessInvoice(userId, role, id);
    return this.financeService.getInvoiceById(id);
  }

  @Put('invoices/:id')
  @Roles(UserRole.ADMIN)
  @Permissions('finance.manage')
  @ApiOperation({ summary: 'Update invoice' })
  async updateInvoice(
    @Param('id') id: string,
    @Body() data: Prisma.InvoiceUpdateInput,
  ) {
    return this.financeService.updateInvoice(id, data);
  }

  @Delete('invoices/:id')
  @Roles(UserRole.ADMIN)
  @Permissions('finance.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete invoice (only if no payments)' })
  async deleteInvoice(@Param('id') id: string) {
    return this.financeService.deleteInvoice(id);
  }

  // ============================================
  // PAYMENT OPERATIONS
  // ============================================

  @Post('payments')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.CASHIER)
  @Permissions('finance.payment.record')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record payment' })
  async recordPayment(@Body() data: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    transactionId?: string;
    reference?: string;
    paidAt?: string;
    recordedById?: string;
    notes?: string;
    receiptUrl?: string;
  }, @CurrentUser('id') currentUserId: string) {
    return this.financeService.recordPayment({
      ...data,
      recordedById: currentUserId,
      paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
    });
  }

  @Get('payments')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get payments with filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'invoiceId', required: false, type: String })
  @ApiQuery({ name: 'studentId', required: false, type: String })
  @ApiQuery({ name: 'method', required: false, enum: PaymentMethod })
  @ApiQuery({ name: 'paidAtFrom', required: false, type: String })
  @ApiQuery({ name: 'paidAtTo', required: false, type: String })
  @ApiQuery({ name: 'recordedById', required: false, type: String })
  async getPayments(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('invoiceId') invoiceId?: string,
    @Query('studentId') studentId?: string,
    @Query('method') method?: PaymentMethod,
    @Query('paidAtFrom') paidAtFrom?: string,
    @Query('paidAtTo') paidAtTo?: string,
    @Query('recordedById') recordedById?: string,
  ) {
    return this.financeService.getPayments({
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 10,
      invoiceId,
      studentId,
      method,
      paidAtFrom: paidAtFrom ? new Date(paidAtFrom) : undefined,
      paidAtTo: paidAtTo ? new Date(paidAtTo) : undefined,
      recordedById,
    });
  }

  @Get('payments/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get payment by ID' })
  async getPaymentById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    await this.studentAccess.assertCanAccessPayment(userId, role, id);
    return this.financeService.getPaymentById(id);
  }

  @Delete('payments/:id')
  @Roles(UserRole.ADMIN)
  @Permissions('finance.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete payment (updates invoice status)' })
  async deletePayment(@Param('id') id: string) {
    return this.financeService.deletePayment(id);
  }

  // ============================================
  // FINANCE REPORTS & ANALYTICS
  // ============================================

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get finance dashboard overview' })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  async getFinanceDashboard(
    @Query('academicYearId') academicYearId?: string,
    @Query('schoolId') schoolId?: string,
  ) {
    // schoolId is optional in the query but required in the service
    return this.financeService.getFinanceDashboard(schoolId || '', { academicYearId });
  }

  @Get('students/:studentId/summary')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT, UserRole.STUDENT, UserRole.CASHIER)
  @ApiOperation({ summary: 'Get student fee summary' })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  async getStudentFeeSummary(
    @Param('studentId') studentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Query('academicYearId') academicYearId?: string,
  ) {
    await this.studentAccess.assertCanAccessStudent(userId, role, studentId);
    return this.financeService.getStudentFeeSummary(studentId, { academicYearId });
  }

  @Get('fee-structures/:id/revenue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get revenue report for a fee structure' })
  async getFeeStructureRevenue(@Param('id') id: string) {
    return this.financeService.getFeeStructureRevenue(id);
  }
}