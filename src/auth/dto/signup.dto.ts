import { UserRole } from '../user-role.enum';

export class SignupDto {
  email!: string;
  password!: string;
  role?: UserRole;
}
