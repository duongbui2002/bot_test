export enum Role {
  Admin = 'ADMIN',
  User = 'USER'
}

export default function (user: any, role: Role) {
  return user.role === role;
}