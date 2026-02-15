export interface IRole {
  id: number;
  key: string;
  name: string;
  parent: number;
  is_super_admin: boolean;
  is_custom: boolean;
}

export interface IPermission {
  id: number;
  code: string;
  name: string;
  category: string;
}
