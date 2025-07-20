export interface IResponse {
    status: "failure"  | "success";
    message: string,
    code: number,
   payload: null

}

export interface UserResponse {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    role: 'user' | 'admin'
  
}

export interface LoginDto {
  email: string;
  password: string;
}