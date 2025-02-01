import { Episode, Podcast, Program, Schedule } from '../../models/app-general.model';
import { faker } from "@faker-js/faker";
import { firestore } from 'firebase-admin';

import admin from 'firebase-admin';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
const app = admin.initializeApp({
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
        phone: faker.phone.number(),
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


function generateFakePodcast(): Podcast {
    return {
        title: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        imageUrl: faker.image.url(),
        author: faker.person.fullName(),
        releaseDate: faker.date.past(),

    };
}

function generateFakeEpisode(podcastId: string): Episode {
    return {
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        releaseDate: faker.date.past(),
        duration: faker.number.int({ min: 60, max: 3600 }), // Duration in seconds (1-60 minutes)
        podcastId,
        contentUrl: faker.internet.url(),
        contentType: faker.helpers.arrayElement(['audio', 'video']),
    };
}

async function createFakePodcastData(numPodcasts: number = 5, episodesPerPodcast: number = 3): Promise<{ podcasts: Podcast[]; episodes: Episode[]; }> {
    const podcasts: Podcast[] = [];
    const episodes: Episode[] = [];

    const podcastsCollectionRef = db.collection("Podcast");


    for (let i = 0; i < numPodcasts; i++) {
        const podcast = generateFakePodcast();
        // save the podcast to Firestore
        const newPodcast = await podcastsCollectionRef.add(podcast);
        podcasts.push(podcast);
        for (let j = 0; j < episodesPerPodcast; j++) {
            const episode = generateFakeEpisode(newPodcast.id);
            await saveEpisodeToFirestore(episode);
            episodes.push(episode);
        }
    }

    return { podcasts, episodes };
}

async function saveEpisodeToFirestore(episode: Episode): Promise<void> {
    const episodesCollectionRef = db.collection("Episode");

    try {
        await episodesCollectionRef.add(episode);
        console.log("Episode saved successfully:", episode.title);
    } catch (error: any) {
        console.error("Error saving episode:", error.message);
        throw error;
    }
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const START_HOUR = 6;
const END_HOUR = 24; // Midnight (24:00)

const formatTime = (hour: number, minute: number): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

async function createProgramAndSchedule() {
    const getTimeInMillis = (dayOfWeek: string, hour: number, minute: number): number => {
        const dayIndex = daysOfWeek.indexOf(dayOfWeek);
        const now = new Date();
        const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayIndex);
        baseDate.setHours(hour, minute, 0, 0);
        return baseDate.getTime();
    };

    for (let i = 0; i < 5; i++) {
        const program: Program = {
            name: faker.company.name(),
            description: faker.lorem.sentence(),
            host: faker.person.fullName(),
            genre: faker.helpers.arrayElement(['News', 'Music', 'Talk Show', 'Sports', 'Documentary']),
        };

        const programDoc = await db.collection('Program').add(program);
        console.log(`Added Program with ID: ${programDoc.id}`);

        for (const day of daysOfWeek) {
            let currentHour = START_HOUR;
            let currentMinute = 0;

            while (currentHour < END_HOUR) {
                const startTime = formatTime(currentHour, currentMinute);
                const startMillis = getTimeInMillis(day, currentHour, currentMinute);

                currentMinute += 30;
                if (currentMinute === 60) {
                    currentMinute = 0;
                    currentHour += 1;
                }
                const endTime = formatTime(currentHour, currentMinute);
                const endMillis = getTimeInMillis(day, currentHour, currentMinute);

                const scheduleEntry: Schedule = {
                    dayOfWeek: day,
                    startTime,
                    endTime,
                    startTimeInMilliseconds: startMillis,
                    endTimeInMilliseconds: endMillis,
                    programId: programDoc.id,
                };

                await db.collection('Schedule').add(scheduleEntry);
                console.log(`Added Schedule for ${program.name} on ${day} from ${startTime} to ${endTime}`);
            }
        }
    }
}

createProgramAndSchedule();

// Example usage: Generate 10 podcasts with 5 episodes each
// createFakePodcastData(10, 5);




//Example usage:  Creates 10 fake team members.
// createFakeTeamMembers(10)
//     .then(() => process.exit(0))
//     .catch(err => {
//         console.error("An unexpected error occurred:", err);
//         process.exit(1);
//     });



//Example usage:  Creates a fake company.
// createCompany()
//     .then(() => process.exit(0))
//     .catch(err => {
//         console.error("An unexpected error occurred:", err);
//         process.exit(1);
//     });

