import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(username: string): Promise<{
        id: number;
        createdAt: Date;
        username: string;
        password: string;
    } | null>;
}
