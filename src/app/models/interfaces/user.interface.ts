
export interface User{
  id : number;
  username: string;
  password: string;
  role: string;
  name: string;
}

export interface StatItem {
  title: string;
  items: StatValue[];
}
interface StatValue {
  value: number;
  label: string;
}