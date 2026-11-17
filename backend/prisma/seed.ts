import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const permissions = [
    ['audit.read', 'Read authenticated activity records'],
    ['user.manage', 'Manage users and account credentials'],
    ['finance.manage', 'Manage finance configuration and records'],
    ['finance.payment.record', 'Record finance payments'],
    ['academic.manage', 'Manage academic structures'],
    ['attendance.manage', 'Manage attendance records'],
    ['marks.manage', 'Manage assessment marks'],
    ['results.approve', 'Approve academic results'],
  ] as const;

  const permissionRecords = await Promise.all(
    permissions.map(([key, description]) =>
      prisma.permission.upsert({
        where: { key },
        update: { description },
        create: { key, description },
      }),
    ),
  );

  const adminPermissionKeys = new Set(permissions.map(([key]) => key));
  const teacherPermissionKeys = new Set([
    'attendance.manage',
    'marks.manage',
  ]);
  const cashierPermissionKeys = new Set([
    'finance.payment.record',
  ]);
  const rolePermissionKeys: Record<UserRole, Set<string>> = {
    ADMIN: adminPermissionKeys,
    TEACHER: teacherPermissionKeys,
    STUDENT: new Set(),
    PARENT: new Set(),
    CASHIER: cashierPermissionKeys,
  };

  for (const permission of permissionRecords) {
    for (const role of Object.values(UserRole)) {
      const shouldGrant = rolePermissionKeys[role].has(permission.key);
      if (shouldGrant) {
        await prisma.rolePermission.upsert({
          where: {
            role_permissionId: {
              role,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            role,
            permissionId: permission.id,
          },
        });
      } else {
        await prisma.rolePermission.deleteMany({
          where: { role, permissionId: permission.id },
        });
      }
    }
  }

  // Create demo admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create demo teacher user
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@school.com' },
    update: {},
    create: {
      email: 'teacher@school.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Teacher',
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log('✅ Created teacher user:', teacher.email);

  // Create demo student user
  const student = await prisma.user.upsert({
    where: { email: 'student@school.com' },
    update: {},
    create: {
      email: 'student@school.com',
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Student',
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log('✅ Created student user:', student.email);

  // Create demo parent user
  const parent = await prisma.user.upsert({
    where: { email: 'parent@school.com' },
    update: {},
    create: {
      email: 'parent@school.com',
      passwordHash: hashedPassword,
      firstName: 'Robert',
      lastName: 'Parent',
      role: UserRole.PARENT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log('✅ Created parent user:', parent.email);

  console.log('\n🎉 Database seeding completed!\n');
  console.log('Demo credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:   admin@school.com   / password123');
  console.log('Teacher: teacher@school.com / password123');
  console.log('Student: student@school.com / password123');
  console.log('Parent:  parent@school.com  / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
