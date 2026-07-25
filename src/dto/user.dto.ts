export interface UserDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
}
