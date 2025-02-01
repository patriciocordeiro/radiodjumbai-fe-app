export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    description: string;
    image: string;
    email: string;
    phone: string;
    social: Social[];
}

export interface Social {
    name: string;
    url: string;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    created_at: Date;
    updated_at: Date;
}

export interface Company {
    id: string;
    name: string;
    logo: string;
    description: string;
    phones: string[];
    email: string;
    address: string;
    social: Social[];
}