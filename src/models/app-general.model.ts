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
    phone: string;
    email: string;
    address: string;
    social: Social[];
}

export interface Podcast {
    id?: string;
    title: string;
    description: string; // Longer description
    imageUrl: string;
    author: string;
    releaseDate: Date; // Podcast release date

}


export interface Episode {
    id?: string;
    title: string;
    description: string;
    releaseDate: Date;
    duration: number; // Duration in seconds
    podcastId: string; // ID of the podcast
    contentUrl: string; // URL to the podcast content
    contentType: 'audio' | 'video'; // Type of content
}