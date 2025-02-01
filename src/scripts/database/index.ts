import { faker } from "@faker-js/faker";
import { firestore } from 'firebase-admin';

import admin from 'firebase-admin';
admin.initializeApp({
    projectId: 'radiodjumbai-8f473'
});

const db = firestore();
db.settings({
    host: 'localhost:8080',
    ssl: false,
});

interface Social {
    platform: string;
    url: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    description: string;
    image: string; // Consider using a placeholder image URL or cloud storage integration
    email: string;
    phone: string;
    social: Social[];
}

async function createFakeTeamMembers(numMembers: number = 5) {


    const teamMembersCollection = db.collection("TeamMember"); // Collection name

    const teamMembers: TeamMember[] = [];
    for (let i = 0; i < numMembers; i++) {
        const social = Array.from({ length: 2 }, () => ({
            platform: faker.internet.protocol(), // Simpler social media platforms
            url: faker.internet.url(),
        }));

        const newMember: TeamMember = {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            role: faker.person.jobTitle(),
            description: faker.lorem.paragraph(),
            image: `https://via.placeholder.com/150`, // Placeholder image - replace with your logic
            email: faker.internet.email(),
            phone: faker.phone.number(),
            social,
        };
        teamMembers.push(newMember);
    }

    try {
        const promises = teamMembers.map(member => teamMembersCollection.add(member));
        await Promise.all(promises);
        console.log(`${numMembers} fake team members added to Firestore.`);
    } catch (error) {
        console.error("Error adding team members to Firestore:", error);
    } finally {
        //Terminate the connection to Firebase after you are finished to release resources.
        //This is generally good practice in production code
        //initializeApp().delete();
    }
}


const createCompany = async () => {
    const companyCollection = db.collection("Company");
    const company = {
        id: faker.string.uuid(),
        name: 'Radio Djumbai',
        description: faker.lorem.paragraph(50),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        email: faker.internet.email(),
        phones: [
            faker.phone.number(),
            faker.phone.number()
        ],
        social: [
            {
                platform: 'Facebook',
                url: faker.internet.url(),
            },
            {
                platform: 'Instagram',
                url: faker.internet.url(),
            },
        ],
        website: faker.internet.url(),
        logo: `https://via.placeholder.com/150`, // Placeholder image - replace with your logic
    };
    try {
        await companyCollection.add(company);
        console.log(`Company added to Firestore.`);
    } catch (error) {
        console.error("Error adding company to Firestore:", error);
    } finally {
        //Terminate the connection to Firebase after you are finished to release resources.
        //This is generally good practice in production code
        //initializeApp().delete();
    }
};

//Example usage:  Creates 10 fake team members.
// createFakeTeamMembers(10)
//     .then(() => process.exit(0))
//     .catch(err => {
//         console.error("An unexpected error occurred:", err);
//         process.exit(1);
//     });



//Example usage:  Creates a fake company.
createCompany()
    .then(() => process.exit(0))
    .catch(err => {
        console.error("An unexpected error occurred:", err);
        process.exit(1);
    });