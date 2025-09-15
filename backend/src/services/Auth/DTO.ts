// src/services/Auth/DTO

export interface RegisterUserDTO {
    name: string;
    email: string;
    password: string;
}

export interface LoginUserDTO {
    email: string;
    password: string;
}

export interface ResetPasswordDTO {
    token: string;
    newPassword: string;
}
