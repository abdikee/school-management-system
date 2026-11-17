import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, FeeFrequency, InvoiceStatus, PaymentMethod, Term } from '@prisma/client';

interface CreateFeeStructureInput {
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
}

interface CreateInvoiceInput {
  studentId: string;
  parentId?: string;
  feeStructureId: string;
  academicYearId: string;
  amount: number;
  discount?: number;
  tax?: number;
  dueDate: Date;
  description?: string;
}

interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  reference?: string;
  paidAt?: Date;
  recordedById: string;
  notes?: string;
  receiptUrl?: string;
}

interface BulkGenerateInvoicesInput {
  feeStructureId: string;
  academicYearId: string;
  studentIds: string[];
  dueDate: Date;
}

interface GenerateInvoicesInput {
  feeStructureId: string;
  classId?: string;
  studentIds?: string[];
  academicYearId?: string;
  dueDate?: string;
}

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // FEE STRUCTURE OPERATIONS
  // ============================================

  async createFeeStructure(data: CreateFeeStructureInput) {
    // Validate academic year exists
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
    });
    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    // Validate school exists
    const school = await this.prisma.school.findUnique({
      where: { id: data.schoolId },
    });
    if (!school) {
      throw new NotFoundException('School not found');
    }

    // Validate grade level if provided
    if (data.gradeLevelId) {
      const gradeLevel = await this.prisma.gradeLevel.findUnique({
        where: { id: data.gradeLevelId },
      });
      if (!gradeLevel) {
        throw new NotFoundException('Grade level not found');
      }
      if (gradeLevel.schoolId !== data.schoolId) {
        throw new BadRequestException('Grade level does not belong to this school');
      }
    }

    return this.prisma.feeStructure.create({
      data: {
        ...data,
        dueDay: data.dueDay ?? 1,
        isActive: data.isActive ?? true,
        isOptional: data.isOptional ?? false,
      },
      include: {
        gradeLevel: true,
        academicYear: true,
        school: true,
      },
    });
  }

  async getFeeStructures(params: {
    skip?: number;
    take?: number;
    schoolId?: string;
    academicYearId?: string;
    gradeLevelId?: string;
    isActive?: boolean;
  } = {}) {
    const { skip, take, schoolId, academicYearId, gradeLevelId, isActive } = params;

    const where: Prisma.FeeStructureWhereInput = {};
    if (schoolId) where.schoolId = schoolId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (gradeLevelId) where.gradeLevelId = gradeLevelId;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await Promise.all([
      this.prisma.feeStructure.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          gradeLevel: true,
          academicYear: true,
          school: true,
          _count: { select: { invoices: true } },
        },
      }),
      this.prisma.feeStructure.count({ where }),
    ]);

    return { data, total };
  }

  async getFeeStructureById(id: string) {
    const feeStructure = await this.prisma.feeStructure.findUnique({
      where: { id },
      include: {
        gradeLevel: true,
        academicYear: true,
        school: true,
        invoices: {
          include: {
            student: { include: { user: true } },
            parent: { include: { user: true } },
            payments: true,
          },
        },
      },
    });

    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }
    return feeStructure;
  }

  async updateFeeStructure(id: string, data: Prisma.FeeStructureUpdateInput) {
    return this.prisma.feeStructure.update({
      where: { id },
      data,
      include: {
        gradeLevel: true,
        academicYear: true,
        school: true,
      },
    });
  }

  async deleteFeeStructure(id: string) {
    const feeStructure = await this.prisma.feeStructure.findUnique({ where: { id } });
    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    const invoiceCount = await this.prisma.invoice.count({ where: { feeStructureId: id } });
    if (invoiceCount > 0) {
      throw new BadRequestException('Cannot delete fee structure with existing invoices');
    }

    return this.prisma.feeStructure.delete({ where: { id } });
  }

  // ============================================
  // INVOICE OPERATIONS
  // ============================================

  async createInvoice(data: CreateInvoiceInput) {
    // Validate student
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
      include: { parent: true, class: { include: { gradeLevel: true } } },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Validate fee structure
    const feeStructure = await this.prisma.feeStructure.findUnique({
      where: { id: data.feeStructureId },
    });
    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    // Validate academic year
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
    });
    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    // Validate parent if provided
    if (data.parentId) {
      const parent = await this.prisma.parent.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        throw new NotFoundException('Parent not found');
      }
      // Check if parent is linked to student
      const link = await this.prisma.parentStudent.findUnique({
        where: { parentId_studentId: { parentId: data.parentId, studentId: data.studentId } },
      });
      if (!link) {
        throw new BadRequestException('Parent is not linked to this student');
      }
    } else if (student.parentId) {
      // Use student's primary parent
      data.parentId = student.parentId;
    }

    // Calculate total amount
    const totalAmount = data.amount - (data.discount ?? 0) + (data.tax ?? 0);

    // Generate invoice number
    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Check for existing invoice for same student/fee structure/academic year
    const existing = await this.prisma.invoice.findFirst({
      where: {
        studentId: data.studentId,
        feeStructureId: data.feeStructureId,
        academicYearId: data.academicYearId,
      },
    });
    if (existing) {
      throw new ConflictException('Invoice already exists for this student, fee structure, and academic year');
    }

    return this.prisma.invoice.create({
      data: {
        ...data,
        totalAmount,
        invoiceNumber,
      },
      include: {
        student: { include: { user: true, class: true } },
        parent: { include: { user: true } },
        feeStructure: true,
      },
    });
  }

  async bulkGenerateInvoices(data: BulkGenerateInvoicesInput) {
    const { feeStructureId, academicYearId, studentIds, dueDate } = data;

    // Validate fee structure
    const feeStructure = await this.prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
    });
    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    // Validate academic year
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: academicYearId },
    });
    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    // Validate students
    const students = await this.prisma.student.findMany({
      where: { id: { in: studentIds } },
      include: { parent: true, class: { include: { gradeLevel: true } } },
    });

    if (students.length !== studentIds.length) {
      throw new NotFoundException('Some students not found');
    }

    const results = [];
    const errors = [];

    for (const student of students) {
      try {
        // Check if invoice already exists
        const existing = await this.prisma.invoice.findFirst({
          where: {
            studentId: student.id,
            feeStructureId,
            academicYearId,
          },
        });

        if (existing) {
          errors.push({ studentId: student.id, error: 'Invoice already exists' });
          continue;
        }

        // Determine parent
        let parentId = student.parentId;
        if (parentId) {
          const link = await this.prisma.parentStudent.findUnique({
            where: { parentId_studentId: { parentId, studentId: student.id } },
          });
          if (!link) parentId = null;
        }

        const totalAmount = feeStructure.amount + (feeStructure.isOptional ? 0 : 0); // Add tax if needed

        const count = await this.prisma.invoice.count();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

        const invoice = await this.prisma.invoice.create({
          data: {
            invoiceNumber,
            studentId: student.id,
            parentId,
            feeStructureId,
            academicYearId,
            amount: feeStructure.amount,
            discount: 0,
            tax: 0,
            totalAmount,
            dueDate,
            description: feeStructure.description,
          },
          include: {
            student: { include: { user: true } },
            parent: { include: { user: true } },
            feeStructure: true,
          },
        });
        results.push(invoice);
      } catch (error) {
        errors.push({ studentId: student.id, error: error.message });
      }
    }

    return { generated: results.length, errors, invoices: results };
  }

  async generateInvoices(data: GenerateInvoicesInput) {
    const feeStructure = await this.prisma.feeStructure.findUnique({
      where: { id: data.feeStructureId },
    });
    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    let studentIds = data.studentIds;
    if (data.classId) {
      const students = await this.prisma.student.findMany({
        where: { classId: data.classId },
        select: { id: true },
      });
      studentIds = students.map((student) => student.id);
    }

    if (!studentIds?.length) {
      throw new BadRequestException('At least one student or class is required');
    }

    const dueDate = data.dueDate
      ? new Date(data.dueDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), feeStructure.dueDay);

    if (Number.isNaN(dueDate.getTime())) {
      throw new BadRequestException('Invalid due date');
    }

    return this.bulkGenerateInvoices({
      feeStructureId: data.feeStructureId,
      academicYearId: data.academicYearId ?? feeStructure.academicYearId,
      studentIds,
      dueDate,
    });
  }

  async getInvoices(params: {
    skip?: number;
    take?: number;
    studentId?: string;
    parentId?: string;
    feeStructureId?: string;
    academicYearId?: string;
    status?: InvoiceStatus;
    dueDateFrom?: Date;
    dueDateTo?: Date;
  } = {}) {
    const { skip, take, studentId, parentId, feeStructureId, academicYearId, status, dueDateFrom, dueDateTo } = params;

    const where: Prisma.InvoiceWhereInput = {};
    if (studentId) where.studentId = studentId;
    if (parentId) where.parentId = parentId;
    if (feeStructureId) where.feeStructureId = feeStructureId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (status) where.status = status;
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = dueDateFrom;
      if (dueDateTo) where.dueDate.lte = dueDateTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        skip,
        take,
        where,
        orderBy: { dueDate: 'asc' },
        include: {
          student: { include: { user: true, class: true } },
          parent: { include: { user: true } },
          feeStructure: true,
          payments: { orderBy: { paidAt: 'desc' } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data, total };
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        student: { include: { user: true, class: { include: { gradeLevel: true } } } },
        parent: { include: { user: true } },
        feeStructure: true,
        payments: {
          orderBy: { paidAt: 'desc' },
          include: { recordedBy: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async updateInvoice(id: string, data: Prisma.InvoiceUpdateInput) {
    return this.prisma.invoice.update({
      where: { id },
      data,
      include: {
        student: { include: { user: true } },
        parent: { include: { user: true } },
        feeStructure: true,
      },
    });
  }

  async deleteInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.PARTIAL) {
      throw new BadRequestException('Cannot delete invoice with payments recorded');
    }

    return this.prisma.invoice.delete({ where: { id } });
  }

  async getOverdueInvoices(params: { schoolId?: string } = {}) {
    const where: Prisma.InvoiceWhereInput = {
      status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
      dueDate: { lt: new Date() },
    };

    if (params.schoolId) {
      where.student = { class: { gradeLevel: { schoolId: params.schoolId } } };
    }

    return this.prisma.invoice.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        student: { include: { user: true, class: true } },
        parent: { include: { user: true } },
        feeStructure: true,
      },
    });
  }

  // ============================================
  // PAYMENT OPERATIONS
  // ============================================

  async recordPayment(data: RecordPaymentInput) {
    // Validate invoice
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot record payment for cancelled invoice');
    }

    // Validate recordedBy user
    const recordedBy = await this.prisma.user.findUnique({ where: { id: data.recordedById } });
    if (!recordedBy) {
      throw new NotFoundException('Recorded by user not found');
    }

    // Calculate remaining balance
    const payments = await this.prisma.payment.findMany({ where: { invoiceId: data.invoiceId } });
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.totalAmount - paidAmount;

    if (data.amount > remaining) {
      throw new BadRequestException(`Payment amount exceeds remaining balance of ${remaining}`);
    }

    const payment = await this.prisma.payment.create({
      data: {
        ...data,
        paidAt: data.paidAt ?? new Date(),
      },
      include: {
        invoice: {
          include: {
            student: { include: { user: true } },
            parent: { include: { user: true } },
            feeStructure: true,
          },
        },
        recordedBy: true,
      },
    });

    // Update invoice status
    const newPaidAmount = paidAmount + data.amount;
    let newStatus = invoice.status;
    if (newPaidAmount >= invoice.totalAmount) {
      newStatus = InvoiceStatus.PAID;
    } else if (newPaidAmount > 0) {
      newStatus = InvoiceStatus.PARTIAL;
    }

    await this.prisma.invoice.update({
      where: { id: data.invoiceId },
      data: {
        status: newStatus,
        paidAt: newStatus === InvoiceStatus.PAID ? new Date() : null,
      },
    });

    return payment;
  }

  async getPayments(params: {
    skip?: number;
    take?: number;
    invoiceId?: string;
    studentId?: string;
    method?: PaymentMethod;
    paidAtFrom?: Date;
    paidAtTo?: Date;
    recordedById?: string;
  } = {}) {
    const { skip, take, invoiceId, studentId, method, paidAtFrom, paidAtTo, recordedById } = params;

    const where: Prisma.PaymentWhereInput = {};
    if (invoiceId) where.invoiceId = invoiceId;
    if (method) where.method = method;
    if (recordedById) where.recordedById = recordedById;
    if (paidAtFrom || paidAtTo) {
      where.paidAt = {};
      if (paidAtFrom) where.paidAt.gte = paidAtFrom;
      if (paidAtTo) where.paidAt.lte = paidAtTo;
    }
    if (studentId) {
      where.invoice = { studentId };
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take,
        where,
        orderBy: { paidAt: 'desc' },
        include: {
          invoice: {
            include: {
              student: { include: { user: true } },
              parent: { include: { user: true } },
              feeStructure: true,
            },
          },
          recordedBy: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total };
  }

  async getPaymentById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            student: { include: { user: true, class: true } },
            parent: { include: { user: true } },
            feeStructure: true,
          },
        },
        recordedBy: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async deletePayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update invoice status after deleting payment
    const remainingPayments = await this.prisma.payment.findMany({
      where: { invoiceId: payment.invoiceId, NOT: { id } },
    });
    const newPaidAmount = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
    let newStatus: InvoiceStatus = InvoiceStatus.PENDING;
    if (newPaidAmount >= payment.invoice.totalAmount) {
      newStatus = InvoiceStatus.PAID;
    } else if (newPaidAmount > 0) {
      newStatus = InvoiceStatus.PARTIAL;
    }

    await this.prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: {
        status: newStatus,
        paidAt: newStatus === InvoiceStatus.PAID ? new Date() : null,
      },
    });

    return this.prisma.payment.delete({ where: { id } });
  }

  // ============================================
  // FINANCE REPORTS & ANALYTICS
  // ============================================

  async getFinanceDashboard(schoolId: string, params: { academicYearId?: string } = {}) {
    const where: Prisma.InvoiceWhereInput = {};
    if (params.academicYearId) where.academicYearId = params.academicYearId;
    if (schoolId) {
      where.student = { class: { gradeLevel: { schoolId } } };
    }

    const [
      totalInvoices,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      partialInvoices,
      cancelledInvoices,
      totalRevenue,
      pendingRevenue,
      overdueRevenue,
      recentPayments,
    ] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.PENDING } }),
      this.prisma.invoice.count({
        where: { ...where, status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] }, dueDate: { lt: new Date() } },
      }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.PAID } }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.PARTIAL } }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.CANCELLED } }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.PAID },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: { in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] }, dueDate: { lt: new Date() } },
        _sum: { totalAmount: true },
      }),
      this.prisma.payment.findMany({
        where: { invoice: where },
        orderBy: { paidAt: 'desc' },
        take: 10,
        include: {
          invoice: { include: { student: { include: { user: true } }, feeStructure: true } },
          recordedBy: true,
        },
      }),
    ]);

    return {
      invoices: {
        total: totalInvoices,
        pending: pendingInvoices,
        overdue: overdueInvoices,
        paid: paidInvoices,
        partial: partialInvoices,
        cancelled: cancelledInvoices,
      },
      revenue: {
        collected: totalRevenue._sum.totalAmount ?? 0,
        pending: pendingRevenue._sum.totalAmount ?? 0,
        overdue: overdueRevenue._sum.totalAmount ?? 0,
      },
      recentPayments,
    };
  }

  async getStudentFeeSummary(studentId: string, params: { academicYearId?: string } = {}) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, parent: { include: { user: true } }, class: { include: { gradeLevel: true } } },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const where: Prisma.InvoiceWhereInput = { studentId };
    if (params.academicYearId) where.academicYearId = params.academicYearId;

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        feeStructure: true,
        payments: { orderBy: { paidAt: 'desc' } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const paidAmount = invoices.reduce((sum, i) => sum + i.payments.reduce((s, p) => s + p.amount, 0), 0);
    const pendingAmount = totalAmount - paidAmount;
    const overdueAmount = invoices
      .filter((i) => i.status !== InvoiceStatus.PAID && i.status !== InvoiceStatus.CANCELLED && i.dueDate < new Date())
      .reduce((sum, i) => sum + i.totalAmount - i.payments.reduce((s, p) => s + p.amount, 0), 0);

    return {
      student: { id: student.id, studentId: student.studentId, user: student.user, class: student.class, parent: student.parent },
      invoices,
      summary: {
        totalInvoices: invoices.length,
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
      },
    };
  }

  async getFeeStructureRevenue(feeStructureId: string) {
    const feeStructure = await this.prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
      include: { invoices: { include: { payments: true } } },
    });
    if (!feeStructure) {
      throw new NotFoundException('Fee structure not found');
    }

    const totalInvoiced = feeStructure.invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalCollected = feeStructure.invoices.reduce(
      (sum, i) => sum + i.payments.reduce((s, p) => s + p.amount, 0),
      0,
    );
    const pending = feeStructure.invoices
      .filter((i) => i.status !== InvoiceStatus.PAID && i.status !== InvoiceStatus.CANCELLED)
      .reduce((sum, i) => sum + i.totalAmount - i.payments.reduce((s, p) => s + p.amount, 0), 0);

    return {
      feeStructure: { id: feeStructure.id, name: feeStructure.name, amount: feeStructure.amount, frequency: feeStructure.frequency },
      totalInvoiced,
      totalCollected,
      pending,
      collectionRate: totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0,
      invoiceCount: feeStructure.invoices.length,
    };
  }
}