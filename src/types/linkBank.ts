export interface BankLink {
  id: string;
  name: string;
  url: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface BankSubfolder {
  id: string;
  name: string;
  description?: string;
  links: BankLink[];
  createdAt: Date;
}

export interface BankFolder {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  subfolders: BankSubfolder[];
  createdAt: Date;
}
